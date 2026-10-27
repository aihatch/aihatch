const { readFileSync, existsSync, statSync } = require("fs");
const workspace = require("../workspace");

module.exports = {
    description: {
        type: "function",
        function: {
            name: "read",
            description: "读取文本文件的内容，用于查看源码、配置等文本文件。如果文件不存在或路径是目录会返回错误。",
            parameters: {
                type: "object",
                properties: {
                    filepath: {
                        type: "string",
                        description: "需要读取的文件路径，支持绝对路径或相对于当前工作目录的路径",
                    }
                },
                required: ["filepath"],
            },
        },
    },
    execute: async function (args) {
        const filepath = workspace.resolve(args.filepath);
        if (!existsSync(filepath)) {
            throw new Error("文件不存在：" + filepath);
        }
        if (statSync(filepath).isDirectory()) {
            throw new Error("路径是一个目录，不能读取，请改用 ls 工具：" + filepath);
        }
        return readFileSync(filepath, { encoding: "utf8" });
    }
};
