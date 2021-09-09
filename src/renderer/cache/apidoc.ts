/**
 * apidoc文档缓存
 */

import { ApidocDetail } from "@@/global";


class ApidocCache {
    constructor() {
        if (!localStorage.getItem("apidoc/paramsConfig")) {
            localStorage.setItem("apidoc/paramsConfig", "{}");
        }
        if (!localStorage.getItem("apidoc/apidoc")) {
            localStorage.setItem("apidoc/apidoc", "{}");
        }
    }
    /**
     * @description        获取当前选中params tab的值
     * @author             shuxiaokai
     * @create             2021-09-06 21:50
     * @param {string}     id - 当前tab的id
     */
    getActiveParamsTab(id: string): string | null {
        try {
            const localActiveTab: Record<string, string> = JSON.parse(localStorage.getItem("apidoc/paramsActiveTab") || "{}");
            if (!localActiveTab[id]) {
                return null;
            }
            return localActiveTab[id];
        } catch (error) {
            console.error(error);
            localStorage.setItem("apidoc/paramsActiveTab", "{}")
            return null;
        }
    }
    /**
     * @description        设置当前选中params tab的值
     * @author             shuxiaokai
     * @create             2021-09-06 21:50
     * @param {string}     id - 当前tab的id
     * @param {string}     val - 需要设置的值
     */
    setActiveParamsTab(id: string, val: string) {
        try {
            const localActiveTab = JSON.parse(localStorage.getItem("apidoc/paramsActiveTab") || "{}");
            localActiveTab[id] = val;
            localStorage.setItem("apidoc/paramsActiveTab", JSON.stringify(localActiveTab));
        } catch (error) {
            console.error(error);
            const data: Record<string, string> = {};
            data[id] = val;
            localStorage.setItem("apidoc/paramsActiveTab", JSON.stringify(data));
        }
    }

    /**
     * @description        缓存接口信息     
     * @author             shuxiaokai
     * @create             2021-09-09 21:37
     */
    setApidoc(val: ApidocDetail) {
        try {
            const localApidoc = JSON.parse(localStorage.getItem("apidoc/apidoc") || "{}");
            localApidoc[val._id] = val;
            localStorage.setItem("apidoc/apidoc", JSON.stringify(localApidoc));
        } catch (error) {
            console.error(error);
            const data: Record<string, ApidocDetail> = {};
            data[val._id] = val;
            localStorage.setItem("apidoc/apidoc", JSON.stringify(data));
        }
    }
    /**
     * @description        获取缓存接口信息     
     * @author             shuxiaokai
     * @create             2021-09-09 21:37
     */
    getApidoc(id: string): ApidocDetail | null {
        try {
            const localApidoc: Record<string, ApidocDetail> = JSON.parse(localStorage.getItem("apidoc/apidoc") || "{}");
            if (!localApidoc[id]) {
                return null;
            }
            return localApidoc[id];
        } catch (error) {
            console.error(error);
            localStorage.setItem("apidoc/apidoc", "{}")
            return null;
        }
    }
}



export const apidocCache = new ApidocCache();