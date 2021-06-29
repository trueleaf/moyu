/**
 * @description        全局工具函数
 * @author             shuxiaokai
 * @create             2021-06-15 22:55
 */
import { nanoid } from "nanoid/non-secure"
import tips from "./tips"
import lodashIsEqual from "lodash/isEqual";
import lodashCloneDeep from "lodash/cloneDeep";
import lodashDebounce from "lodash/debounce";
import dayjs from "dayjs";

//对象对比
export const isEqual = lodashIsEqual;
//深拷贝
export const cloneDeep = lodashCloneDeep;
//防抖函数
export const debounce = lodashDebounce;

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
 * @description        遍历森林
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
 * 深度优先遍历
 */
