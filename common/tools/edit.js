const { readPlain, writePlain } = require("oipage/nodejs/disk/index.js");
const { existsSync, statSync } = require("fs");
const workspace = require("../workspace");

module.exports = {
    description: {
        type: "function",
        function: {
            name: "edit",
            description: "精确替换文件中的某段内容。通过 oldString 定位要修改的文本，用 newString 替换。要求 oldString 与文件中的内容完全一致（包括缩进和换行）。若 oldString 在文件中出现多次，需要提供更长的上下文使其唯一，或设置 replaceAll 为 true 替换全部。",
            parameters: {
                type: "object",
                properties: {
                    filepath: {
                        type: "string",
                        description: "需要修改的文件路径",
                    },
                    oldString: {
                        type: "string",
                        description: "需要被替换的原文本，必须与文件中内容完全一致（包括缩进和换行）",
                    },
                    newString: {
                        type: "string",
                        description: "替换后的新文本",
                    },
                    replaceAll: {
                        type: "boolean",
                        description: "是否替换所有匹配项，默认为 false。当 oldString 在文件中不唯一时需设置为 true",
                    }
                },
                required: ["filepath", "oldString", "newString"],
            },
        },
    },
    execute: async function (args) {
        const filepath = workspace.resolve(args.filepath);
        if (!existsSync(filepath)) {
            throw new Error("文件不存在：" + filepath);
        }
        if (statSync(filepath).isDirectory()) {
            throw new Error("路径是一个目录，不能编辑：" + filepath);
        }

        const content = readPlain(filepath);
        const count = content.split(args.oldString).length - 1;

        if (count === 0) {
            throw new Error("oldString 在文件中未找到，请检查内容是否完全一致（包括缩进和换行）");
        }
        if (count > 1 && !args.replaceAll) {
            throw new Error("oldString 在文件中出现 " + count + " 次，不唯一。请提供更长的上下文使其唯一，或设置 replaceAll 为 true");
        }

        let newContent;
        if (args.replaceAll) {
            newContent = content.split(args.oldString).join(args.newString);
        } else {
            newContent = content.replace(args.oldString, args.newString);
        }

        writePlain(filepath, newContent);
        return "文件修改成功：" + filepath + "（替换了 " + (args.replaceAll ? count : 1) + " 处）";
    }
};
