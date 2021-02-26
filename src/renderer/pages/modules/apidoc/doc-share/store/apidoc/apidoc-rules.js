/**
 * @description        apidoc规则相关store
 * @author             shuxiaokai
 * @create             2020-06-25 11:25
 */
export default {
    namespaced: true,
    state: {
        fileInFolderLimit: 8, //单个文件夹默认限制文件个数
        dominLimit: 5, //每个项目限制配置域名个数
        contentType: [], //contentType
        requestMethods: [], //请求方法
        cacheProjectId: null, //缓存项目id，如果有项目id则不重新请求数据
    },
    mutations: {
        changeRules(state, payload) {
            state.dominLimit = payload.dominLimit;
            state.fileInFolderLimit = payload.fileInFolderLimit;
            state.contentType = payload.contentType;
            state.requestMethods = payload.requestMethods;
            state.cacheProjectId = payload.cacheProjectId;
        },
    },
};
