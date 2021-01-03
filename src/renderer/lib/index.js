



/**
    @description  生成uuid
    @author       shuxiaokai
    @create       2019-10-29 16:32"
    @return {string}      uuid
*/
import { v4 as uuidV4 } from "uuid";

export const uuid = function() {
    return uuidV4();
}


/**
    @description  返回变量类型
    @author        shuxiaokai
    @create       2019-10-29 16:32"
    @param {any}      variable
    @return       小写对象类型(null,number,string,boolean,symbol,function,object,array,regexp)
*/
export const getType = function(variable) {
    return Object.prototype.toString.call(variable).slice(8, -1).toLocaleLowerCase();
}

/** 
 * @description        递归执行某个方法(可能会改变原对象)
 * @author             shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-01-08 21:32
 * @update             2020-01-08 21:32
 * @param {Array}      data - 递归数组      
 * @param {Function}   condition - 递归条件       
 * @param {Function}   before - 执行方法       
 * @param {Function}   next - 递归入口       
 */
export const recursion = function(config) {
    const { data, condition, before, next } = config;
    const loopData = JSON.parse(JSON.stringify(data))
    if (!Array.isArray(loopData)) {
        throw new Error("第一个参数必须为数组");
    }
    const foo = (loopData) => {
        for (let i = 0; i < loopData.length; i++) {
            before(loopData[i]);
            if (condition && condition(loopData[i]) && next) {
                foo(next(loopData[i]));
            }
        }                    
    }
    foo(loopData);
}



//=====================================工具方法====================================//
/** 
    @description  查找父节点
    @author        shuxiaokai
    @create       2019-10-22 09:13"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Function?}    可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       父节点(如果未找到返回null)
*/


export const findParentNode = function(id, treeData, fn, options = {}) {
    const pathId = options.id || "id";
    let result = null;
    const parent = null;
    if (id == null) {
        return null;
    }
    const findPNode = (id, treeData, parent) => {
        treeData.forEach(val => {
            if ((fn && fn(val) === true) || val[pathId] === id) {
                result = parent;
                return;
            }
            if (val.children && val.children.length > 0) {
                findPNode(id, val.children, val);
            }
        })
    }
    findPNode(id, treeData, parent);
    return result;
};

/** 
    @description  查找某个节点
    @author        shuxiaokai
    @create       2019-10-23 19:23"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Function?}    可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       节点(如果未找到返回null)
*/
export const findoNode = function(id, treeData, fn, options) {
    const pathId = options.id || "id";
    let result = null;
    if (id == null) {
        return null;
    }
    const findNodeId = (id, treeData) => {
        for (let i = 0; i < treeData.length; i++) {
            if ((fn && fn(treeData[i]) === true) || treeData[i][pathId] === id) {
                result = treeData[i];
                break
            } 
            if (treeData[i].children && treeData[i].children.length > 0) {
                findNodeId(id, treeData[i].children);
            }
        }
    }
    findNodeId(id, treeData);
    return result;
};

/**
    @description  查找上一个兄弟元素
    @author        shuxiaokai
    @create       2019-10-23 19:23"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Function?}    可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       节点(如果未找到返回null)
*/
export const findPreviousSibling = function(id, treeData, fn, options) {
    const pathId = options.id || "id";
    let sibling = null;
    if (id == null) {
        return null;
    }
    const findNodePreviouseNode = (id, treeData) => {
        for (let i = 0; i < treeData.length; i++) {
            if ((fn && fn(treeData[i]) === true) || treeData[i][pathId] === id) {
                sibling = treeData[i - 1] || null;
                break
            } 
            if (treeData[i].children && treeData[i].children.length > 0) {
                findNodePreviouseNode(id, treeData[i].children);
            }
        }
    }
    findNodePreviouseNode(id, treeData);
    return sibling;
};

/**
    @description  查找下一个兄弟元素
    @author        shuxiaokai
    @create       2019-10-23 19:23"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Function?}    可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       节点(如果未找到返回null)
*/
export const findNextSibling = function(id, treeData, fn, options) {
    const pathId = options.id || "id";
    let sibling = null;
    if (id == null) {
        return null;
    }
    const findNodeNextNode = (id, treeData) => {
        for (let i = 0; i < treeData.length; i++) {
            if ((fn && fn(treeData[i]) === true) || treeData[i][pathId] === id) {
                sibling = treeData[i + 1] || null;
                break
            } 
            if (treeData[i].children && treeData[i].children.length > 0) {
                findNodeNextNode(id, treeData[i].children);
            }
        }
    }
    findNodeNextNode(id, treeData);
    return sibling;
};

/** 
 * @description        遍历森林
 * @author             shuxiaokai
 * @create             2020-03-02 10:17
 * @param {array}     arrData 需要去重数组
 * @param {function}  arrData 需要去重数组
 * @param {string}    childrenKey children对应字段
 */
export const forEachForest = function(forest, fn, options = {}) {
    const childrenKey = options.childrenKey || "children"
    const foo = (forest, fn, childrenKey) => {
        for (let i = 0; i < forest.length; i++) {
            fn(forest[i]);
            if (forest[i][childrenKey] && forest[i][childrenKey].length > 0) {
                forEachForest(forest[i][childrenKey], fn, childrenKey);
            }
        }
    }
    foo(forest || [], fn, childrenKey);
};



/** 
 * @description        深度优先?遍历森林
 * @author              shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-01-31 17:14
 * @update             2020-01-31 17:14
 * @param {Array}      forestData - 数据(森林结构)       
 * @param {function}   rCondition(recursionCondition) - 递归条件,第一个参数为递归数据，返回truly或者falsely
 * @param {string}     rKey(recursionKey) - 满足条件时候的递归字段
 * @param {function}   hooks - 每次数据遍历处理函数,第一个参数为递归数据,第二个参数为当前层级循环的下标值       
 * @return {null}     无返回值
 */

export const dfsForest = (forestData, config) => {
    const { rCondition, rKey, hooks } = config;
    if (!Array.isArray(forestData)) {
        throw new Error("第一个参数必须为数组结构森林");
    }
    if (!rKey) {
        throw new Error("必须指定满足递归条件后需要继续递归的字段");
    }

    //开始递归
    const foo = (forestData, rCondition, hooks, rKey, parent, deep) => {
        for (let i = 0, len = forestData.length; i < len; i++) {
            hooks && hooks(forestData[i], i, forestData, parent, deep);
            if (rCondition && rCondition(forestData[i])) {
                if (!forestData[i][rKey] || !Array.isArray(forestData[i][rKey])) {
                    console.warn("当前指定字段值不为数组，将会忽略本次循环");
                    continue;
                }
                foo(forestData[i][rKey], rCondition, hooks, rKey, forestData[i], deep+1);
            }
        }
    }
    foo(forestData, rCondition, hooks, rKey, null, 0);
}

/** 
 * @description        debounce(调用动作n秒后才会执行，在这n秒内又调用此动作则重新计算时间)
 * @author             shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-01-31 17:14
 * @update             2020-01-31 17:14
 * @param {Function}   fn - 被调用函数       
 * @param {Number}     [delay=300] - 默认延时       
 * @param {Boolean}    immediate - 是否立即执行       
 * @return {null}     无返回值
 */


export const debounce = function(fn, delay = 300, immediate = false) {
    let timer = null;
    return function() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, delay, immediate);
    }
}

/** 
 * @description        throttle(n秒后才执行一次函数)
 * @author             shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-01-31 17:14
 * @update             2020-01-31 17:14
 * @param {Function}   fn - 被调用函数       
 * @param {Number}     [interval=300] - 时间间隔       
 * @return {null}     无返回值
 */


export const throttle = function(fn, interval = 300) {
    let oldTime = Date.now();
    return function() {
        let nowTime = Date.now();
        if (nowTime - oldTime > interval) {
            fn.apply(this, arguments);
            oldTime = nowTime;
        }
    }
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
export const unique = (array = [], key) => {
    const result = [];
    if (key == null) { //不传key值直接进行简单去重处理
        return Array.from(new Set(array))
    } else {
        for (let i = 0, len = array.length; i < len; i++) {
            const isInResult = result.find(val => val[key] === array[i][key]);
            if (array[i][key] && !isInResult) {
                result.push(array[i]);
            }
        }
    }
    return result;
}
/** 
 * @description        将byte转换为易读单位
 * @author              shuxiaokai
 * @create             2020-10-26 21:56
 * @param {string}      byteNum - 字节数量       
 * @return {String}    返回字符串
 */
export const formatBytes = (byteNum) => {
    let result = "";
    if (!byteNum) {
        return "";
    }
    if (byteNum > 0 && byteNum < 1024) { //b
        result = byteNum + "B";
    } else if (byteNum >= 1024 && byteNum < 1024 * 1024) { //KB
        result = (byteNum / 1024).toFixed(2) + "KB"
    } else if (byteNum >= 1024 * 1024 && byteNum < 1024 * 1024 * 1024) { //MB
        result = (byteNum / 1024 / 1024).toFixed(2) + "MB"
    } else if (byteNum >= 1024 * 1024 * 1024 && byteNum < 1024 * 1024 * 1024 * 1024) { //GB
        result = (byteNum / 1024 / 1024 / 1024).toFixed(2) + "GB"
    }
    return result;
}

/** 
 * @description        将毫秒转换为易读单位
 * @author              shuxiaokai
 * @create             2020-10-26 21:56
 * @param {string}      ms - 毫秒       
 * @return {String}    返回字符串
 */
export const formatMs = (ms) => {
    let result = "";
    if (!ms) {
        return "";
    }
    if (ms > 0 && ms < 1000) { //毫秒
        result = ms + "ms";
    } else if (ms >= 1000 && ms < 1000 * 60) { //秒
        result = (ms / 1000).toFixed(2) + "s"
    } 
    return result;
}