import { legacy_createStore as createStore, combineReducers } from 'redux'

import globalInstance from './global.store'
import dialogInstance from './dialog.store'

let store = createStore(combineReducers({

    // 全局状态
    globalInstance,

    // 弹框
    dialogInstance
}))

export default store