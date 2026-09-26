import React from 'react'
import './index.scss'

import store from '../../stores/index'

class ActivityBar extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            tagName: ""
        }
    }

    // 切换导航
    changePage(tagName) {
        this.setState({
            tagName
        })

        store.dispatch({
            type: "changeActivityBar",
            value: tagName
        })

    }

    // 打开设置页面
    openSet() {
        console.log("openSet")
    }

    componentDidMount() {
        this.changePage("folder")
    }

    render() {
        return (<div className="activity-bar">
            <span tag="folder" active={this.state.tagName === "folder" ? "yes" : "no"} onClick={() => this.changePage("folder")} title="浏览打开的文件"></span>
            <span tag="search" active={this.state.tagName === "search" ? "yes" : "no"} onClick={() => this.changePage("search")} title="查找文件"></span>
            <span tag="plug" active={this.state.tagName === "plug" ? "yes" : "no"} onClick={() => this.changePage("plug")} title="管理插件"></span>

            <span tag="set" onClick={this.openSet} title="配置系统"></span>
        </div>)
    }
}

export default ActivityBar
