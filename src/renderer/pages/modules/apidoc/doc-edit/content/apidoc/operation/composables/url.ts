/**
 * host相关处理
 */

import { Ref, computed, WritableComputedRef } from "vue"
import { useStore } from "@/store/index"
import { apidocGenerateProperty } from "@/helper/index"
import globalConfig from "@/../config/config"

type UrlReturn = {
    /**
     * 请求地址
     */
    requestPath: WritableComputedRef<string>,
    /**
     * blur或者enter的时候格式化url参数
     */
    handleFormatUrl: () => void,
    /**
     * 从url参数中挑选query或者path参数
     */
    handlePickPathParams: (requestPath: string) => void,
}

export default (host: Ref<string>): UrlReturn => {
    const store = useStore();
    //请求路径
    const requestPath = computed<string>({
        get() {
            return store.state["apidoc/apidoc"].apidoc.item.url.path;
        },
        set(path) {
            store.commit("apidoc/apidoc/changeApidocUrl", path)
        },
    });
    //从url中找出path参数
    const handlePickPathParams = (requestPath: string) => {
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
    //将请求url后面查询参数转换为params
    const convertQueryToParams = () => {
        const stringParams = requestPath.value.split("?")[1] || "";
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
    //格式化url
    const handleFormatUrl = () => {
        /**
         * 用例：http://127.0.0.1:80
         * 用例：http://127.0.0.1
         * 用例：http://255.255.0.1
         * 用例：https://www.baidu.com
         * 用例：demo.google.com
         */
        convertQueryToParams();
        const ipReg = /^https?:\/\/(\d|[1-9]\d|2[0-5]{2}\.){3}(\d|[1-9]\d|2[0-5]{2})(:\d{2,5})?(\/.+)?/;
        const dominReg = /^(https?:\/\/)?([^.]{1,62}\.){1,}[^.]{1,62}/;
        const matchedIp = requestPath.value.match(ipReg);
        const matchedDomin = requestPath.value.match(dominReg);
        let formatPath = requestPath.value;
        if (!matchedIp && !matchedDomin) {
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
            host.value = mockServer
        } else {
            host.value = ""
        }
        const queryReg = /(\?.*$)|(\/*$)/;
        formatPath = formatPath.replace(queryReg, "");
        requestPath.value = formatPath;
    };


    return {
        requestPath,
        handleFormatUrl,
        handlePickPathParams,
    }
}