const globalInstance = (preState, action) => {

    switch (action.type) {

        // 修改ActivityBar激活菜单
        case 'changeActivityBar':
            preState.activeBar = action.value
            return preState

        default:
            return preState || {
                activeBar: ''
            }
    }
}

export default globalInstance