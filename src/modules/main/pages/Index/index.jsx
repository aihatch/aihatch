import React from 'react'
import './index.scss'

import StatusBar from '../../components/StatusBar'
import ActivityBar from '../../components/ActivityBar'
import Folder from '../../components/Folder'
import Search from '../../components/Search'
import Plug from '../../components/Plug'

import store from '../../stores/index'

class Index extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            activeBar: ""
        }

        // 监听store改变
        store.subscribe(() => {
            this.setState({
                activeBar: store.getState()["globalInstance"].activeBar
            })
        })

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


    }

    render() {
        return (<div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
            backgroundColor: '#ededf5'
        }}>
            <header style={{
                flexBasis: "35px",
                backgroundColor: "#d1c8df",
                position: "relative",
                left: 0,
                top: 0,
                width: "100%",
                zIndex: 1
            }} className="app-region-drag">
                <div className="win-btns">
                    <button className="min" onClick={this.minimize}>最小化</button>
                    <button className="max" onClick={this.maximize}>最大化</button>
                    <button className="close" onClick={this.exit}>关闭</button>
                </div>
            </header>
            <div style={{
                flex: 1,
                display: 'flex'
            }}>

                {/* 左1 */}
                <div style={{
                    width: '50px',
                    backgroundColor: '#f0eeee'
                }}>
                    <ActivityBar />
                </div>

                {/* 左2 */}
                <div style={{
                    flexBasis: '240px',
                    backgroundColor: '#ffffff'
                }}>
                    {this.state.activeBar === "folder" ? <Folder /> : null}
                    {this.state.activeBar === "search" ? <Search /> : null}
                    {this.state.activeBar === "plug" ? <Plug /> : null}
                </div>

                <div style={{
                    flexBasis: '5px'
                }}></div>

                {/* 中间 */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        flex: 1,
                        backgroundColor: '#ffffff',
                        borderRadius: '0 0 10px 10px'
                    }}>
                        editor
                    </div>
                    <div style={{
                        flexBasis: '5px'
                    }}></div>
                    <div style={{
                        flexBasis: '200px',
                        backgroundColor: '#ffffff',
                        borderRadius: '10px 10px 0 0'
                    }}>
                        pannel
                    </div>
                </div>

                <div style={{
                    flexBasis: '5px'
                }}></div>

                {/* 右2 */}
                <div style={{
                    flexBasis: '360px',
                    backgroundColor: '#ffffff'
                }}>
                    secondary bar
                </div>

            </div>
            <div style={{
                flexBasis: '35px',
                backgroundColor: '#9c86bd'
            }}>
                <StatusBar />
            </div>
        </div>)
    }
}

export default Index
