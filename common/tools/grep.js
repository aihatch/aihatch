const { readdirSync, readFileSync, lstatSync, existsSync } = require("fs");
const { join } = require("path");
const workspace = require("../workspace");

// 跳过这些目录以避免无意义搜索
const SKIP_DIRS = ["node_modules", ".git", "dist", "build", ".cache"];

function walk(dir, regex, includeRegex, results, maxResults) {
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
            walk(fullPath, regex, includeRegex, results, maxResults);
        } else if (stat.isFile()) {
            if (includeRegex && !includeRegex.test(name)) continue;
            let content;
            try {
                content = readFileSync(fullPath, { encoding: "utf8" });
            } catch (e) {
                continue;
            }
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
                if (results.length >= maxResults) return;
                if (regex.test(lines[i])) {
                    results.push(fullPath + ":" + (i + 1) + ": " + lines[i].trim());
                }
            }
        }
    }
}

module.exports = {
    description: {
        type: "function",
        function: {
            name: "grep",
            description: "在文件中搜索文本（支持正则表达式）。递归搜索指定目录下的所有文件，返回匹配的行及文件路径与行号。会自动跳过 node_modules、.git、dist 等目录和隐藏目录。",
            parameters: {
                type: "object",
                properties: {
                    pattern: {
                        type: "string",
                        description: "搜索的正则表达式或文本",
                    },
                    path: {
                        type: "string",
                        description: "搜索的目录或文件路径，默认为当前工作目录",
                    },
                    include: {
                        type: "string",
                        description: "只搜索文件名匹配此正则的文件，例如 \\.ts$ 只搜索 ts 文件",
                    }
                },
                required: ["pattern"],
            },
        },
    },
    execute: async function (args) {
        const regex = new RegExp(args.pattern);
        const includeRegex = args.include ? new RegExp(args.include) : null;
        const searchPath = workspace.resolve(args.path);
        const maxResults = 100;
        const results = [];

        if (!existsSync(searchPath)) {
            throw new Error("路径不存在：" + searchPath);
        }

        if (lstatSync(searchPath).isFile()) {
            if (!includeRegex || includeRegex.test(searchPath)) {
                const content = readFileSync(searchPath, { encoding: "utf8" });
                const lines = content.split("\n");
                for (let i = 0; i < lines.length && results.length < maxResults; i++) {
                    if (regex.test(lines[i])) {
                        results.push(searchPath + ":" + (i + 1) + ": " + lines[i].trim());
                    }
                }
            }
        } else {
            walk(searchPath, regex, includeRegex, results, maxResults);
        }

        if (results.length === 0) {
            return "未找到匹配内容";
        }
        let text = results.join("\n");
        if (results.length >= maxResults) {
            text += "\n...（结果已达上限 " + maxResults + " 条，请缩小搜索范围或细化 pattern）";
        }
        return text;
    }
};
