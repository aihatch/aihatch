import React from 'react'
import './index.scss'

import store from '../../stores/index'

class Folder extends React.Component {

    constructor(props) {
        super(props)

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

    componentDidMount() {


    }

    render() {
        return (<div>
            <p className="noFolder">
                <p>
                    还没有打开任何文件夹或项目。
                </p>
                <input type="button" value="打开文件夹" />
                <p>
                    或者你可以创建一个文件进行编辑，也可以点击
                    <a href="javascript:void(0)" onClick={this.aboutUS}>关于我们</a>
                    和我们取得联系，更多细节欢迎交流讨论，欢迎你加入我们。
                </p>
                <input type="button" value="创建一个文件" />
            </p>
        </div>)
    }
}

export default Folder