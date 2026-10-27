'use strict';

const Model = require("../../common/model");
const { C, printBanner } = require("../ui");

// 查看模型列表
function list() {
    const configs = Model.list();
    if (configs.length === 0) {
        console.log(`${C.gray}暂无模型配置${C.reset}`);
    } else {
        console.log(`${C.bold}📋 模型列表${C.reset}`);
        configs.forEach((item, index) => {
            const cfg = item.config || {};
            const isSelect = !!item.select;
            console.log(
                ` ${isSelect ? C.green + "*" : " "} [${index}]${C.reset} ` +
                `${C.yellow}${cfg.model || "-"}${C.reset} ` +
                `${C.gray}${cfg.baseURL || "-"}${C.reset} ` +
                `${C.gray}${cfg.apiKey ? "key:***" : "key:-"}${C.reset}` +
                `${isSelect ? C.green + "  ← 当前使用" + C.reset : ""}`
            );
        });
    }
}

// 新增模型
function add() {
    const baseURL = process.argv[4];
    const apiKey = process.argv[5];
    const model = process.argv[6];
    if (!baseURL || !model || baseURL === "-" || model === "-") {
        throw new Error('用法: aihatch-cli model add <baseURL> <apiKey> <model>，"-" 表示空');
    }
    Model.add({
        baseURL,
        apiKey: (apiKey === "-" || apiKey === undefined) ? "" : apiKey,
        model
    });
    console.log(`${C.green}✅ 新增成功${C.reset}`);
}

// 修改模型
function update() {
    const index = parseInt(process.argv[4], 10);
    const configs = Model.list();
    const old = (configs[index] && configs[index].config) || {};
    const keep = (value, old_value) => (value === "-" || value === undefined ? old_value : value);
    const baseURL = keep(process.argv[5], old.baseURL);
    const apiKey = keep(process.argv[6], old.apiKey);
    const model = keep(process.argv[7], old.model);
    if (!baseURL || !model) {
        throw new Error('baseURL 和 model 不能为空，"-" 表示保留原值');
    }
    Model.update(index, { baseURL, apiKey, model });
    console.log(`${C.green}✅ 修改成功${C.reset}`);
}

// 切换使用的模型
function use() {
    Model.select(parseInt(process.argv[4], 10));
    const cfg = Model.getSelected();
    console.log(`${C.green}✅ 已切换使用: ${cfg.model}${C.reset} ${C.gray}(${cfg.baseURL})${C.reset}`);
}

// 删除模型
function remove() {
    Model.remove(parseInt(process.argv[4], 10));
    console.log(`${C.green}✅ 删除成功${C.reset}`);
}

// 用法
function usage() {
    console.log(`${C.bold}模型管理用法：${C.reset}`);
    console.log(`  ${C.green}aihatch-cli model list${C.reset}  查看模型列表`);
    console.log(`  ${C.green}aihatch-cli model add <baseURL> <apiKey> <model>${C.reset}  新增模型（"-" 表示空）`);
    console.log(`  ${C.green}aihatch-cli model update <index> <baseURL> <apiKey> <model>${C.reset}  修改模型（"-" 表示保留原值）`);
    console.log(`  ${C.green}aihatch-cli model use <index>${C.reset}  切换使用的模型`);
    console.log(`  ${C.green}aihatch-cli model delete <index>${C.reset}  删除模型`);
}

module.exports = function runModel() {

    printBanner();

    const action = process.argv[3];

    const handlers = {
        list,
        add,
        update,
        use,
        delete: remove,
    };

    try {
        const handler = handlers[action] || usage;
        handler();
    } catch (e) {
        console.log(`${C.red}❌ ${e.message}${C.reset}`);
        process.exit(1);
    }

    process.exit(0);
};