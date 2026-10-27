import React from 'react'
import './index.scss'

import store from '../../stores/index'

import { AuiRuntimeProvider } from "@auipage/react"

import ChatContent from "./ChatContent"
import ThreadList from "./ThreadList"
import adapter from "../../adapter/index"
import tools from "../../tools/index"
import { $remote } from "../../adapter/tool"

class Index extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            activeBar: "",
            workspace: "加载中...",
            workspaceDragOver: false
        }

        // 监听store改变
        store.subscribe(() => {
            this.setState({
                activeBar: store.getState()["globalInstance"].activeBar
            })
        })

    }

    // 关于我们
    aboutUS() {
        store.dispatch({
            type: "openDialog",
            data: {
                id: "aboutUS"
            }
        })
    }

    // 模型配置管理
    modelConfig() {
        store.dispatch({
            type: "openDialog",
            data: {
                id: "modelManager"
            }
        })
    }

    // 加载当前工作目录
    loadWorkspace() {
        $remote.get("/api/workspace").then((path) => {
            if (typeof path === "string") {
                this.setState({ workspace: path })
            }
        }).catch(() => { })
    }

    // 中间省略：保留开头和结尾各一段，中间用 ... 连接
    middleEllipsis(path, head = 14, tail = 14) {
        if (!path || path.length <= head + tail + 3) return path
        return path.slice(0, head) + "..." + path.slice(path.length - tail)
    }

    // 选择工作目录（调用系统目录选择器）
    selectWorkspace() {
        $remote.post("/api/workspace").then((path) => {
            if (typeof path === "string") {
                this.setState({ workspace: path })
            }
        }).catch(() => { })
    }

    // 拖拽进入工作目录入口：高亮
    onWorkspaceDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
        if (!this.state.workspaceDragOver) {
            this.setState({ workspaceDragOver: true });
        }
    }

    // 拖拽离开工作目录入口：取消高亮
    onWorkspaceDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.state.workspaceDragOver) {
            this.setState({ workspaceDragOver: false });
        }
    }

    // 放下：取第一个文件/文件夹的路径（Electron 下 File.path 可用）作为工作目录
    onWorkspaceDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ workspaceDragOver: false });

        let files = e.dataTransfer && e.dataTransfer.files;
        if (!files || files.length === 0) return;

        // 取第一个有效路径
        let firstPath = "";
        for (let i = 0; i < files.length; i++) {
            if (files[i].path) { firstPath = files[i].path; break; }
        }
        if (!firstPath) return;

        $remote.post("/api/workspace", { path: firstPath }).then((path) => {
            if (typeof path === "string") {
                this.setState({ workspace: path })
            }
        }).catch(() => { })
    }

    // 关闭应用并退出
    exit() {
        globalThis.nodeRequire.ipcRenderer.send("exit")
    }

    // 最小化应用
    minimize() {
        globalThis.nodeRequire.ipcRenderer.send("minimize")
    }

    // 最大化应用
    maximize() {
        globalThis.nodeRequire.ipcRenderer.send("maximize")
    }

    componentDidMount() {
        this.loadWorkspace()
    }

    render() {
        return (<div className="main-container">
            <header className="app-region-drag app-header">
                <div className="win-btns">
                    <button className="min" onClick={this.minimize}>最小化</button>
                    <button className="max" onClick={this.maximize}>最大化</button>
                    <button className="close" onClick={this.exit}>关闭</button>
                </div>
                <a className={"workspace-entry" + (this.state.workspaceDragOver ? " is-drag-over" : "")}
                    href="javascript:void(0)"
                    onClick={() => this.selectWorkspace()}
                    onDragOver={(e) => this.onWorkspaceDragOver(e)}
                    onDragLeave={(e) => this.onWorkspaceDragLeave(e)}
                    onDrop={(e) => this.onWorkspaceDrop(e)}
                    title={this.state.workspace}>
                    工作目录：{this.middleEllipsis(this.state.workspace)}
                </a>
                <a className="model-config" href="javascript:void(0)" onClick={this.modelConfig}>
                    模型配置
                </a>
                <a className="about-us" href="javascript:void(0)" onClick={this.aboutUS}>
                    关于我们
                </a>
            </header>
            <AuiRuntimeProvider adapter={adapter} tools={tools}>
                <div className="main-content">
                    <div className="chat-area">
                        <ChatContent />
                    </div>
                    <div className="thread-list-area">
                        <ThreadList />
                    </div>
                </div>
            </AuiRuntimeProvider>
        </div>)
    }
}

export default Index
