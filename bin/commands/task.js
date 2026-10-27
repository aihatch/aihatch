'use strict';

const { MessageStream } = require("@auipage/core/dist/index");
const Agent = require("../../common/index");
const { C, SEP, printBanner, startSpinner, stopSpinner } = require("../ui");

module.exports = function runTask() {

    const userInput = process.argv[3];

    if (!userInput) {
        printBanner();
        console.log(`${C.yellow}⚠ 请提供任务内容${C.reset}`);
        console.log(`${C.gray}用法: aihatch-cli -t "你的问题"${C.reset}`);
        process.exit(1);
    }

    printBanner();

    // 回显用户输入
    console.log(`${C.bold}🙋 你${C.reset} ${C.gray}>${C.reset} ${C.cyan}${userInput}${C.reset}`);
    console.log();

    let preType = "";
    let firstEvent = true;

    startSpinner("正在思考...");

    let ms = new MessageStream(function (value) {

        // 首个事件到达时停止加载动画
        if (firstEvent) {
            stopSpinner();
            firstEvent = false;
        }

        // 工具调用事件：按状态逐条展示
        if (value.type === "tool-call") {
            // 从流式文本切换到工具调用时，补一个换行避免挤在同一行
            if (value.status === "pending" && preType && preType !== "tool-call") {
                process.stdout.write("\n");
            }
            if (value.status === "pending") {
                const argsStr = value.args && Object.keys(value.args).length
                    ? JSON.stringify(value.args)
                    : "{}";
                console.log(`${C.gray}  🔧 调用工具${C.reset} ${C.yellow}${value.name}${C.reset} ${C.gray}${argsStr}${C.reset}`);
            } else if (value.status === "success") {
                console.log(`${C.gray}  └─${C.reset} ${C.green}✅ 完成${C.reset}`);
            } else if (value.status === "error") {
                const err = value.result && value.result.message
                    ? value.result.message
                    : (value.result || "未知错误");
                console.log(`${C.gray}  └─${C.reset} ${C.red}❌ 失败：${err}${C.reset}`);
            }
            preType = "tool-call";
            return;
        }

        // 文本类事件：按类型切换分区
        if (preType !== value.type) {
            preType = value.type;
            if (value.type === "thinking") {
                process.stdout.write(`${C.gray}💭 思考过程${C.reset}\n${C.dim}`);
            } else if (value.type === "text") {
                process.stdout.write(`${C.reset}\n${C.bold}💬 回答${C.reset}\n`);
            }
        }

        if (value.type === "thinking") {
            process.stdout.write(value.text);
        } else if (value.type === "text") {
            process.stdout.write(value.text);
        }

    }, function () {
        stopSpinner();
        preType = "";
        process.stdout.write(C.reset);
        console.log();
        console.log(`${C.gray}${SEP}${C.reset}`);
    });

    Agent(ms, {
        messages: [{
            role: 'user', content: [{
                type: 'text',
                text: userInput
            }]
        }], tools: []
    });
};