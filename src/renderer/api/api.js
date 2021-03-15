import axios from "axios";
import jsCookie from "js-cookie";
import config from "@/../config";
import { router } from "@/router";

const axiosInstance = axios.create();
axiosInstance.defaults.withCredentials = config.renderConfig.httpRequest.withCredentials;//允许携带cookie
axiosInstance.defaults.timeout = config.renderConfig.httpRequest.timeout;//超时时间
axiosInstance.defaults.baseURL = config.renderConfig.httpRequest.url;//请求地址

export default {
    install(Vue) {
        //===============================axiosInstance请求钩子==========================================//
        axiosInstance.interceptors.request.use((reqConfig) => {
            reqConfig.headers["x-csrf-token"] = jsCookie.get("csrfToken");
            return reqConfig;
        }, (err) => Promise.reject(err));
        //===============================axiosInstance响应钩子=======================================//
        axiosInstance.interceptors.response.use(
            async (res) => {
                const result = res.data;
                const headers = res.headers || {};
                const contentType = headers["content-type"];
                const contentDisposition = headers["content-disposition"];
                let fileName = contentDisposition ? contentDisposition.match(/filename=(.*)/) : "";
                if (fileName) {
                    fileName = decodeURIComponent(fileName[1]);
                }
                if (contentType.includes("application/json")) { //常规格式数据
                    let code = null;
                    if (res.data.constructor.name === "Blob") {
                        let jsonData = await res.data.text();
                        jsonData = JSON.parse(jsonData);
                        // eslint-disable-next-line prefer-destructuring
                        code = jsonData.code;
                    } else {
                        // eslint-disable-next-line prefer-destructuring
                        code = res.data.code; //自定义请求状态码
                    }
                    /*eslint-disable indent*/
                    switch (code) {
                        case 0: //正确请求
                            break;
                        case 2006: //输入验证码
                            break;
                        case 2003: //ip锁定
                            break;
                        case 4101: //登录有错
                            router.replace("/login");
                            Vue.prototype.$message.warning("暂无权限");
                            return Promise.reject(new Error("暂无权限"));
                        case 4100: //登录过期
                            Vue.prototype.$confirm("登录已过期", "提示", {
                                confirmButtonText: "跳转登录",
                                cancelButtonText: "取消",
                                type: "warning",
                            }).then(() => {
                                sessionStorage.clear();
                                router.replace("/login");
                            });
                            return Promise.reject(new Error("登陆已过期"));
                        case 4002: //暂无权限
                            Vue.prototype.$message.warning("暂无权限");
                            return Promise.reject(new Error("暂无权限"));
                        default:
                            Vue.prototype.$confirm(res.data.msg ? res.data.msg : "操作失败", "提示", {
                                confirmButtonText: "确定",
                                showCancelButton: false,
                                type: "warning",
                            });
                            return Promise.reject(new Error(res.data.msg));
                    }
                    return result;
                }
                if (contentType.includes("application/force-download")) {
                    let blobUrl = "";
                    blobUrl = URL.createObjectURL(res.data);
                    const downloadElement = document.createElement("a");
                    downloadElement.href = blobUrl;
                    downloadElement.download = fileName ? decodeURIComponent(fileName) : "未命名"; //下载后文件名
                    document.body.appendChild(downloadElement);
                    downloadElement.click(); //点击下载
                    document.body.removeChild(downloadElement); //下载完成移除元素
                    window.URL.revokeObjectURL(blobUrl); //释放掉blob对象
                }
                //其余格式直接下载
                return {
                    fileName,
                    contentType,
                    data: result,
                };
            },
            (err) => {
                //=====================================取消错误不进行拦截====================================//
                if (err.constructor && err.constructor.name === "Cancel") {
                    return;
                }
                Vue.prototype.$message.error("系统开小差了!");
                Promise.reject(err);
            },
        );
        Vue.prototype.axios = axiosInstance;
    },
    axios: axiosInstance,
};
