const { execSync } = require("child_process");
const workspace = require("../workspace");

module.exports = {
    description: {
        type: "function",
        function: {
            name: "bash",
            description: "执行 shell 命令并返回输出。用于运行测试、安装依赖、执行 lint、git 操作等。命令默认在当前工作目录执行，失败时会返回退出码和 stderr 帮助排查。",
            parameters: {
                type: "object",
                properties: {
                    command: {
                        type: "string",
                        description: "需要执行的 shell 命令",
                    },
                    cwd: {
                        type: "string",
                        description: "命令执行的工作目录，默认为当前工作目录",
                    }
                },
                required: ["command"],
            },
        },
    },
    execute: async function (args) {
        try {
            const output = execSync(args.command, {
                cwd: args.cwd || workspace.get(),
                encoding: "utf8",
                timeout: 120000,
                maxBuffer: 10 * 1024 * 1024,
                stdio: ["pipe", "pipe", "pipe"]
            });
            return output || "(命令执行完成，无输出)";
        } catch (error) {
            const stderr = error.stderr ? error.stderr.toString() : "";
            const stdout = error.stdout ? error.stdout.toString() : "";
            throw new Error("命令执行失败（退出码 " + error.status + "）\nstdout: " + stdout + "\nstderr: " + stderr);
        }
    }
};
