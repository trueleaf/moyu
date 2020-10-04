
/** 
 * @description        配置信息
 * @author             shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-01-09 18:39
 * @update             2020-01-09 18:39
 */
import config from "@/../config/config.default.js"
export default {
    state: {
        version: config.updateConfig.version,
        pageConfig: {
            layout: "layout", //layout 
        },
    },
    mutations: {
        
    },
};
