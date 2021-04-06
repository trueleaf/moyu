/**
 * @description        apidoc规则相关store
 * @author             shuxiaokai
 * @create             2020-06-25 11:25
 */
import http from "@/api/api";

const { axios } = http;
export default {
    namespaced: true,
    state: {
        fileInFolderLimit: 8, //单个文件夹默认限制文件个数
        dominLimit: 5, //每个项目限制配置域名个数
        contentType: [], //contentType
        requestMethods: [], //请求方法
        cacheProjectId: null, //缓存项目id，如果有项目id则不重新请求数据
        requireDescription: false, //描述是否必填
        requireValue: false, //参数值是否必填
        enableCollapseAnimation: false, //是否开启折叠动画
    },
    mutations: {
        changeRules(state, payload) {
            state.dominLimit = payload.dominLimit;
            state.fileInFolderLimit = payload.fileInFolderLimit;
            state.contentType = payload.contentType;
            state.requestMethods = payload.requestMethods;
            state.cacheProjectId = payload.cacheProjectId;
            state.requireDescription = payload.requireDescription;
            state.requireValue = payload.requireValue;
            state.enableCollapseAnimation = payload.enableCollapseAnimation;
        },
    },
    actions: {
        getRuels(context, payload) {
            return new Promise((resolve, reject) => {
                const params = {
                    projectId: payload.projectId,
                };
                axios.get("/api/apidoc/project/project_rules", { params }).then((res) => {
                    context.commit("changeRules", {
                        dominLimit: res.data.dominLimit,
                        fileInFolderLimit: res.data.fileInFolderLimit,
                        contentType: res.data.contentType,
                        requestMethods: res.data.requestMethods,
                        requireDescription: res.data.requireDescription,
                        requireValue: res.data.requireValue,
                        enableCollapseAnimation: res.data.enableCollapseAnimation,
                        cacheProjectId: payload.projectId,
                    });
                    resolve(res);
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                });
            });
        },
    },
};
