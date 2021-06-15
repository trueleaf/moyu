/**
 * @description        全局工具函数
 * @author             shuxiaokai
 * @create             2021-06-15 22:55
 */
import { nanoid } from "nanoid/non-secure"
import { Uuid, GetType } from "@@/helper"
import lodashIsEqual from "lodash/isEqual";
import lodashCloneDeep from "lodash/cloneDeep";
// import dayjs from "dayjs";

//对象对比
export const isEqual = lodashIsEqual;
//深拷贝
export const cloneDeep = lodashCloneDeep;

/**
 * @description        返回uuid
 * @author             shuxiaokai
 * @create             2021-01-20 22:52
 * @return {string}    返回uuid
 */
export const uuid: Uuid = () => {
    return nanoid();
}

/**
    @description   返回变量类型
    @author        shuxiaokai
    @create        2019-10-29 16:32"
    @param {any}   variable
    @return       小写对象类型(null,number,string,boolean,symbol,function,object,array,regexp)
*/
export const getType: GetType = (variable) => {
    return Object.prototype.toString.call(variable).slice(8, -1).toLocaleLowerCase();
}
