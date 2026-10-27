const fs = require("fs");
const os = require("os");
const path = require("path");
const { readJSON, writeJSON } = require("oipage/nodejs/disk/index.js");

// 历史记录文件路径：~/.aihatch/history
const historyPath = path.join(os.homedir(), ".aihatch", "history");

// 默认历史记录
const defaultHistory = {
    threads: [],
    messages: {}
};

// 读取历史记录：文件存在则使用，不存在先写入默认值
function read() {
    if (fs.existsSync(historyPath)) {
        const data = readJSON(historyPath);
        if (data && Array.isArray(data.threads)) {
            return {
                threads: data.threads,
                messages: data.messages || {}
            };
        }
    } else {
        // 文件不存在，先写入默认值
        writeJSON(historyPath, defaultHistory);
    }
    // 文件内容异常或刚写入默认时，返回默认值
    return JSON.parse(JSON.stringify(defaultHistory));
}

// 写入历史记录
function save(history) {
    writeJSON(historyPath, history);
}

module.exports = { historyPath, read, save };
