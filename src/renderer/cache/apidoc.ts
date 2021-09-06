/**
 * apidoc文档缓存
 */


class ApidocCache {
    constructor() {
        if (!localStorage.getItem("apidoc/paramsConfig")) {
            localStorage.setItem("apidoc/paramsConfig", "{}");
        }
    }
    private generateConfig() {
        return {
            activeParamsModel: "",
        }
    }
    /**
     * @description        获取当前选中params tab的值
     * @author             shuxiaokai
     * @create             2021-09-06 13:50
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
     * @create             2021-09-06 13:50
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

}



export const apidocCache = new ApidocCache();