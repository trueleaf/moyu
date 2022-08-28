import {
    forEachForest,
    getTextWidth,
    uuid,
    getType,
    randomTip,
    debounce,
    formatDate,
    findNodeById,
    findParentById,
    uniqueByKey,
    event,
    getRequestMethodEnum,
    cloneDeep,
    flatTree,
    findPreviousSiblingById,
    findNextSiblingById,
    apidocGenerateProperty,
    apidocConvertParamsToJsonData,
    apidocConvertJsonDataToParams,
    formatBytes,
    formatMs,
    lodashIsEqual,
    apidocConvertParamsToJsonStr,
    apidocGenerateApidoc,
} from "@/helper/index"

type Helper = {
    /**
     * 两个变量是否相等
     */
    lodashIsEqual: typeof lodashIsEqual,
    /**
     * 深拷贝
     */
    cloneDeep: typeof cloneDeep,
    /**
     * 获取uuid
     */
    uuid: typeof uuid,
    /**
     * 获取变量类型
     */
    getType: typeof getType,
    /**
     * 遍历树形数据
     */
    forEachForest: typeof forEachForest,
    /**
     * 根据id查询元素
     */
    findNodeById: typeof findNodeById,
    /**
     * 查找父元素
     */
    findParentById: typeof findParentById,
    /**
     * 根据id查找下一个兄弟节点
     */
    findNextSiblingById: typeof findNextSiblingById,
    /**
     * 根据id查找上一个兄弟节点
     */
    findPreviousSiblingById: typeof findPreviousSiblingById,
    /**
     * 将树形数据所有节点转换为一维数组
     */
    flatTree: typeof flatTree,
    /**
     * 获取字符串宽度
     */
    getTextWidth: typeof getTextWidth,
    /**
     * 获取随机提示信息
     */
    randomTip: typeof randomTip,
    /**
     * 防抖函数debounce
     */
    debounce: typeof debounce,
    /**
     * 格式化时间
     */
    formatDate: typeof formatDate,
    /**
     * 格式化事件
     */
    uniqueByKey: typeof uniqueByKey,
    /**
     * 全局事件
     */
    event: typeof event,
    /**
     * 获取方法枚举信息
     */
    getRequestMethodEnum: typeof getRequestMethodEnum,
    /**
     * apidoc生成一个请求参数
     */
    apidocGenerateProperty: typeof apidocGenerateProperty,
    /**
     * 将录入参数转换为json参数
     */
    apidocConvertParamsToJsonData: typeof apidocConvertParamsToJsonData,
    /**
     * 将json参数转换为moyu参数
     */
    apidocConvertJsonDataToParams: typeof apidocConvertJsonDataToParams,
    /**
     * 格式化字节数
     */
    formatBytes: typeof formatBytes,
    /**
     * 格式化毫秒
     */
    formatMs: typeof formatMs,
    /**
     * 格式化moyu文档到json数据
     */
    apidocConvertParamsToJsonStr: typeof apidocConvertParamsToJsonStr,
    /**
     * 生成一条默认api文档
     */
    apidocGenerateApidoc: typeof apidocGenerateApidoc,
}

export { Helper }
