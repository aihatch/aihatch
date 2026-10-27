const fs = require("fs");
const os = require("os");
const path = require("path");
const { readJSON, writeJSON } = require("oipage/nodejs/disk/index.js");

// 模型配置文件路径：~/.aihatch/model
const modelConfigPath = path.join(os.homedir(), ".aihatch", "model");

// 默认模型配置
const defaultModelConfig = [{
    config: {
        baseURL: "http://127.0.0.1:11434/v1",
        apiKey: "",
        model: "qwen3.5",
    },
    select: true,
}];

// 读取配置：文件存在则使用，不存在先写入默认值
function read() {
    if (fs.existsSync(modelConfigPath)) {
        const data = readJSON(modelConfigPath);
        if (Array.isArray(data) && data.length > 0) {
            return data;
        }
    } else {
        // 文件不存在，先写入默认值
        writeJSON(modelConfigPath, defaultModelConfig);
    }
    // 文件内容异常或刚写入默认时，返回默认配置
    return JSON.parse(JSON.stringify(defaultModelConfig));
}

// 写入配置
function save(list) {
    writeJSON(modelConfigPath, list);
}

// 校验模型配置
function valid(config) {
    return !!(config && typeof config.baseURL === "string" && config.baseURL &&
        typeof config.model === "string" && config.model);
}

// 校验索引
function checkIndex(list, index) {
    if (!Number.isInteger(index) || index < 0 || index >= list.length) {
        throw new Error("索引不存在: " + index);
    }
}

// 查看模型配置列表
function list() {
    return read();
}

// 新增模型配置
function add(config) {
    if (!valid(config)) {
        throw new Error("配置格式错误，需要包含 baseURL 和 model");
    }
    const configs = read();
    configs.push({ config, select: false });
    save(configs);
    return configs;
}

// 修改模型配置
function update(index, config) {
    if (!valid(config)) {
        throw new Error("配置格式错误，需要包含 baseURL 和 model");
    }
    const configs = read();
    checkIndex(configs, index);
    configs[index].config = config;
    save(configs);
    return configs;
}

// 切换选中的模型配置
function select(index) {
    const configs = read();
    checkIndex(configs, index);
    configs.forEach((item, i) => {
        item.select = i === index;
    });
    save(configs);
    return configs;
}

// 删除模型配置
function remove(index) {
    let configs = read();
    checkIndex(configs, index);
    const isSelected = !!configs[index].select;
    configs.splice(index, 1);

    // 删除后为空，重置为默认配置
    if (configs.length === 0) {
        configs = JSON.parse(JSON.stringify(defaultModelConfig));
    }
    // 删除的是选中项，自动选中第一项
    else if (isSelected && !configs.some((item) => item.select)) {
        configs[0].select = true;
    }

    save(configs);
    return configs;
}

// 获取当前选中的模型配置
function getSelected() {
    const configs = read();
    const selectItem = configs.find((item) => item && item.select) || configs[0] || defaultModelConfig[0];
    return selectItem.config;
}

// 启动时确保配置文件存在
read();

module.exports = { modelConfigPath, list, add, update, select, remove, getSelected };
