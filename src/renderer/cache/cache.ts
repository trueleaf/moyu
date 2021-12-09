/**
 * apidoc文档缓存
 */

import { GlobalConfig } from "@@/global";

class GlobalCache {
    constructor() {
        if (!localStorage.getItem("cache/globalConfig")) {
            localStorage.setItem("cache/globalConfig", "{}");
        }
    }

    /**
     * @description        获取全局配置信息
     * @author             shuxiaokai
     * @create             2021-09-06 21:50
     */
    getGlobalConfig(): Partial<GlobalConfig> {
        try {
            const localData: Partial<GlobalConfig> = JSON.parse(localStorage.getItem("cache/globalConfig") || "{}");
            return localData;
        } catch (error) {
            console.error(error);
            localStorage.setItem("cache/globalConfig", "{}")
            return {};
        }
    }

    /**
     * @description        重置全局配置
     * @author             shuxiaokai
     * @create             2021-09-06 21:50
     * @param {GlobalConfig}     config - 全局配置信息
     */
    changeGlobalConfig(config: GlobalConfig): void {
        try {
            localStorage.setItem("cache/globalConfig", JSON.stringify(config));
        } catch (error) {
            console.error(error);
            localStorage.setItem("cache/globalConfig", "{}");
        }
    }
}

export const globalCache = new GlobalCache();
