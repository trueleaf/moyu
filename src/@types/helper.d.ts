import { LoDashStatic } from "lodash"
import { forEachForest, getTextWidth, uuid, getType, randomTip, debounce, formatDate, findParentById } from "@/helper/index"

type IsEqual = LoDashStatic["isEqual"];
type CloneDeep = LoDashStatic["CloneDeep"];

interface Helper {
    /**
     * 两个变量是否相等
     */
    isEqual: IsEqual,
    /**
     * 深拷贝
     */
    cloneDeep: CloneDeep,
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
     * 查找父元素
     */
    findParentById: typeof findParentById,
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
}

export { Helper, IsEqual, CloneDeep, Uuid, GetType }
