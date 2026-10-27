'use strict';

const { version } = require("../package.json");

// ANSI 颜色与样式
const C = {
    reset: "\x1b[0m",
    dim: "\x1b[2m",
    bold: "\x1b[1m",
    cyan: "\x1b[36m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    gray: "\x1b[90m",
    magenta: "\x1b[35m",
};

// 分隔线宽度
const SEP = "─".repeat(48);

// 加载动画帧（盲文点阵旋转）
const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

// 打印横幅
function printBanner() {
    console.log(`${C.gray}┌${SEP}┐${C.reset}`);
    console.log(`${C.gray}│${C.reset}  ${C.bold}🤖 aihatch${C.reset} ${C.gray}v${version}${C.reset}  ${C.gray}· 你的日常 AI 助手${C.reset}`);
    console.log(`${C.gray}└${SEP}┘${C.reset}`);
}

// 加载动画控制
let spinnerIdx = 0;
let spinnerTimer = null;

function startSpinner(label) {
    if (spinnerTimer) return;
    spinnerTimer = setInterval(() => {
        process.stdout.write(`\r${C.magenta}${SPINNER[spinnerIdx]}${C.reset} ${C.gray}${label}${C.reset}`);
        spinnerIdx = (spinnerIdx + 1) % SPINNER.length;
    }, 80);
}

function stopSpinner() {
    if (spinnerTimer) {
        clearInterval(spinnerTimer);
        spinnerTimer = null;
        process.stdout.write("\r\x1b[K"); // 清除当前行
    }
}

module.exports = { C, SEP, printBanner, startSpinner, stopSpinner };