const os = require("os");
const path = require("path");
const fs = require("fs");
const { readPlain, writePlain } = require("oipage/nodejs/disk/index.js");

// 工作目录配置文件路径：~/.aihatch/workspace
const workspaceConfigPath = path.join(os.homedir(), ".aihatch", "workspace");

// 工作目录模式：
//   "persistent" 持久化（APP 端：保存到 ~/.aihatch/workspace，默认桌面）
//   "cwd"        跟随命令行当前目录（CLI 端：每次都取 process.cwd()）
let mode = "persistent";

// 默认工作目录：桌面
function defaultWorkspace() {
    try {
        const { app } = require("electron");
        if (app && typeof app.getPath === "function") {
            return app.getPath("desktop");
        }
    } catch (e) { }
    const desk = path.join(os.homedir(), "Desktop");
    return fs.existsSync(desk) ? desk : os.homedir();
}

// 读取当前工作目录
function get() {
    if (mode === "cwd") return process.cwd();
    const p = readPlain(workspaceConfigPath).trim();
    return p ? p : defaultWorkspace();
}

// 设置工作目录并持久化（仅 persistent 模式生效，cwd 模式下为 no-op）
function set(p) {
    if (mode === "cwd") return get();
    writePlain(workspaceConfigPath, p || "");
    return get();
}

// 把路径解析为相对于工作目录的绝对路径（绝对路径保持不变，空值返回工作目录）
function resolve(p) {
    if (!p) return get();
    return path.isAbsolute(p) ? p : path.join(get(), p);
}

// 切换为命令行模式：每次都取 process.cwd()，不会读写持久化文件
function useCwd() {
    mode = "cwd";
}

// 切换回持久化模式（恢复 APP 端行为）
function usePersistent() {
    mode = "persistent";
}

// 启动时确保配置文件存在
if (!fs.existsSync(workspaceConfigPath)) {
    writePlain(workspaceConfigPath, defaultWorkspace());
}

module.exports = { get, set, resolve, defaultWorkspace, useCwd, usePersistent };
