/**
 * apidoc文档缓存
 */

import { ApidocDetail } from "@@/global";
import type { ApidocProjectHost } from "@@/store"

type ServerInfo = ApidocProjectHost & {
    isLocal?: boolean,
};

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
     * @param {string}     id 接口id
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

    /**
     * @description        缓存服务器地址
     * @author             shuxiaokai
     * @create             2021-09-09 21:37
     */
    addApidocServer(serverInfo: ServerInfo, projectId: string) {
        try {
            const localData = JSON.parse(localStorage.getItem("apidoc/apidocServer") || "{}");
            if (!localData[projectId]) {
                localData[projectId] = [];
            }
            if (localData[projectId].find((v: ServerInfo) => v.url === serverInfo.url)) {
                return
            }
            localData[projectId].push(serverInfo);
            localStorage.setItem("apidoc/apidocServer", JSON.stringify(localData));
        } catch (error) {
            console.error(error);
            const data: Record<string, ServerInfo[]> = {};
            data[projectId] = [serverInfo];
            localStorage.setItem("apidoc/apidocServer", JSON.stringify(data));
        }
    }

    /**
     * @description        删除缓存服务器地址
     * @author             shuxiaokai
     * @create             2021-09-09 21:37
     */
    deleteApidocServer(host: string, projectId: string) {
        try {
            const localData = JSON.parse(localStorage.getItem("apidoc/apidocServer") || "{}");
            if (!localData[projectId]) {
                localData[projectId] = [];
            }
            const delIndex = localData[projectId].findIndex((v: ServerInfo) => v.url === host);
            if (delIndex !== -1) {
                localData[projectId].splice(delIndex, 1);
            }
            localStorage.setItem("apidoc/apidocServer", JSON.stringify(localData));
        } catch (error) {
            console.error(error);
            const data: Record<string, ServerInfo[]> = {};
            data[projectId] = [];
            localStorage.setItem("apidoc/apidocServer", JSON.stringify(data));
        }
    }

    /**
     * @description        获取缓存服务器地址
     * @author             shuxiaokai
     * @create             2021-09-09 21:37
     * @param {string}     projectId 项目id
     */
    getApidocServer(projectId: string): ServerInfo[] | [] {
        try {
            const localData: Record<string, ServerInfo[]> = JSON.parse(localStorage.getItem("apidoc/apidocServer") || "{}");
            if (!localData[projectId]) {
                return [];
            }
            return localData[projectId];
        } catch (error) {
            console.error(error);
            localStorage.setItem("apidoc/apidocServer", "{}")
            return [];
        }
    }

    /**
     * @description        获取是否开启代理缓存
     * @author             shuxiaokai
     * @create             2021-09-09 21:37
     * @param {string}     projectId 项目id
     */
    getApidocProxyState(projectId: string): boolean | null {
        try {
            const localData: Record<string, boolean> = JSON.parse(localStorage.getItem("apidoc/apidocCacheState") || "{}");
            if (localData[projectId] == null) {
                return null;
            }
            return localData[projectId] === true;
        } catch (error) {
            console.error(error);
            localStorage.setItem("apidoc/apidocCacheState", "{}")
            return false;
        }
    }

    /**
     * @description        设置是否开启代理服务器
     * @author             shuxiaokai
     * @create             2021-09-09 21:37
     */
    setApidocCacheState(cacheState: boolean, projectId: string) {
        try {
            const localData = JSON.parse(localStorage.getItem("apidoc/apidocCacheState") || "{}");
            localData[projectId] = cacheState;
            localStorage.setItem("apidoc/apidocCacheState", JSON.stringify(localData));
        } catch (error) {
            console.error(error);
            localStorage.setItem("apidoc/apidocCacheState", "{}");
        }
    }
}

export const apidocCache = new ApidocCache();
