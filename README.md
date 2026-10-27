# [aihatch](https://github.com/aihatch/aihatch)
简单好用的日常生活&办公助手，基于AI技术，提供智能化的功能和服务

<p>
    <a href="https://github.com/aihatch/aihatch/issues">
        <img src="https://img.shields.io/github/issues/aihatch/aihatch" alt="issue">
    </a>
    <a href="https://github.com/aihatch/aihatch" target='_blank'>
        <img alt="GitHub repo stars" src="https://img.shields.io/github/stars/aihatch/aihatch?style=social">
    </a>
    <a href="https://github.com/aihatch/aihatch">
        <img src="https://img.shields.io/github/forks/aihatch/aihatch" alt="forks">
    </a>
     <a href="https://gitee.com/aihatch/aihatch" target='_blank'>
        <img alt="Gitee repo stars" src="https://gitee.com/aihatch/aihatch/badge/star.svg">
    </a>
    <a href="https://gitee.com/aihatch/aihatch">
        <img src="https://gitee.com/aihatch/aihatch/badge/fork.svg" alt="forks">
    </a>
</p>

## 使用说明

### 1. 安装

```bash
# 克隆代码
git clone https://github.com/aihatch/aihatch.git
cd aihatch

# 安装依赖
npm install
```

### 2. 桌面端（Electron 应用）

桌面应用支持日常聊天、模型管理等可视化操作。

#### 开发模式

```bash
npm run dev
```

启动后会同时拉起 Webpack DevServer（默认 `http://localhost:3000`）和 Electron 窗口，可在开发工具中实时调试。

#### 打包构建

```bash
npm run build
```

执行后会：

1. 通过 Webpack 打包前端资源到 `dist/`；
2. 调用 `electron-builder` 生成安装包，输出到 `release/` 目录：
   - macOS：`.dmg`
   - Windows：`.exe`（NSIS 安装器）

> 构建产物中会自动包含图标、preload、main 入口等文件，详见 `package.json` 中的 `build` 字段。

### 3. 命令行（aihatch-cli）

除了桌面端，本项目还提供命令行工具 `aihatch-cli`，可在终端中直接向 AI 提问。

#### 全局安装（推荐）

```bash
npm install -g aihatch
```

安装后即可在任意目录使用 `aihatch-cli` 命令。

#### 帮助

```bash
aihatch-cli
```

不传任何参数时，会打印如下帮助信息：

```text
用法：
  aihatch-cli -t "你的问题"
  aihatch-cli --task "你的问题"

模型管理：
  aihatch-cli model list
  aihatch-cli model add <baseURL> <apiKey> <model>
  aihatch-cli model update <index> <baseURL> <apiKey> <model>
  aihatch-cli model use <index>
  aihatch-cli model delete <index>

示例：
  aihatch-cli -t "你是谁"
```

#### 执行任务

```bash
aihatch-cli -t "用 JavaScript 写一个快速排序"
# 或
aihatch-cli --task "用 JavaScript 写一个快速排序"
```

执行后会：

1. 回显用户输入；
2. 显示「正在思考…」加载动画；
3. 实时打印 AI 的思考过程、工具调用和最终回答；
4. 工具调用会按 `pending / success / error` 三种状态分阶段展示。

#### 模型管理

```bash
# 查看已配置的模型列表（带 * 标记的为当前使用）
aihatch-cli model list

# 新增模型（"-" 表示空字符串）
aihatch-cli model add https://api.openai.com/v1 sk-xxxxxxx gpt-4o-mini
aihatch-cli model add https://api.openai.com/v1 - gpt-4o-mini   # 无 apiKey 时用占位

# 修改已有模型（"-" 表示保留原值）
aihatch-cli model update 0 - sk-newkey -

# 切换当前使用的模型（按列表下标）
aihatch-cli model use 0

# 删除模型
aihatch-cli model delete 0
```

模型配置默认持久化在用户目录 `~/.aihatch/workspace` 下，可在桌面端的「模型管理」中查看和调整。

### 4. 目录结构

```
aihatch/
├── bin/                # 命令行入口（aihatch-cli）
│   ├── commands/       # 子命令实现：help、task、model
│   └── run             # CLI 主入口
├── common/             # 主进程与 CLI 共享的 agent / 模型 / 工作区逻辑
├── config/             # Webpack 配置（dev / prod）
├── nodejs/             # Electron 主进程 IPC 与历史记录
├── src/                # 渲染进程（React + Redux）
│   └── modules/main/   # 主界面、对话、模型管理弹窗等
├── public/             # HTML 模板与静态资源
├── images/             # 应用图标（icns / ico / png）
├── script/             # 构建辅助脚本（打包、发布等）
├── index.js            # Electron 主进程入口
├── preload.js          # 渲染进程预加载脚本
└── package.json
```

### 5. 常见问题

- **首次启动提示「暂无模型配置」？**
  请先用 `aihatch-cli model add` 至少添加一个模型，或在桌面端「模型管理」中新增。

- **`aihatch-cli` 命令找不到？**
  请先执行 `npm install -g .`，或直接在项目目录下用 `node bin/run -t "问题"` 运行。

- **打包失败 / `dist` 目录被自动清理？**
  `npm run build` 结尾会调用 `oipage-cli disk --delete dist`，这是预期的清理动作，不必手动保留 `dist/`。

## 版权

MIT License

Copyright (c) [zxl20070701](https://zxl20070701.github.io/notebook/home.html) 走一步，再走一步
