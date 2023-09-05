/* eslint-disable no-lonely-if */
/* eslint-disable no-continue */
/**
 * @description        全局工具函数
 * @author             shuxiaokai
 * @create             2021-06-15 22:55
 */
import { nanoid } from 'nanoid/non-secure'
import type { ApidocHttpRequestMethod, ApidocProperty, ApidocPropertyType, ApidocDetail, ApidocRequestParamTypes, ApidocCodeInfo } from '@@/global'
import isEqual from 'lodash/isEqual';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashDebounce from 'lodash/debounce';
import { ClientAreaRange, ClientPoint } from '@@/apiflow';
import lodashThrottle from 'lodash/throttle';
import dayjs from 'dayjs';
import mitt from 'mitt'
import Mock from '@/server/mock/mock'
import { store } from '@/store/index'
import type { ApidocProjectBaseInfoState } from '@@/store';
import tips from './tips'

type Data = Record<string, unknown>

/**
 * 对象对比
 */
export const lodashIsEqual = isEqual;
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
const emitter = mitt<{
  'apidoc/mock/closeMockServer': void;
  'apidoc/mock/openMockServer': void;
  'apidoc/mock/restartMockserver': void;
  'apidoc/editor/removePreEditor': void;
  'apidoc/editor/removeAfterEditor': void;
  'apidoc/hook/jumpToEdit': ApidocCodeInfo;
  'apidoc/mock/restartMockServer': void;
  'apidoc/tabs/addOrDeleteTab': void,
  'apidoc/getBaseInfo': ApidocProjectBaseInfoState,
  'searchItem/change': string,
  'tabs/saveTabSuccess': void,
  'tabs/saveTabError': void,
  'tabs/cancelSaveTab': void,
}>()

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
 * @description        遍历森林
 * @author             shuxiaokai
 * @create             2020-03-02 10:17
 * @param {array}      arrData 数组数据
 * @param {function}   fn 每次遍历执行得函数
 * @param {string}     childrenKey children对应字段
 */
export function forEachForest<T extends ForestData>(forest: T[], fn: (arg: T) => void, options?: { childrenKey?: string }): void {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return;
  }
  const childrenKey = options?.childrenKey || 'children';
  const foo = (forestData: T[], hook: (arg: T) => void) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      hook(currentData);
      if (!currentData[childrenKey]) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!Array.isArray(currentData[childrenKey])) {
        // eslint-disable-next-line no-continue
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
export function findParentById<T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let pNode: T | null = null;
  const foo = (forestData: ForestData, p: T | null) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        pNode = p;
        return;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey], currentData);
      }
    }
  };
  foo(forest, null);
  return pNode;
}

/**
 * 根据id查询下一个兄弟节点
 */
export function findNextSiblingById<T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let nextSibling: T | null = null;
  const foo = (forestData: ForestData) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        nextSibling = forestData[i + 1]
        break;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return nextSibling;
}
/**
 * 根据id查询上一个兄弟节点
 */
export function findPreviousSiblingById<T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型');
    return null;
  }
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  let previousSibling: T | null = null;
  const foo = (forestData: ForestData) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        previousSibling = forestData[i - 1]
        break;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return previousSibling;
}

/**
 * 根据id查询元素
 */
export function findNodeById<T extends ForestData>(forest: T[], id: string | number, options?: { childrenKey?: string, idKey?: string }): T | null {
  if (!Array.isArray(forest)) {
    console.error('第一个参数必须为数组类型')
    return null;
  }
  let result = null;
  const childrenKey = options?.childrenKey || 'children';
  const idKey = options?.idKey || 'id';
  const foo = (forestData: ForestData) => {
    for (let i = 0; i < forestData.length; i += 1) {
      const currentData = forestData[i];
      if (currentData[idKey] === id) {
        result = currentData;
        break;
      }
      if (currentData[childrenKey] && currentData[childrenKey].length > 0) {
        foo(currentData[childrenKey]);
      }
    }
  };
  foo(forest);
  return result;
}

type TreeNode<T> = {
  children: T[],
};
/**
 * 将树形数据所有节点转换为一维数组,数据会进行深拷贝
 */
export function flatTree<T extends TreeNode<T>>(root: T): T[] {
  const result: T[] = [];
  const foo = (nodes: T[]): void => {
    for (let i = 0; i < nodes.length; i += 1) {
      const item = nodes[i];
      const itemCopy = cloneDeep(item);
      itemCopy.children = [];
      result.push(itemCopy);
      if (item.children && item.children.length > 0) {
        foo(item.children);
      }
    }
  }
  foo([root]);
  return result;
}

/**
 * 获取字符串宽度
 */
export function getTextWidth(text: string, font: string): number {
  let canvas: HTMLCanvasElement | null = document.createElement('canvas');
  const context = canvas.getContext('2d');
  (context as CanvasRenderingContext2D).font = font;
  const metrics = (context as CanvasRenderingContext2D).measureText(text);
  canvas = null;
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
  const realRule = rule || 'YYYY-MM-DD HH:mm'
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
  return ['GET', 'POST', 'PUT', 'DELETE', 'TRACE', 'OPTIONS', 'PATCH', 'HEAD'];
}

/**
 * 生成一条接口参数
 */
export function apidocGenerateProperty<T extends ApidocPropertyType = 'string'>(type?: T): ApidocProperty<T> {
  const result = {
    _id: uuid(),
    key: '',
    type: type || 'string',
    description: '',
    value: '',
    required: true,
    select: true,
  };
  return result as ApidocProperty<T>;
}
/**
 * 生成一条默认mock数据
 */
export function apidocGenerateMockInfo(): ApidocDetail['mockInfo'] {
  const result: ApidocDetail['mockInfo'] = {
    path: '',
    httpStatusCode: 200,
    responseDelay: 0,
    responseType: 'json',
    responseHeaders: [],
    json: '',
    image: {
      type: 'png',
      width: 200,
      height: 200,
      fontSize: 30,
      size: 0,
      color: '#fff',
      backgroundColor: '#aaa'
    },
    file: {
      type: 'doc',
      filePath: '',
    },
    text: '',
    customResponseScript: '',
  };
  return result;
}
/*
|--------------------------------------------------------------------------
|--------------------------------------------------------------------------
|
*/
type Properties = ApidocProperty<ApidocPropertyType>[]
// eslint-disable-next-line no-use-before-define
type JSON = string | number | boolean | null | JsonObj | JsonArr
type JsonArr = JSON[]
type JsonObj = {
  [x: string]: JSON
}
/**
 * @description        apidoc转换value值
 * @author             shuxiaokai
 * @create             2021-8-26 21:56
 * @param {string}     value - 需要转换的值
 * @return {String}    返回转换后的字符串
 * @remark             这个方法具有强耦合性
 */
export function apidocConvertValue(value: string): string {
  const matchdVariable = value.toString().match(/\{\{\s*([^} ]+)\s*\}\}/);
  const globalVariables = store.state['apidoc/baseInfo'].variables.map(v => ({ name: v.name, value: v.value }));
  const scriptVariables = store.state['apidoc/baseInfo'].tempVariables;
  if (value.toString().startsWith('@')) {
    return Mock.mock(value);
  }
  if (matchdVariable) {
    const varInfo = globalVariables.concat(scriptVariables).find((v) => v.name === matchdVariable[1]);
    return varInfo?.value || value;
  }
  return value;
}

/**
 * 将录入参数转换为json参数
 */
export function apidocConvertParamsToJsonData(properties: Properties): JSON {
  if (properties.length === 0) {
    console.warn('无任何参数值')
    return null;
  }
  const rootType = properties[0].type;
  const rootValue = properties[0].value;

  if (rootType === 'boolean') {
    return rootValue === 'true';
  }
  if (rootType === 'string') {
    return rootValue;
  }
  if (rootType === 'number') {
    const isNumber = !Number.isNaN(Number(rootValue));
    if (isNumber) {
      return Number(rootValue);
    }
    console.warn('参数无法被转换为数字类型，默认为0');
    return 0;
  }
  if (rootType === 'file') {
    console.warn('根元素不允许为file');
    return null;
  }
  return {};
}

/**
 * @description        生成一份apidoc默认值
 * @author             shuxiaokai
 * @create             2021-09-07 22:35
 */
export function apidocGenerateApidoc(id?: string): ApidocDetail {
  return {
    _id: id || '',
    pid: '',
    projectId: '',
    isFolder: false,
    sort: 0,
    info: {
      name: '',
      description: '',
      version: '',
      type: 'api',
      creator: '',
      maintainer: '',
      spendTime: 0,
    },
    preRequest: {
      raw: ''
    },
    afterRequest: {
      raw: ''
    },
    item: {
      method: 'GET',
      url: {
        host: '',
        path: '',
      },
      paths: [],
      queryParams: [],
      requestBody: {
        mode: 'json',
        rawJson: '',
        formdata: [],
        urlencoded: [],
        raw: {
          data: '',
          dataType: 'text/plain'
        },
        file: {
          url: '',
          raw: ''
        },
      },
      responseParams: [{
        title: '成功返回',
        statusCode: 200,
        value: {
          file: {
            url: '',
            raw: ''
          },
          strJson: '',
          dataType: 'application/json',
          text: ''
        },
        isMock: true
      }],
      headers: [],
      contentType: '',
    },
    mockInfo: {
      path: '',
      httpStatusCode: 200,
      responseDelay: 0,
      responseType: 'json',
      responseHeaders: [],
      json: '',
      image: {
        type: 'png',
        width: 200,
        height: 200,
        fontSize: 30,
        size: 0,
        color: '#fff',
        backgroundColor: '#aaa'
      },
      file: {
        type: 'doc',
        filePath: '',
      },
      text: '',
      customResponseScript: '',
    },
  }
}
/**
 * @description        生成一份参数类型数组
 * @author             shuxiaokai
 * @create             2022-01-20 22:35
 */
export function apidocGenerateRequestParamTypes(): ApidocRequestParamTypes {
  return ['path', 'params', 'json', 'x-www-form-urlencoded', 'formData', 'text/javascript', 'text/plain', 'text/html', 'application/xml'];
}
// /**
//  * @description        获取当前节点公共请求头
//  * @author             shuxiaokai
//  * @create             2022-01-20 22:35
//  */
//  export function apidocGetCommonHeader(docId: string) {
//     store.state["apidoc/apidoc"].apidoc
// }

/**
 * @description        将byte转换为易读单位
 * @author              shuxiaokai
 * @create             2020-10-26 21:56
 * @param {number}      byteNum - 字节数量
 * @return {String}    返回字符串
 */
export function formatBytes(byteNum: number): string {
  let result = '';
  if (!byteNum) {
    return '';
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
}

/**
 * @description        将毫秒转换为易读单位
 * @author              shuxiaokai
 * @create             2020-10-26 21:56
 * @param {number}      ms - 毫秒
 * @return {String}    返回字符串
 */
export function formatMs(ms: number): string {
  let result = '';
  if (!ms) {
    return '';
  }
  if (ms > 0 && ms < 1000) { //毫秒
    result = `${ms}ms`;
  } else if (ms >= 1000 && ms < 1000 * 60) { //秒
    result = `${(ms / 1000).toFixed(2)}s`;
  } else if (ms >= 1000 * 60) { //分钟
    result = `${(ms / 1000 / 60).toFixed(2)}m`;
  }
  return result;
}

/**
 * @description        拷贝文本
 * @author             shuxiaokai
 * @create             2020-10-26 21:56
 * @param {string}     str - 需要拷贝的文本
 */
export function copy(str: string): void {
  const dom = document.createElement('textarea');
  dom.value = str;
  dom.style.position = 'fixed';
  dom.style.top = '-9999px';
  dom.style.left = '-9999px';
  document.body.appendChild(dom);
  dom.select();
  document.execCommand('Copy', false);
  document.body.removeChild(dom);
}
export function randomInt(start: number, end: number): number {
  if (start > end) {
    console.log('第二个参数必须大于第一个');
    return 0;
  }
  const range = end - start - 1;
  return Math.floor((Math.random() * range + 1))
}
//模拟延迟
export async function sleep(delay: number): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      if (!delay) {
        resolve();
      }
      setTimeout(() => {
        resolve();
      }, delay)
    } catch (error) {
      reject(error);
    }
  })
}
//检查鼠标位置是否在矩形节点内部
export function checkPointIsInArea(point: ClientPoint, areaRange: ClientAreaRange): boolean {
  let isLeftRightInArea = false;
  let isTopBottomInArea = false;
  if (point.clientX >= areaRange.leftTopPosition.clientX && point.clientX <= areaRange.rightBottomPosition.clientX) {
    isLeftRightInArea = true;
  }
  if (point.clientY >= areaRange.leftTopPosition.clientY && point.clientY <= areaRange.rightBottomPosition.clientY) {
    isTopBottomInArea = true;
  }
  return isLeftRightInArea && isTopBottomInArea
}

export * from './apidoc-format'
