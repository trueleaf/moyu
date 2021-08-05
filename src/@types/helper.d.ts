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
} from "@/helper/index"

type Helper = {
    /**
     * 两个变量是否相等
     */
    isEqual: IsEqual,
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
}

export { Helper }
