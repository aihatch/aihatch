const { Agent, CreateTool } = require("@auipage/agent/dist/index");
const Model = require("./model");

// 文件系统与终端工具集
const read = require("./tools/read");
const write = require("./tools/write");
const edit = require("./tools/edit");
const bash = require("./tools/bash");
const grep = require("./tools/grep");
const find = require("./tools/find");
const ls = require("./tools/ls");

module.exports = function (ms, data) {

    let ct = new CreateTool(ms);

    new Agent({
        stream: true,
        model: Model.getSelected(),
        tools: [

            // 公共工具
            ct.create(read),
            ct.create(write),
            ct.create(edit),
            ct.create(bash),
            ct.create(grep),
            ct.create(find),
            ct.create(ls),

            // 独有工具
            ...data.tools.map((tool) => ct.create(tool))
        ],
        systemPrompt: "",
    }).generate(data.messages, void 0, function thinkback(text) {
        ms.send({
            type: "thinking",
            text,
        });
    }).then(function (result) {
        ms.send({
            type: "text",
            text: result,
        });
        ms.end();
    });

};