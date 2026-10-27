import React from 'react'
import "./index.scss"

import store from '../../stores/index'
import { $remote } from '../../adapter/tool'

class ModelManager extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            models: [],
            // 编辑中的模型：null 表示列表视图，index = -1 表示新增
            editing: null,
            // 二次确认删除的索引
            confirmIndex: -1,
            error: ""
        }
    }

    componentDidMount() {
        this.load()
    }

    // 加载模型配置列表
    load() {
        $remote.get("/api/models").then((models) => {
            if (models && models.error) {
                this.setState({ error: models.error })
            } else {
                this.setState({ models: models || [], error: "" })
            }
        }).catch(() => {
            this.setState({ error: "加载模型配置失败" })
        })
    }

    // 统一处理请求错误
    request(promise) {
        return promise.then((result) => {
            if (result && result.error) {
                this.setState({ error: result.error })
                return false
            }
            return true
        }).catch(() => {
            this.setState({ error: "请求失败，请重试" })
            return false
        })
    }

    // 关闭弹框
    closeDialog() {
        store.dispatch({
            type: "closeDialog"
        })
    }

    // 切换使用的模型
    use(index) {
        this.request($remote.patch(`/api/models/${index}`, { select: true })).then((ok) => {
            if (ok) this.load()
        })
    }

    // 删除模型（两次点击确认）
    remove(index) {
        if (this.state.confirmIndex !== index) {
            this.setState({ confirmIndex: index })
            return
        }
        this.setState({ confirmIndex: -1 })
        this.request($remote.delete(`/api/models/${index}`)).then((ok) => {
            if (ok) this.load()
        })
    }

    // 打开新增表单
    create() {
        this.setState({
            editing: { index: -1, baseURL: "", apiKey: "", model: "" },
            confirmIndex: -1,
            error: ""
        })
    }

    // 打开编辑表单
    edit(index) {
        const cfg = this.state.models[index].config || {}

        this.setState({
            editing: {
                index,
                baseURL: cfg.baseURL || "",
                apiKey: cfg.apiKey || "",
                model: cfg.model || ""
            },
            confirmIndex: -1,
            error: ""
        })
    }

    // 保存（新增或修改）
    save() {
        const editing = this.state.editing

        const config = {
            baseURL: editing.baseURL.trim(),
            apiKey: editing.apiKey.trim(),
            model: editing.model.trim()
        }

        if (!config.baseURL || !config.model) {
            this.setState({ error: "baseURL 和 model 不能为空" })
            return
        }

        const promise = editing.index >= 0
            ? $remote.patch(`/api/models/${editing.index}`, config)
            : $remote.post("/api/models", config)

        this.request(promise).then((ok) => {
            if (ok) {
                this.setState({ editing: null })
                this.load()
            }
        })
    }

    // 表单字段修改
    changeField(key, event) {
        this.setState({
            editing: Object.assign({}, this.state.editing, {
                [key]: event.target.value
            })
        })
    }

    render() {
        const { models, editing, confirmIndex, error } = this.state

        return (<div className="model-manager">
            <header>
                <span>模型配置</span>
                <a href="javascript:void(0)" onClick={() => this.closeDialog()}>关闭</a>
            </header>

            {error ? <div className="error-tips">{error}</div> : ""}

            {editing ? (
                <div className="model-form">
                    <div className="form-item">
                        <label>baseURL</label>
                        <input value={editing.baseURL} placeholder="例如：http://127.0.0.1:11434/v1"
                            onChange={(e) => this.changeField("baseURL", e)} />
                    </div>
                    <div className="form-item">
                        <label>apiKey</label>
                        <input value={editing.apiKey} placeholder="没有可留空"
                            onChange={(e) => this.changeField("apiKey", e)} />
                    </div>
                    <div className="form-item">
                        <label>model</label>
                        <input value={editing.model} placeholder="例如：qwen3.5"
                            onChange={(e) => this.changeField("model", e)} />
                    </div>
                    <div className="form-btns">
                        <span className="btn" onClick={() => this.setState({ editing: null })}>取消</span>
                        <span className="btn primary" onClick={() => this.save()}>
                            {editing.index >= 0 ? "保存修改" : "新增"}
                        </span>
                    </div>
                </div>
            ) : (
                <React.Fragment>
                    <div className="model-list">
                        {models.length === 0 ? <div className="empty-tips">暂无模型配置，点击下方新增</div> : models.map((item, index) => {
                            const cfg = item.config || {}
                            const isSelect = !!item.select

                            return (<div key={index} className={"model-item" + (isSelect ? " active" : "")}>
                                <div className="model-info">
                                    <div className="model-name">
                                        {cfg.model || "-"}
                                        {isSelect ? <span className="badge">使用中</span> : ""}
                                    </div>
                                    <div className="model-url">{cfg.baseURL || "-"}</div>
                                    <div className="model-key">apiKey：{cfg.apiKey ? "已配置" : "未设置"}</div>
                                </div>
                                <div className="model-btns">
                                    {isSelect ? "" : <span className="btn" onClick={() => this.use(index)}>使用</span>}
                                    <span className="btn" onClick={() => this.edit(index)}>编辑</span>
                                    <span className={"btn danger" + (confirmIndex === index ? " confirm" : "")}
                                        onClick={() => this.remove(index)}>
                                        {confirmIndex === index ? "确认删除？" : "删除"}
                                    </span>
                                </div>
                            </div>)
                        })}
                    </div>
                    <div className="foot-btns">
                        <span className="btn primary" onClick={() => this.create()}>+ 新增模型</span>
                    </div>
                </React.Fragment>
            )}
        </div>)
    }
}

export default ModelManager
