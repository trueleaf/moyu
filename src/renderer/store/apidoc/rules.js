/**
 * @description        apidoc规则相关store
 * @author             shuxiaokai
 * @create             2020-06-25 11:25
 */
// import http from "@/api/api.js"
// const axios = http.axios;
import scssData from "@/scss/variables/_variables.scss"
export default {
    namespaced: true,
    state: {
        fileInFolderLimit: 8, //单个文件夹默认限制文件个数
        dominLimit: 5, //每个项目限制配置域名个数
        requestConfig: {
            contentTypeEnum: [ //可以使用的contentType
                {
                    name: "query",
                    value: "query",
                },
                {
                    name: "json",
                    value: "json",
                },
                {
                    name: "form-data",
                    value: "formData",
                },
                {
                    name: "x-www-form-urlencoded",
                    value: "x-www-form-urlencoded",
                },
            ], 
            config: [
                {
                    name: "get", //请求方式名称
                    nickname: "GET",
                    enabled: true, //是否启用
                    iconColor: scssData.colorGreen, //请求方式颜色
                    enabledContenType: ["query"], //当前请求方式允许的ContentType
                },
                {
                    name: "post",
                    nickname: "POST",
                    enabled: true, //是否启用
                    iconColor: scssData.colorYellow,
                    enabledContenType: ["json", "formData"],
                },
                {
                    name: "put",
                    nickname: "PUT",
                    enabled: true, //是否启用
                    iconColor: scssData.colorBlue,
                    enabledContenType: ["json"],
                },
                {
                    name: "delete",
                    nickname: "DEL",
                    enabled: true, //是否启用
                    iconColor: scssData.colorRed,
                    enabledContenType: ["query"],
                },
            ]
        },
    },
    mutations: {
        changeRules(state, payload) {
            state.fileInFolderLimit = payload.fileInFolderLimit;
            state.dominLimit = payload.dominLimit;
            state.requestConfig = payload.requestConfig;
        }
    },
    actions: {
        
    },
};
