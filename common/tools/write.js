const { writePlain } = require("oipage/nodejs/disk/index.js");
const workspace = require("../workspace");

module.exports = {
    description: {
        type: "function",
        function: {
            name: "write",
            description: "创建或覆盖一个文件。会自动创建不存在的父目录。如果文件已存在，原有内容会被完整覆盖，请确保传入完整的文件内容。",
            parameters: {
                type: "object",
                properties: {
                    filepath: {
                        type: "string",
                        description: "需要写入的文件路径，支持绝对路径或相对于当前工作目录的路径",
                    },
                    content: {
                        type: "string",
                        description: "需要写入的完整文件内容",
                    }
                },
                required: ["filepath", "content"],
            },
        },
    },
    execute: async function (args) {
        const filepath = workspace.resolve(args.filepath);
        writePlain(filepath, args.content);
        return "文件写入成功：" + filepath + "（" + args.content.length + " 字符）";
    }
};
