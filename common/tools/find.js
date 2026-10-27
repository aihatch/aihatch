const { readdirSync, lstatSync, existsSync } = require("fs");
const { join } = require("path");
const workspace = require("../workspace");

const SKIP_DIRS = ["node_modules", ".git", "dist", "build", ".cache"];

function walk(dir, regex, results, maxResults) {
    if (results.length >= maxResults) return;
    let entries;
    try {
        entries = readdirSync(dir);
    } catch (e) {
        return;
    }
    for (const name of entries) {
        if (results.length >= maxResults) return;
        const fullPath = join(dir, name);
        let stat;
        try {
            stat = lstatSync(fullPath);
        } catch (e) {
            continue;
        }
        if (stat.isDirectory()) {
            if (name.startsWith(".") || SKIP_DIRS.includes(name)) continue;
            walk(fullPath, regex, results, maxResults);
        } else if (stat.isFile()) {
            if (regex.test(name)) {
                results.push(fullPath);
            }
        }
    }
}

module.exports = {
    description: {
        type: "function",
        function: {
            name: "find",
            description: "按文件名搜索文件（支持正则表达式）。递归搜索指定目录下文件名匹配的文件，返回完整路径。会自动跳过 node_modules、.git、dist 等目录和隐藏目录。",
            parameters: {
                type: "object",
                properties: {
                    pattern: {
                        type: "string",
                        description: "文件名匹配的正则表达式，例如 \\.test\\.ts$ 查找测试文件",
                    },
                    path: {
                        type: "string",
                        description: "搜索的根目录，默认为当前工作目录",
                    }
                },
                required: ["pattern"],
            },
        },
    },
    execute: async function (args) {
        const regex = new RegExp(args.pattern);
        const searchPath = workspace.resolve(args.path);
        const maxResults = 100;
        const results = [];

        if (!existsSync(searchPath)) {
            throw new Error("路径不存在：" + searchPath);
        }

        walk(searchPath, regex, results, maxResults);

        if (results.length === 0) {
            return "未找到匹配文件";
        }
        let text = results.join("\n");
        if (results.length >= maxResults) {
            text += "\n...（结果已达上限 " + maxResults + " 条，请缩小搜索范围或细化 pattern）";
        }
        return text;
    }
};
