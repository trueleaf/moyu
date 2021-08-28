/**
 * host相关处理
 */

import { computed } from "vue"
import { store } from "@/store/index"
import { apidocGenerateProperty } from "@/helper/index"
import globalConfig from "@/../config/config"



//请求路径
// export const requestPath = computed<string>({
//     get() {
//         const store = useStore();
//         return store.state["apidoc/apidoc"].apidoc.item.url.path;
//     },
//     set(path) {
//         const store = useStore();
//         store.commit("apidoc/apidoc/changeApidocUrl", path)
//     },
// }); 

/**
 * 从url中找出path参数
 */
export const handlePickPathParams = (): void => {
    const requestPath = store.state["apidoc/apidoc"].apidoc.item.url.path;
    const pathParamsReg = /(?<=\/){([^}]+)}/g; //path参数匹配
    let matchedPathParams = requestPath.match(pathParamsReg);
    if (matchedPathParams) {
        matchedPathParams = matchedPathParams.map((val) => val.replace(/[{}]+/g, ""))
        const result = matchedPathParams.map((param) => {
            const property = apidocGenerateProperty();
            property.key = param;
            return property;
        });
        store.commit("apidoc/apidoc/changePathParams", result)
    } else {
        store.commit("apidoc/apidoc/changePathParams", [])
    }
};

/**
 * 将请求url后面查询参数转换为params
 */
const convertQueryToParams = (requestPath: string): void => {
    const stringParams = requestPath.split("?")[1] || "";
    const urlSearchParams = new URLSearchParams(stringParams);
    const queryParams = Object.fromEntries(urlSearchParams.entries());
    console.log(queryParams)
    // Object.keys(queryParams).forEach((key) => {

    // })
    // let queryString = requestPath.value.split("?") || "";
    // queryString = queryString ? queryString[1] : "";
    // if (!queryString) {
    //     return;
    // }
    // const queryParams = qs.parse(queryString);
    // const params = this.convertTreeDataToPlainParams(queryParams, this.mindParams.queryParams);
    // this.$store.commit("apidoc/unshiftQueryParams", params[0].children)
    // const matchedComponent = this.getComponentByName("QueryParams");
    // matchedComponent.selectChecked();
};

/**
 * 格式化url
 */
export function handleFormatUrl():void {
    const requestPath = computed<string>({
        get() {
            return store.state["apidoc/apidoc"].apidoc.item.url.path;
        },
        set(path) {
            store.commit("apidoc/apidoc/changeApidocUrl", path)
        },
    }); 
    /**
     * 用例：http://127.0.0.1:80
     * 用例：http://127.0.0.1
     * 用例：http://255.255.0.1
     * 用例：https://www.baidu.com
     * 用例：demo.google.com
     */
    convertQueryToParams(requestPath.value);
    const ipReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)/;
    const ipWithPortReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)(:\d{2,5})/;
    const dominReg = /^(https?:\/\/)?([^.]{1,62}\.){1,}[^.]{1,62}/;
    const matchedIp = requestPath.value.match(ipReg);
    const matchedIpWithPort = requestPath.value.match(ipWithPortReg);
    const matchedDomin = requestPath.value.match(dominReg);
    let formatPath = requestPath.value;
    if (!matchedIp && !matchedDomin && !matchedIpWithPort) {
        const mockServer = `http://${globalConfig.renderConfig.mock.ip}:${globalConfig.renderConfig.mock.port}`;
        const pathReg = /\/(?!\/)[^#\\?:]+/; //查询路径正则
        //路径处理
        const matchedPath = formatPath.match(pathReg);
        if (matchedPath) {
            formatPath = matchedPath[0];
        } else if (formatPath.trim() === "") {
            formatPath = "/";
        } else if (!formatPath.startsWith("/")) {
            formatPath = `/${formatPath}`;
        }
        store.commit("apidoc/apidoc/changeApidocHost", mockServer);
    } else {
        store.commit("apidoc/apidoc/changeApidocHost", "");
    }
    const queryReg = /(\?.*$)|(\/*$)/;
    formatPath = formatPath.replace(queryReg, "");
    requestPath.value = formatPath;
}
