/**
 * @description        apidoc规则相关store
 * @author             shuxiaokai
 * @create             2020-06-25 11:25
 */
// import http from "@/api/api.js"
// const axios = http.axios;

export default {
    namespaced: true,
    state: {
        fileInFolderLimit: 8, //单个文件夹默认限制文件个数
        dominLimit: 5, //每个项目限制配置域名个数
        requestConfig: {
            methodsEnum: ["get", "post", "put", "delete"], //可以使用的请求方式
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
                    name: "formData",
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
                    iconColor: "green", //请求方式颜色
                    enabledContenType: ["query"], //当前请求方式允许的ContentType
                },
                {
                    name: "post",
                    iconColor: "yellow",
                    enabledContenType: ["json", "formData"],
                },
                {
                    name: "put",
                    iconColor: "blue",
                    enabledContenType: ["json"],
                },
                {
                    name: "delete",
                    iconColor: "red",
                    enabledContenType: ["query"],
                },
            ]
        },
    },
    mutations: {
        
    },
    actions: {
        
    },
};
