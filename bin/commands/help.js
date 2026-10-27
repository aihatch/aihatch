'use strict';

const { C, printBanner } = require("../ui");

module.exports = function runHelp() {

    printBanner();
    console.log(`${C.bold}用法：${C.reset}`);
    console.log(`  ${C.green}aihatch-cli -t "你的问题"${C.reset}`);
    console.log(`  ${C.green}aihatch-cli --task "你的问题"${C.reset}`);
    console.log();
    console.log(`${C.bold}模型管理：${C.reset}`);
    console.log(`  ${C.green}aihatch-cli model list${C.reset}  查看模型列表`);
    console.log(`  ${C.green}aihatch-cli model add <baseURL> <apiKey> <model>${C.reset}  新增模型`);
    console.log(`  ${C.green}aihatch-cli model update <index> <baseURL> <apiKey> <model>${C.reset}  修改模型`);
    console.log(`  ${C.green}aihatch-cli model use <index>${C.reset}  切换使用的模型`);
    console.log(`  ${C.green}aihatch-cli model delete <index>${C.reset}  删除模型`);
    console.log();
    console.log(`${C.gray}示例：${C.reset}`);
    console.log(`  ${C.gray}aihatch-cli -t "你是谁"${C.reset}`);
};