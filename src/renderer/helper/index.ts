/**
 * @description        全局工具函数
 * @author             shuxiaokai
 * @create             2021-06-15 22:55
 */
import { nanoid } from "nanoid/non-secure"
import type { ApidocHttpRequestMethod } from "@@/global"
import tips from "./tips"
import lodashIsEqual from "lodash/isEqual";
import lodashCloneDeep from "lodash/cloneDeep";
import lodashDebounce from "lodash/debounce";
import lodashThrottle from "lodash/throttle";
import dayjs from "dayjs";
import mitt from "mitt"

type Data = Record<string, unknown>

/**
 * 对象对比
 */
export const isEqual = lodashIsEqual;
/**
 * 深拷贝
 */
export const cloneDeep = lodashCloneDeep;
/**
 * 防抖函数
 */
export const debounce = lodashDebounce;
/**
 * 节流函数
 */
export const throttle = lodashThrottle;
/**
 * 全局事件订阅发布
 */
const emitter = mitt()

export const event = emitter;
/**
 * @description        返回uuid
 * @author             shuxiaokai
 * @create             2021-01-20 22:52
 * @return {string}    返回uuid
 */
export function uuid(): string {
    return nanoid();
}

/**
    @description   返回变量类型
    @author        shuxiaokai
    @create        2019-10-29 16:32"
    @param {any}   variable
    @return       小写对象类型(null,number,string,boolean,symbol,function,object,array,regexp)
*/
export function getType(variable: unknown): string {
    return Object.prototype.toString.call(variable).slice(8, -1).toLocaleLowerCase();
}

type ForestData = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [propName: string]: any,
}

/**
 * @description        遍历森林(深度优先)
 * @author             shuxiaokai
 * @create             2020-03-02 10:17
 * @param {array}      arrData 数组数据
 * @param {function}   fn 每次遍历执行得函数
 * @param {string}     childrenKey children对应字段
 */
export function forEachForest<T extends ForestData>(forest: T[], fn: (arg: T) => void, options?: { childrenKey?: string }): void {
    if (!Array.isArray(forest)) {
        throw new Error("第一个参数必须为数组类型");
    }
    const childrenKey = options?.childrenKey || "children";
    const foo = (forestData: T[], hook: (arg: T) => void) => {
        for (let i = 0; i < forestData.length; i += 1) {
            const currentData = forestData[i];
            hook(currentData);
            if (!currentData[childrenKey]) {
                continue;
            }
            if (!Array.isArray(currentData[childrenKey])) {
                continue;
            }
            if ((currentData[childrenKey] as T[]).length > 0) {
                foo(currentData[childrenKey] as T[], hook);
            }
        }
    };
    foo(forest, fn);
}

/**
 * 根据id查询父元素
 */
export function findParentById<T extends ForestData>(forest: T[], id: string, options?: { childrenKey?: string, idKey?: string }): T | null {
    if (!Array.isArray(forest)) {
        throw new Error("第一个参数必须为数组类型");
    }
    const childrenKey = options?.childrenKey || "children";
    const idKey = options?.idKey || "id";
    let pNode: ForestData | null = null;
    let hasPNode = false;
    const foo = (forestData: ForestData) => {
        for (let i = 0; i < forestData.length; i += 1) {
            const currentData = forestData[i];
            if (currentData[idKey] === id) {
                hasPNode = true;
                break;
            }
            if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
                pNode = currentData;
                foo(currentData[childrenKey]);
            }
        }
    };
    foo(forest);
    if (hasPNode) {
        return pNode;
    } else {
        return null;
    }
}

let canvas: HTMLCanvasElement | null;
/**
 * 获取字符串宽度
 */
export function getTextWidth(text: string, font: string): number {
    canvas || (canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    (context as CanvasRenderingContext2D).font = font;
    const metrics = (context as CanvasRenderingContext2D).measureText(text);
    return metrics.width;
}

/**
 * 获取提示信息
 */
export function randomTip(): string {
    const len = tips.length;
    const randomIndex = Math.ceil(Math.random() * len) - 1;
    return tips[randomIndex];
}

/**
 * 格式化时间
 */
export function formatDate(date: string | number | Date | dayjs.Dayjs | undefined, rule?: string): string {
    const realRule = rule || "YYYY-MM-DD HH:mm"
    const result = dayjs(date).format(realRule);
    return result;
}

/**
    @description  将数组对象[{id: 1}]根据指定的key值进行去重,key值对应的数组元素不存在则直接过滤掉，若不传入id则默认按照set形式进行去重。
    @create       2019-11-20 22:40
    @update       2019-11-20 22:42
    @param  {array}  array 需要处理的数组
    @param  {string?} key 指定对象数组的去重依据
    @return {Array}  返回一个去重后的新数组，不会改变原数组
    @example
        unique([{id: 1}, {id: 2}, {id: 1}], "id") => [{id: 1}, {id: 2}]
        unique([{id: 1}, {id: 2}, {id: 1}]) => [{id: 1}, {id: 2}, {id: 1}]
        unique([{id: 1}, {}, {id: 1}]) => [{id: 1}, {id: 2}, {id: 1}]
        unique([1, 2, 3, 4, 3, 3]) => [1, 2, 3, 4]
*/

export function uniqueByKey<T extends Data, K extends keyof T>(data: T[], key: K): T[] {
    const result: T[] = [];
    for (let i = 0, len = data.length; i < len; i += 1) {
        const isInResult = result.find((val) => val[key] === data[i][key]);
        if (data[i][key] != null && !isInResult) {
            result.push(data[i]);
        }
    }
    return result;
}

/**
 * 获取请求方法
 */
export function getRequestMethodEnum(): ApidocHttpRequestMethod[] {
    return ["GET", "POST", "PUT", "DELETE", "TRACE", "CONNECTION", "OPTIONS", "PATCH", "HEAD"];
}
