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
        requestMethod: {
            whiteList: ["get", "post", "put", "delete"],
            contentType: ["query", "json", "formData", "x-www-form-urlencoded"],
            config: [
                {
                    name: "get",
                    classColor: "green",
                    contentType: ["query"], //query,json,x-www-form-urlencoded,formData
                },
                {
                    name: "post",
                    classColor: "yellow",
                    contentType: ["json", "formData"], //query,json,x-www-form-urlencoded,formData
                },
                {
                    name: "put",
                    classColor: "blue",
                    contentType: ["json"], //query,json,x-www-form-urlencoded,formData
                },
                {
                    name: "delete",
                    classColor: "red",
                    contentType: ["query"], //query,json,x-www-form-urlencoded,formData
                },
            ],
        },
        keyWhiteList: ["_id", "__v"], //请求参数key白名单
        currentCondition: { //当前规则条件
            connected: -1, //0代表未连通，1代表连通，-1未请求
            status: -1, //-1代表未连通，200-299代表ok
            size: 0, //返回值大小(kb)
            localParams: -1, //本地参数0代表未校验，1代表校验通过，0代表校验未通过
            remoteResponse: -1, //远程返回值0代表未校验，1代表校验通过，0代表校验未通过
            responseErrorType: "", //错误类型
            resType: "", //返回值类型
        },
    },
    mutations: {
        //改变请求状态值
        changeCurrentCondition(state, payload) {
            const { connected, status, size, localParams, resType, responseErrorType, remoteResponse } = payload;
            if (connected != null) state.currentCondition.connected = connected; 
            if (status != null) state.currentCondition.status = status; 
            if (size != null) state.currentCondition.size = size; 
            if (localParams != null) state.currentCondition.localParams = localParams; 
            if (resType != null) state.currentCondition.resType = resType; 
            if (responseErrorType != null) state.currentCondition.responseErrorType = responseErrorType; 
            if (remoteResponse != null) state.currentCondition.remoteResponse = remoteResponse; 
        },
        resetCondition(state) {
            state.currentCondition = { 
                connected: -1, //0代表未连通，1代表连通，-1未请求
                status: -1, //-1代表未连通，200-299代表ok
                size: 0, //返回值大小(kb)
                localParams: -1, //本地参数0代表未校验，1代表校验通过，0代表校验未通过
                remoteResponse: -1, //远程返回值0代表未校验，1代表校验通过，0代表校验未通过
                responseErrorType: "", //错误类型
                resType: "", //返回值类型
            }
        }
    },
    actions: {
        
    },
};
