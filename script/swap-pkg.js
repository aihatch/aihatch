#!/usr/bin/env node
// npm publish 前修改 package.json，发布后自动恢复
// 用法：node ./script/swap-pkg.js --mode=publish | --mode=restore
//
// 想调整发布时的处理逻辑，只改下面的 CONFIG 即可：
//   REMOVE_KEYS  - publish 时删除、restore 时还原（这些字段在发布包里不需要）
//   SET_VALUES   - publish 时设为指定值、restore 时还原（适用于发布时需要覆盖的字段，例如 main）
const fs = require('fs');
const path = require('path');

const { deleteDisk, readJSON, writeJSON } = require("oipage/nodejs/disk/index.js");
const existsSync = fs.existsSync;

const CONFIG = {
    // 顶层 key：publish 时整段删除，restore 时还原
    REMOVE_KEYS: ['build', 'devDependencies'],
    // publish 时把这些字段设为指定值，restore 时还原
    SET_VALUES: {
        main: 'bin/index.js',
    },
    // scripts 下的子 key：publish 时只删除这些脚本命令（不删其他脚本）
    REMOVE_SCRIPTS: ["dev", "build"],
};

const pkgPath = path.resolve(__dirname, '..', 'package.json');
// 备份文件存放位置：./node_modules/.cache/local/swap-pkg.backup.json
const backupPath = path.resolve(__dirname, '..', 'node_modules', '.cache', 'local', 'swap-pkg.backup.json');

function parseArgs(argv) {
    const arg = argv.find(a => typeof a === 'string' && a.startsWith('--mode='));
    return arg ? arg.split('=')[1] : null;
}

function readPkg() {
    try {
        const data = readJSON(pkgPath);
        if (!data || typeof data !== 'object') {
            return { ok: false, error: new Error('package.json 内容为空或解析失败') };
        }
        return { ok: true, data };
    } catch (err) {
        return { ok: false, error: err };
    }
}

function writePkg(pkg) {
    try {
        // 显式保留 2 空格缩进 + 末尾换行，和仓库现有格式保持一致
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err };
    }
}

function readBackup() {
    if (!existsSync(backupPath)) return null;
    const data = readJSON(backupPath);
    return data && typeof data === 'object' ? data : null;
}

function writeBackup(data) {
    try {
        writeJSON(backupPath, data);
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err };
    }
}

function clearBackup() {
    try {
        if (existsSync(backupPath)) {
            deleteDisk(backupPath);
        }
    } catch (err) {
        // 清理失败不影响主流程，仅记录
        console.warn(`[swap-pkg] 清理备份文件失败：${err.message}`);
    }
}

// 收集配置中涉及到的所有 key（REMOVE_KEYS + SET_VALUES 的键）
function collectKeys() {
    const remove = CONFIG.REMOVE_KEYS || [];
    const set = Object.keys(CONFIG.SET_VALUES || {});
    return Array.from(new Set([...remove, ...set]));
}

function backupKeys(pkg, keys) {
    // 防御：如果上一次 publish 残留了备份文件（比如 publish 失败、postpublish 未执行），
    // 以磁盘当前值为准，避免把过期值反复写入。
    const backup = {};
    for (const key of keys) {
        // 用 hasOwnProperty 判断，避免把 undefined 误当成"无备份"
        if (Object.prototype.hasOwnProperty.call(pkg, key)) {
            backup[key] = pkg[key];
        }
    }

    const removeScripts = CONFIG.REMOVE_SCRIPTS || [];
    const backupScripts = {};
    if (removeScripts.length && pkg.scripts) {
        for (const key of removeScripts) {
            if (Object.prototype.hasOwnProperty.call(pkg.scripts, key)) {
                backupScripts[key] = pkg.scripts[key];
            }
        }
    }

    const writeResult = writeBackup({ keys: backup, scripts: backupScripts });
    if (!writeResult.ok) {
        throw new Error(`写入备份文件失败：${writeResult.error.message}`);
    }
}

function restoreKeys(pkg) {
    const backup = readBackup();
    if (!backup) return;

    if (backup.keys) {
        for (const key of Object.keys(backup.keys)) {
            // 还原 publish 时被改写或删除的字段
            if (Object.prototype.hasOwnProperty.call(CONFIG.SET_VALUES || {}, key) ||
                (CONFIG.REMOVE_KEYS || []).includes(key)) {
                pkg[key] = backup.keys[key];
            }
        }
    }

    if (backup.scripts && Object.keys(backup.scripts).length) {
        pkg.scripts = pkg.scripts || {};
        for (const [key, value] of Object.entries(backup.scripts)) {
            pkg.scripts[key] = value;
        }
    }

    clearBackup();
}

function applyPublish(pkg) {
    // 防御：检测到残留的备份文件，说明上一次 publish 后没有正常 restore
    // （比如 publish 失败、postpublish 未执行、被手动中断等）。
    // 此时再执行 publish 会覆盖原备份，导致无法恢复，必须先 restore 再 publish。
    if (existsSync(backupPath)) {
        console.error('\x1b[1m\x1b[31m警告：检测到上一次的备份文件还未清理（' + backupPath.replace(process.cwd(), '.') + '），请先执行 npm run postpublish 后再重试。\x1b[0m');
        process.exit(1);
    }
    backupKeys(pkg, collectKeys());
    // 先删顶层字段
    for (const key of CONFIG.REMOVE_KEYS || []) {
        delete pkg[key];
    }
    // 再覆盖字段
    for (const [key, value] of Object.entries(CONFIG.SET_VALUES || {})) {
        pkg[key] = value;
    }
    // scripts 下指定的子命令删除
    const removeScripts = CONFIG.REMOVE_SCRIPTS || [];
    if (removeScripts.length && pkg.scripts) {
        for (const key of removeScripts) {
            delete pkg.scripts[key];
        }
    }
    return pkg;
}

function applyRestore(pkg) {
    restoreKeys(pkg);
    return pkg;
}

function swap(mode) {
    const handlers = {
        publish: applyPublish,
        restore: applyRestore,
    };
    const handler = handlers[mode];
    if (!handler) {
        console.error('[swap-pkg] 错误：未指定有效的 --mode 参数（需要 publish 或 restore）');
        process.exit(1);
    }

    const readResult = readPkg();
    if (!readResult.ok) {
        console.error(`[swap-pkg] 读取 package.json 失败：${readResult.error.message}`);
        process.exit(1);
    }

    const pkg = handler(readResult.data);

    const writeResult = writePkg(pkg);
    if (!writeResult.ok) {
        console.error(`[swap-pkg] 写入 package.json 失败：${writeResult.error.message}`);
        process.exit(1);
    }

    console.log(`[swap-pkg] ${mode} 完成`);
}

try {
    const mode = parseArgs(process.argv.slice(2));
    swap(mode);
} catch (err) {
    console.error(`[swap-pkg] 未处理异常：${err && err.message ? err.message : err}`);
    process.exit(1);
}
