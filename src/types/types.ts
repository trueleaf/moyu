import type { Method } from "got";
import { Timings } from '@szmarczak/http-timer';
import type { IncomingHttpHeaders } from 'http'
import { ComponentSize } from "element-plus";

export type Property = {
  _id: string;
  key: string;
  value: string;
  type: "string" | "file";
  description: string;
};
export type CustomRequestInfo = {
  id: string;
  method: Method;
  url: string;
  paths: Property[];
  queryParams: Property[];
  requestBody: {
    mode: "json" | "raw" | "formdata" | "urlencoded" | "binary" | "none";
    rawJson: string;
    formdata: Property[];
    urlencoded: Property[];
    raw: {
      data: string;
      dataType: string;
    };
    file: {
      src: string;
    };
  };
  headers: Property[];
  contentType:
  | ""
  | "application/json"
  | "application/x-www-form-urlencoded"
  | "text/javascript"
  | "multipart/form-data"
  | "text/plain"
  | "application/xml"
  | "text/html";
};
export type Outcoming = {
  lineId: string;
  targetNodeId: string;
  conditionType: 'none' | 'manual';
  conditionScript: string;
}
export type FlowNode = {
  nodeId: string;
  name: string;
  state: 'waiting' | 'pending' | 'finish' | 'error' | 'cancel';
  invokeNum: number;
  requestConfig: {
    timeout?: number;
    variables: Record<string, any>;
    concurrency: number;
  },
  api: {
    name: string;
    type: "http";
    requestInfo: CustomRequestInfo;
    preScript: string;
    afterScript: string;
  };
  outcomings: Outcoming[],
}
export type FlowInfo = {
  config: {
    startNodeId: string,
    apiTimeout: number;
    variables: Record<string, any>;
    stopCondition: 'timeout' | 'error' | 'manual' | 'none',
    stopScript: string;
    stopTimeout: number;
    stopErrorTypes: ('RequestError' | 'ReadError' | 'ParseError' | 'HTTPError' | 'MaxRedirectsError' | 'Error' | 'UnsupportedProtocolError' | 'TimeoutError' | 'UploadError' | 'CancelError')[],
  };
  nodes: FlowNode[];
};

export type RequestStackItem = {
  nodeId: string;
  state: "pending" | "running" | 'finish' | 'failed';
}

export type SendRequestOptions = {
  validVariables: Record<string, any>,
  globalTimeout: number;
}
export type ResponseInfo = {
  id: string;
  apiId: string;
  requestId: string;
  finishTime: string;
  headers: IncomingHttpHeaders,
  contentType: string,
  originRequestUrl: string;
  finalRequestUrl: string;
  statusCode: number;
  isFromCache: boolean;
  dataType: 'text' | 'word' | 'excel' | 'ppt' | 'image' | 'zip' | 'unknown' | 'error',
  mimeType: string;
  /**
   * 如果走缓存则没有ip值
   */
  ip: string;
  redirectUrls: string[];
  timings: Timings;
  retryCount: number;
  bodySize: number;
  body?: unknown;
}

export type Config = {
  /**
   * 是否为electron环境
   */
  isElectron: boolean,
  /**
   * 是否为开发环境
   */
  isDev: boolean,
  /**
   * 更新相关配置
   */
  updateConfig: {
    /**
     * 更新服务器地址
     */
    url: string,
    /**
     * 是否开启自动更新
     */
    autoUpdate: boolean,
  },

  /**
   * 渲染进程配置
   */
  renderConfig: {
    /**
     * 布局相关
     */
    layout: {
      /**
       * 项目中组件库大小
       */
      size: ComponentSize,
    },
    /**
     * 权限相关
     */
    permission: {
      /**
       * 是否开启严格权限校验
       */
      free: boolean,
      /**
       * 路由白名单，free模式下所有路由都不拦截
       */
      whiteList: string[],
    },
    /**
     * http请求相关
     */
    httpRequest: {
      /**
       * 请求url
       */
      url: string,
      /**
       * 图片url
       */
      imgUrl: string,
      /**
       * 超时时间
       */
      timeout: number,
      /**
       * 请求是否携带cookie
       */
      withCredentials: boolean,
    },
    /**
     * mock相关配置
     */
    mock: {
      /**
       * 是否启动mock功能
       */
      enabled: boolean,
      /**
       * mock服务器默认端口
       */
      port: number,
    },
    /**
     * 全局组件配置
     */
    components: {
      /**
       * 表格相关配置信息
       */
      tableConfig: {
        /**
         * 每页条数
         */
        pageSizes: number[],
        /**
         * 每页默认显示数量
         */
        pageSize: number,
      },
    },
    /**
     * 本地数据库配置
     */
    indexedDB: {
      /**
       * indexedDB数据库名称
       */
      dbName: string,
      /**
       * indexedDB数据库版本
       */
      version: number,
    },
    /**
     * 导入文档相关配置
     */
    import: {
      /**
       * 导入文件大小限制
       */
      size: number,
    },
    /**
     * 分享url
     */
    shareUrl: string
  },
  /**
   * 主进程配置
   */
  mainConfig: {
    /**
     * 默认electron窗口宽度
     */
    width: number,
    /**
     * 默认electron窗口高度
     */
    height: number,
    /**
     * 使用本地文件作为主进程加载内容
     */
    useLocalFile: boolean,
    /**
     * 若useLocalFile为false则使用当前地址作为electron加载地址
     */
    onlineUrl: string,
  },
  /**
   * 本地部署相关配置
   */
  localization: {
    /**
     *  版本信息 eg: 0.6.3
     */
    version: string,
    /**
     * 应用名称
     */
    title: string,
    /**
     * 是否开启控制台欢迎文案
     */
    consoleWelcome: boolean,
    /**
     * 客户端下载相关
     */
    download: {
      /**
       * 下载地址
       */
      url: string,
      /**
       * 是否允许下载
       */
      enabled: boolean,
    },
    /**
     * 是否允许用户自主注册账号
     */
    enableRegister: boolean,
    /**
     * 是否允许来宾用户体验
     */
    enableGuest: boolean,
    /**
     * 是否显示文档和帮助链接
     */
    enableDocLink: boolean,
  },
  requestTest: {
    responseLogDir: string;
    autoSaveResponseLog: boolean;
    maxLocalResponseLogSize: number;
    maxLocalWebStorageResponseLogSize: number;
    canLogResponseBodySize: number;
  }
}
