const { ipcMain, app, Menu, shell } = require("electron");

let isFullScreen = false;
module.exports = function (win) {

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);   // 所有 target="_blank" 的链接都走默认浏览器
        return { action: 'deny' }; // 阻止 Electron 新开窗口
    });

    // 退出
    ipcMain.on("exit", function () {
        app.quit();
    });

    // 最小化
    ipcMain.on("minimize", () => {
        win.minimize();
    });

    // 最大化
    ipcMain.on("maximize", () => {
        win.maximize();
    });

    // 进入全屏
    win.on("enter-full-screen", () => {
        isFullScreen = true;
    });

    // 离开全屏
    win.on("leave-full-screen", () => {
        isFullScreen = false;
    });

    win.on("focus", () => {
        /**
         * 菜单管理
         */

        let menuTemplate = [{
            label: 'aihatch',
            submenu: [{
                label: '关闭',
                accelerator: 'CmdOrCtrl+Q',
                click: () => {
                    app.quit();
                }
            }]
        }, {
            label: "编辑",
            submenu: [{
                label: '复制',
                role: 'copy'
            }, {
                label: '剪切',
                role: 'cut'
            }, {
                label: '粘贴',
                role: 'paste'
            }, {
                label: '全选',
                role: 'selectall'
            }]
        }, {
            label: "编辑操作",
            submenu: [{
                label: '全屏控制',
                accelerator: process.platform == 'darwin' ? 'CmdOrCtrl+Alt+F' : 'F11',
                click: () => {
                    win.setFullScreen(!isFullScreen);
                }
            }]
        }];

        if (process.env.NODE_ENV == 'development') {
            menuTemplate.push({
                label: "开发",
                submenu: [{
                    label: '页面检查器',
                    accelerator: process.platform == 'darwin' ? 'CmdOrCtrl+Alt+I' : 'F12',
                    click: () => {
                        win.webContents.toggleDevTools();
                    }
                }]
            });
        }

        Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
    });

};