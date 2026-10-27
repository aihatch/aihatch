const { readdirSync, lstatSync, existsSync, statSync } = require("fs");
const { join } = require("path");
const workspace = require("../workspace");

module.exports = {
    description: {
        type: "function",
        function: {
            name: "ls",
            description: "列出目录中的文件和子目录，返回名称、类型和大小信息，用于查看目录结构、定位模块。",
            parameters: {
                type: "object",
                properties: {
                    path: {
                        type: "string",
                        description: "需要列出的目录路径，默认为当前工作目录",
                    }
                },
                required: [],
            },
        },
    },
    execute: async function (args) {
        const dir = workspace.resolve(args.path);
        if (!existsSync(dir)) {
            throw new Error("路径不存在：" + dir);
        }
        if (!statSync(dir).isDirectory()) {
            throw new Error("路径不是目录：" + dir);
        }

        const entries = readdirSync(dir);
        const items = entries.map(name => {
            const fullPath = join(dir, name);
            let stat;
            try {
                stat = lstatSync(fullPath);
            } catch (e) {
                return { name, type: "unknown", size: 0 };
            }
            return {
                name,
                type: stat.isDirectory() ? "directory" : "file",
                size: stat.size
            };
        });

        // 目录排在前面，便于阅读
        items.sort((a, b) => {
            if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        return items;
    }
};
