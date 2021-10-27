import Axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { App } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import config from "@/../config/config"

const axiosInstance = Axios.create();
axiosInstance.defaults.withCredentials = config.renderConfig.httpRequest.withCredentials;//允许携带cookie
axiosInstance.defaults.timeout = config.renderConfig.httpRequest.timeout;//超时时间
axiosInstance.defaults.baseURL = config.renderConfig.httpRequest.url;//请求地址

const axiosPlugin = {
    install(app: App): void {
        //===============================axiosInstance请求钩子==========================================//
        axiosInstance.interceptors.request.use((reqConfig: AxiosRequestConfig) => reqConfig, (err) => Promise.reject(err));
        //===============================axiosInstance响应钩子=======================================//
        axiosInstance.interceptors.response.use(
            async (res: AxiosResponse) => {
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
                    switch (code) {
                    case 0: //正确请求
                        break;
                    case 101005: //无效的的id和密码,跳转到验证页面
                        break;
                    case 4200: //代理错误
                        return Promise.reject(new Error(res.data.msg));
                    case 4002: //暂无权限
                        ElMessage.warning(res.data.msg || "暂无权限");
                        return Promise.reject(new Error(res.data.msg || "暂无权限"));
                    default:
                        ElMessageBox.confirm(res.data.msg ? res.data.msg : "操作失败", "提示", {
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
            (err: AxiosError) => {
                //=====================================取消错误不进行拦截====================================//
                if (err.constructor && err.constructor.name === "Cancel") {
                    return;
                }
                ElMessage.error("系统开小差了!");
                Promise.reject(err);
            },
        );
        app.config.globalProperties.axios = axiosInstance;
    },
}

export { axiosPlugin, axiosInstance as axios };
