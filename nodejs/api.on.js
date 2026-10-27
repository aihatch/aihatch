const { ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { MessageStream } = require("@auipage/core/dist/index");
const Agent = require("../common/index");
const Model = require("../common/model");
const Workspace = require("../common/workspace");
const History = require("./history");

// 启动时加载历史记录：文件存在则使用，不存在先写入默认值
const history = History.read();

// 对话列表
let threadsList = history.threads;

// 对话内容
let messagesMap = history.messages;

// 历史记录变更后保存到磁盘
function saveHistory() {
    History.save({
        threads: threadsList,
        messages: messagesMap
    });
}

module.exports = function (win) {
    ipcMain.on("api:fetch", function (_, data) {

        // 返回请求结果
        function reply(payload) {
            win.webContents.send("api:fetch", {
                eventId: data.eventId,
                event: "end",
                payload
            });
        }

        if (data.url === "/api/threads") {

            // 查询会话列表
            if (data.method === "GET") {
                win.webContents.send("api:fetch", {
                    eventId: data.eventId,
                    event: "end",
                    payload: threadsList
                });
            }

            // 新增新会话
            else if (data.method === "POST") {
                let title = "新会话";
                try {
                    title = data.data.messages[0].content[0].text;
                } catch (e) { }

                let thread = {
                    threadId: new Date().valueOf() + "",
                    title,
                    status: "regular",
                };

                threadsList.unshift(thread);
                messagesMap[thread.threadId] = [];

                saveHistory();

                win.webContents.send("api:fetch", {
                    eventId: data.eventId,
                    event: "end",
                    payload: thread
                });
            }

        }

        else if (/^\/api\/threads\/[^\/]+\/messages/.test(data.url)) {

            let threadId = data.url.split("/")[3];

            // 查询会话消息
            if (data.method === "GET") {
                win.webContents.send("api:fetch", {
                    eventId: data.eventId,
                    event: "end",
                    payload: messagesMap[threadId]
                });
            }

            // 新增会话消息
            else if (data.method === "POST") {
                messagesMap[threadId].push(data.data);

                saveHistory();

                win.webContents.send("api:fetch", {
                    eventId: data.eventId,
                    event: "end",
                    payload: { success: true }
                });
            }

        }

        else if (/^\/api\/threads\/[^\/]+/.test(data.url)) {
            let threadId = data.url.split("/")[3];

            // 修改会话内容
            if (data.method === "PATCH") {
                for (let index = 0; index < threadsList.length; index++) {
                    if (threadsList[index].threadId === threadId) {
                        for (let key in data.data) {
                            threadsList[index][key] = data.data[key];
                        }
                        break;
                    }
                }

                saveHistory();

                win.webContents.send("api:fetch", {
                    eventId: data.eventId,
                    event: "end",
                    payload: { success: true }
                });
            }

            // 删除会话
            else if (data.method === "DELETE") {
                for (let index = 0; index < threadsList.length; index++) {
                    if (threadsList[index].threadId === threadId) {
                        threadsList.splice(index, 1);
                        break;
                    }
                }
                delete messagesMap[threadId];

                saveHistory();

                win.webContents.send("api:fetch", {
                    eventId: data.eventId,
                    event: "end",
                    payload: { success: true }
                });
            }
        }

        // 模型配置列表
        else if (data.url === "/api/models") {

            // 查询模型配置列表
            if (data.method === "GET") {
                reply(Model.list());
            }

            // 新增模型配置，data.data: { baseURL, apiKey, model }
            else if (data.method === "POST") {
                try {
                    reply(Model.add(data.data));
                } catch (e) {
                    reply({ error: e.message });
                }
            }
        }

        // 修改、选中、删除模型配置
        else if (/^\/api\/models\/\d+$/.test(data.url)) {
            let index = parseInt(data.url.split("/")[3], 10);

            // 修改模型配置，data.data: { baseURL, apiKey, model } 或 { select: true }（切换选中）
            if (data.method === "PATCH") {
                try {
                    reply(data.data && data.data.select !== undefined
                        ? Model.select(index)
                        : Model.update(index, data.data));
                } catch (e) {
                    reply({ error: e.message });
                }
            }

            // 删除模型配置
            else if (data.method === "DELETE") {
                try {
                    reply(Model.remove(index));
                } catch (e) {
                    reply({ error: e.message });
                }
            }
        }

        // 工作目录（默认桌面，供文件/终端工具使用）
        else if (data.url === "/api/workspace") {

            // 查询当前工作目录
            if (data.method === "GET") {
                reply(Workspace.get());
            }

            // 打开系统目录选择器，选择后持久化；如果传入了 path，则直接将其作为工作目录（拖拽场景）
            else if (data.method === "POST") {
                let incoming = data.data && typeof data.data.path === "string" ? data.data.path : "";
                if (incoming) {
                    try {
                        let stat = fs.statSync(incoming);
                        let target = stat.isDirectory() ? incoming : path.dirname(incoming);
                        Workspace.set(target);
                    } catch (e) {
                        // 路径无效时忽略，沿用当前工作目录
                    }
                    reply(Workspace.get());
                } else {
                    dialog.showOpenDialog(win, { properties: ["openDirectory"] }).then((result) => {
                        if (!result.canceled && result.filePaths && result.filePaths[0]) {
                            Workspace.set(result.filePaths[0]);
                        }
                        reply(Workspace.get());
                    }).catch(() => {
                        reply(Workspace.get());
                    });
                }
            }
        }

        // 新任务
        else if (data.url === "/api/chat") {

            // 和页面的消息发送对象
            let ms = new MessageStream(function (value) {
                win.webContents.send("api:fetch", {
                    eventId: data.eventId,
                    event: "data",
                    payload: value
                });
            }, function () {
                win.webContents.send("api:fetch", {
                    eventId: data.eventId,
                    event: "end"
                });
            });

            Agent(ms, data.data);
        }

        // 前端工具调用响应
        else if (data.url === "/api/chat/tool-result") {
            if (globalThis[data.data.id]) {
                globalThis[data.data.id](data.data.result);
                delete globalThis[data.data.id];
            }

            win.webContents.send("api:fetch", {
                eventId: data.eventId,
                event: "end",
                payload: { success: true }
            });
        }

    });
};