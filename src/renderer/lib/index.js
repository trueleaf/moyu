/* eslint-disable no-shadow */
/**
    @description  生成uuid
    @author       shuxiaokai
    @create       2019-10-29 16:32"
    @return {string}      uuid
*/
import { v4 as uuidV4 } from "uuid";
import lodashIsEqual from "lodash/isEqual";
import lodashCloneDeep from "lodash/cloneDeep";
import dayjs from "dayjs";

//对象对比
export const isEqual = lodashIsEqual;
//深拷贝
export const cloneDeep = lodashCloneDeep;

/**
 * @description        返回uuid
 * @author             shuxiaokai
 * @create             2021-01-20 10:52
 */
export function uuid() {
    return uuidV4();
}

/**
    @description  返回变量类型
    @author        shuxiaokai
    @create       2019-10-29 16:32"
    @param {any}      variable
    @return       小写对象类型(null,number,string,boolean,symbol,function,object,array,regexp)
*/
export const getType = (variable) => Object.prototype.toString.call(variable).slice(8, -1).toLocaleLowerCase();

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
export function recursion(config) {
    const { data, condition, before, next } = config;
    const cpData = JSON.parse(JSON.stringify(data));
    if (!Array.isArray(cpData)) {
        throw new Error("第一个参数必须为数组");
    }
    const foo = (loopData) => {
        for (let i = 0; i < loopData.length; i += 1) {
            before(loopData[i]);
            if (condition && condition(loopData[i]) && next) {
                foo(next(loopData[i]));
            }
        }
    };
    foo(cpData);
}
/**
 * @description        递归挑选对象部分属性
 * @author             shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-01-08 21:32
 * @update             2020-01-08 21:32
 * @param {Array}      data - 递归数组
 * @param {Function}   condition - 递归条件
 * @param {Strubf}     rKey - 执行方法
 * @param {Array}      fields - 需要挑选的字段
 */
export function recursivePicker(data, options = {}) {
    const { condition, fields = [], rKey = "children" } = options;
    const result = [];
    if (!Array.isArray(data)) {
        throw new Error("第一个参数必须为数组");
    }
    const foo = (loopData, result) => {
        if (!loopData || loopData.length < 0) {
            return;
        }
        for (let i = 0; i < loopData.length; i += 1) {
            const loopItem = loopData[i]
            const pickedItem = {};
            fields.forEach((field) => {
                if (field !== rKey) { //循环参数不错处理
                    pickedItem[field] = loopItem[field];
                }
            })
            pickedItem[rKey] = [];
            result.push(pickedItem)
            if (condition && condition(loopData[i])) {
                foo(loopItem[rKey], pickedItem[rKey]);
            } else if (!condition) {
                foo(loopItem[rKey], pickedItem[rKey]);
            }
        }
    };
    foo(data, result);
    return result;
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

export function findParentNode(id, treeData, fn, options = {}) {
    const pathId = options.id || "id";
    let result = null;
    const parent = null;
    if (id == null) {
        return null;
    }
    const findPNode = (nodeId, data, parentNode) => {
        data.forEach((val) => {
            if ((fn && fn(val) === true) || val[pathId] === nodeId) {
                result = parentNode;
                return;
            }
            if (val.children && val.children.length > 0) {
                findPNode(nodeId, val.children, val);
            }
        });
    };
    findPNode(id, treeData, parent);
    return result;
}

/**
    @description  查找某个节点
    @author        shuxiaokai
    @create       2019-10-23 19:23"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Function?}    可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       节点(如果未找到返回null)
*/
export function findoNode(id, treeData, fn, options) {
    const pathId = options.id || "id";
    let result = null;
    if (id == null) {
        return null;
    }
    const findNodeId = (nodeId, data) => {
        for (let i = 0; i < data.length; i += 1) {
            if ((fn && fn(data[i]) === true) || data[i][pathId] === nodeId) {
                result = data[i];
                break;
            }
            if (data[i].children && data[i].children.length > 0) {
                findNodeId(nodeId, data[i].children);
            }
        }
    };
    findNodeId(id, treeData);
    return result;
}

/**
    @description  查找上一个兄弟元素
    @author        shuxiaokai
    @create       2019-10-23 19:23"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Function?}    可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       节点(如果未找到返回null)
*/
export function findPreviousSibling(id, treeData, fn, options) {
    const pathId = options.id || "id";
    let sibling = null;
    if (id == null) {
        return null;
    }
    const findNodePreviouseNode = (nodeId, data) => {
        for (let i = 0; i < data.length; i += 1) {
            if ((fn && fn(data[i]) === true) || data[i][pathId] === nodeId) {
                sibling = data[i - 1] || null;
                break;
            }
            if (data[i].children && data[i].children.length > 0) {
                findNodePreviouseNode(nodeId, data[i].children);
            }
        }
    };
    findNodePreviouseNode(id, treeData);
    return sibling;
}

/**
    @description  查找下一个兄弟元素
    @author        shuxiaokai
    @create       2019-10-23 19:23"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Function?}    可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       节点(如果未找到返回null)
*/
export function findNextSibling(id, treeData, fn, options) {
    const pathId = options.id || "id";
    let sibling = null;
    if (id == null) {
        return null;
    }
    const findNodeNextNode = (nodeId, data) => {
        for (let i = 0; i < data.length; i += 1) {
            if ((fn && fn(data[i]) === true) || data[i][pathId] === nodeId) {
                sibling = data[i + 1] || null;
                break;
            }
            if (data[i].children && data[i].children.length > 0) {
                findNodeNextNode(nodeId, data[i].children);
            }
        }
    };
    findNodeNextNode(id, treeData);
    return sibling;
}

/**
 * @description        遍历森林
 * @author             shuxiaokai
 * @create             2020-03-02 10:17
 * @param {array}     arrData 需要去重数组
 * @param {function}  arrData 需要去重数组
 * @param {string}    childrenKey children对应字段
 */
export function forEachForest(forest, fn, options = {}) {
    const childrenKey = options.childrenKey || "children";
    const foo = (forestData, hook, key) => {
        for (let i = 0; i < forestData.length; i += 1) {
            hook(forestData[i]);
            if (forestData[i][key] && forestData[i][key].length > 0) {
                forEachForest(forestData[i][key], hook, key);
            }
        }
    };
    foo(forest || [], fn, childrenKey);
}

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

export function dfsForest(forestData, config) {
    const { rCondition, rKey, hooks } = config;
    if (!Array.isArray(forestData)) {
        throw new Error("第一个参数必须为数组结构森林");
    }
    if (!rKey) {
        throw new Error("必须指定满足递归条件后需要继续递归的字段");
    }

    //开始递归
    const foo = (data, condition, hooks, key, parent, deep) => {
        for (let i = 0, len = data.length; i < len; i += 1) {
            if (hooks) {
                hooks(data[i], i, data, parent, deep);
            }
            if (condition && condition(data[i])) {
                if (!data[i][key] || !Array.isArray(data[i][key])) {
                    console.warn("当前指定字段值不为数组，将会忽略本次循环");
                } else {
                    foo(
                        data[i][key],
                        condition,
                        hooks,
                        key,
                        data[i],
                        deep + 1,
                    );
                }
            }
        }
    };
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

export function debounce(fn, delay = 300, immediate = false) {
    let timer = null;
    return function foo(...args) {
        clearTimeout(timer);
        timer = setTimeout(
            () => {
                fn.apply(this, args);
            },
            delay,
            immediate,
        );
    };
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

export function throttle(fn, interval = 300) {
    let oldTime = Date.now();
    return function foo(...args) {
        const nowTime = Date.now();
        if (nowTime - oldTime > interval) {
            fn.apply(this, args);
            oldTime = nowTime;
        }
    };
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
export function unique(array = [], key) {
    let result = [];
    if (key == null) {
        //不传key值直接进行简单去重处理
        result = Array.from(new Set(array));
    } else {
        for (let i = 0, len = array.length; i < len; i += 1) {
            const isInResult = result.find((val) => val[key] === array[i][key]);
            if (array[i][key] != null && !isInResult) {
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
    if (byteNum > 0 && byteNum < 1024) {
        //b
        result = `${byteNum}B`;
    } else if (byteNum >= 1024 && byteNum < 1024 * 1024) {
        //KB
        result = `${(byteNum / 1024).toFixed(2)}KB`;
    } else if (byteNum >= 1024 * 1024 && byteNum < 1024 * 1024 * 1024) {
        //MB
        result = `${(byteNum / 1024 / 1024).toFixed(2)}MB`;
    } else if (byteNum >= 1024 * 1024 * 1024 && byteNum < 1024 * 1024 * 1024 * 1024) {
        //GB
        result = `${(byteNum / 1024 / 1024 / 1024).toFixed(2)}GB`;
    }
    return result;
};

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
        result = `${ms}ms`;
    } else if (ms >= 1000 && ms < 1000 * 60) { //秒
        result = `${(ms / 1000).toFixed(2)}s`;
    } else if (ms >= 1000 * 60) { //分钟
        result = `${(ms / 1000 / 60).toFixed(2)}m`;
    }
    return result;
};

//=====================================树形数据操作====================================//
/**
    @description  根据id查找父元素
    @author       shuxiaokai
    @create       2019-10-22 09:13"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {options?}
           -id: string 默认值为 "id"  查询的id在真实数据中的含义
           -hook  可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       父节点(如果未找到返回null)
*/
export function findParentNodeById(treeData, id, options = {}) {
    const pathId = options.id || "id";
    const { hook } = options;
    let result = null;
    const parent = null;
    if (id == null) {
        return null;
    }
    const findPNode = (id, treeData, parent) => {
        treeData.forEach((val) => {
            if ((hook && hook(val) === true) || val[pathId] === id) {
                result = parent;
                return;
            }
            if (val.children && val.children.length > 0) {
                findPNode(id, val.children, val);
            }
        });
    };
    findPNode(id, treeData, parent);
    return result;
}
/**
    @description  根据id查找节点
    @author        shuxiaokai
    @create       2019-10-23 19:23"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Object}
            -id: string 默认值为 "id"  查询的id在真实数据中的含义
            -hook  可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       节点(如果未找到返回null)
*/
export function findNodeById(treeData, id, options) {
    const pathId = options.id || "id";
    const fn = options.hook;
    let result = null;
    if (id == null) {
        console.warn("未传入id");
        return null;
    }
    if (!treeData || !Array.isArray(treeData)) {
        throw new Error("第一个参数必须为数组");
    }
    const findNodeId = (id, treeData) => {
        for (let i = 0; i < treeData.length; i += 1) {
            if ((fn && fn(treeData[i]) === true) || treeData[i][pathId] === id) {
                result = treeData[i];
                break;
            }
            if (treeData[i].children && treeData[i].children.length > 0) {
                findNodeId(id, treeData[i].children);
            }
        }
    };
    findNodeId(id, treeData);
    return result;
}

/**
    @description  根据id查找上一个兄弟节点
    @author       shuxiaokai
    @create       2019-10-23 19:23"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Object}
            -id: string 默认值为 "id"  查询的id在真实数据中的含义
            -hook  可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       节点(如果未找到返回null)
*/
export function findPreviousSiblingById(treeData, id, options) {
    const pathId = options.id || "id";
    const { hook } = options;
    let sibling = null;
    if (id == null) {
        return null;
    }
    const findPreviouseNode = (id, treeData) => {
        for (let i = 0; i < treeData.length; i += 1) {
            if ((hook && hook(treeData[i]) === true) || treeData[i][pathId] === id) {
                sibling = treeData[i - 1] || null;
                break;
            }
            if (treeData[i].children && treeData[i].children.length > 0) {
                findPreviouseNode(id, treeData[i].children);
            }
        }
    };
    findPreviouseNode(id, treeData);
    return sibling;
}

/**
    @description  查找下一个兄弟元素
    @author        shuxiaokai
    @create       2019-10-23 19:23"
    @param {String}       节点的id值
    @param {Array}        需要查找的树形组件
    @param {Object}
            -id: string 默认值为 "id"  查询的id在真实数据中的含义
            -hook  可以传入一个函数就行条件判断，函数第一个参数为当前节点信息，存在fn那么判断结果以fn返回值为准
    @return       节点(如果未找到返回null)
*/
export function findNextSiblingById(treeData, id, options) {
    const pathId = options.id || "id";
    const { hook } = options;
    let sibling = null;
    if (id == null) {
        return null;
    }
    const findNextNode = (id, treeData) => {
        for (let i = 0; i < treeData.length; i += 1) {
            if ((hook && hook(treeData[i]) === true) || treeData[i][pathId] === id) {
                sibling = treeData[i + 1] || null;
                break;
            }
            if (treeData[i].children && treeData[i].children.length > 0) {
                findNextNode(id, treeData[i].children);
            }
        }
    };
    findNextNode(id, treeData);
    return sibling;
}

/**
     * @description        格式化日期
     * @author             shuxiaokai
     * @create             2021-02-08 09:51
     * @param {Date}       date - 日期对象
     * @param {string}     rule - 规则
     * @return {String}    返回自定义日期格式
     */
export function formatDate(date, rule) {
    const realRule = rule || "YYYY-MM-DD HH:mm"
    const result = dayjs(date).format(realRule);
    return result;
}
