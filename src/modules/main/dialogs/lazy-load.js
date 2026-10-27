import LazyComponent from '../../../lazy-component'

export default {
    aboutUS: LazyComponent(() => import('./aboutUS/index')),
    modelManager: LazyComponent(() => import('./modelManager/index'))
}