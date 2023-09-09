/* eslint-disable import/extensions */
import type FormData from 'form-data'
import type {
  ApidocParamsType,
  PermissionClientRoute,
  ApidocDetail,
  ApidocMindParam,
  ApidocRequestParamTypes,
  ApidocHttpRequestMethod,
  GlobalConfig,
} from '@@/global'
import type {
  PermissionUserInfo,
  PermissionMenu,
  ApidocBanner,
  ApidocPropertyType,
  ApidocProperty
} from './global'

/*
|--------------------------------------------------------------------------
| 权限相关store
|--------------------------------------------------------------------------
| 模块：PermissionState 权限相关模块
|
*/
//权限state
type PermissionState = {
  userInfo: PermissionUserInfo,
  menus: PermissionMenu[],
  routes: PermissionClientRoute[],
  loadingBanner: boolean,
  globalConfig: GlobalConfig
}
/*
|--------------------------------------------------------------------------
| apidoc相关store
|--------------------------------------------------------------------------
| 模块1：ApidocBannerState 文档左侧导航栏
| 模块2: ApidocProjectBaseInfo 项目基本信息
|
*/

//文档banner state
type ApidocBannerState = {
  loading: boolean, //左侧导航数据加载状态
  banner: ApidocBanner[],
  defaultExpandedKeys: string[],
};
//项目基本信息
type ApidocProjectVariable = {
  /**
     * 变量id
     */
  _id: string,
  /**
     * 变量名称
     */
  name: string,
  /**
     * 变量值类型
     */
  type: ApidocPropertyType,
  /**
     * 变量值
     */
  value: string,
}
//项目host信息
type ApidocProjectHost = {
  /**
     * 主机名称
     */
  name: string,
  /**
     * 主机地址
     */
  url: string,
  /**
     * 主机id
     */
  _id: string,
}

//项目参数模板
type ApidocProjectParamsTemplate = {
  /**
     * 模板id
     */
  _id: string,
  /**
     * 模板名称
     */
  name: string,
  /**
     * 模板参数类型
     */
  presetParamsType: ApidocParamsType,
  /**
     * 创建者
     */
  creatorName: string,
  /**
     * 参数信息
     */
  items: ApidocProperty[],
}
//请求方法规则
type ApidocRequestMethodRule = {
  /**
     * 允许请求参数类型
     */
  enabledContenTypes: ApidocRequestParamTypes,
  /**
     * 方法名称
     */
  name: string,
  /**
     * 值
     */
  value: string,
  /**
     * 颜色
     */
  iconColor: string,
  /**
     * 是否启用
     */
  enabled: boolean,
};
//项目规则
type ApidocProjectRules = {
  /**
     * 单个文件夹允许最大文件个数
     */
  fileInFolderLimit: number,
  /**
     * 请求方法
     */
  requestMethods: ApidocRequestMethodRule[],
}
type ApidocCookieInfo = {
  /**
     * cookie键
     */
  name: string,
  /**
     * cookie值
     */
  value: string,
  /**
     * 有效域
     */
  domin: string,
  /**
     * path
     */
  path: string,
  /**
     * expires
     */
  expires: string,
  /**
     * httpOnly
     */
  httpOnly: boolean,
  /**
     * secure
     */
  secure: boolean,
  /**
     * sameSite
     */
  sameSite: string,
}
//公共请求头信息
type ApidocProjectCommonHeader = {
  /**
     * _id值
     */
  _id: string,
  /**
     * 是否为文件夹
     */
  isFolder: boolean,
  /**
     * 公共请求头信息
     */
  commonHeaders: Pick<ApidocProperty, 'key' | 'value' | 'description'>[],
  /**
     * 子元素
     */
  children: ApidocProjectCommonHeader[]
}
//项目基本信息
type ApidocProjectBaseInfoState = {
  /**
     * 项目id
     */
  _id: string,
  /**
     * 项目名称
     */
  projectName: string,
  /**
     * 项目变量信息
     */
  variables: ApidocProjectVariable[],
  /**
     * 临时变量，主要用于脚本中
     */
  tempVariables: Omit<ApidocProjectVariable, '_id'>[],
  /**
     * 项目host信息
     */
  hosts: ApidocProjectHost[],
  /**
     * 联想参数
     */
  mindParams: ApidocMindParam[],
  /**
     * 参数模板信息
     */
  paramsTemplate: ApidocProjectParamsTemplate[],
  /**
     * 项目规则
     */
  rules: ApidocProjectRules,
  /**
     * 全局cookie信息
     */
  globalCookies: Record<string, ApidocCookieInfo[]>,
  /**
     * 布局
     */
  layout: 'vertical' | 'horizontal',
  /**
     * 是否启用web端代理功能
     */
  webProxy: boolean,
  /**
     * 代理服务器信息
     */
  proxy: {
    /**
         * 代理服务器地址
         */
    path: string,
    /**
         * 是否启用代理
         */
    enabled: boolean
  },
  /**
     * 模式，view,edit
     */
  mode: 'view' | 'edit',
  /**
     * 公共请求头
     */
  commonHeaders: ApidocProjectCommonHeader[]
};
//=========================================================================//
type ApidocTabType =
    'doc' |
    'config' |
    'paramsTemplate' |
    'onlineLink' |
    'exportDoc' |
    'importDoc' |
    'history' |
    'variable' |
    'mock' |
    'recycler' |
    'guide' |
    'mindParams' |
    'hook' |
    'package' |
    'commonHeader' |
    'apiflow' |
    'prefix'
//tabs导航

type ApidocTab = {
  /**
     * 节点id
     */
  _id: string,
  /**
     * 项目id
     */
  projectId: string,
  /**
     * tab类型
     */
  tabType: ApidocTabType,
  /**
     * tab文案显示
     */
  label: string,
  /**
     * 头部图标
     */
  head: {
    /**
         * 图标
         */
    icon: string,
    /**
         * 颜色
         */
    color: string,
  },
  /**
     * 是否保存
     */
  saved: boolean,
  /**
     * 是否固定
     */
  fixed: boolean,
  /**
     * 是否选中
     */
  selected: boolean,
};
type ApidocTabsState = {
  tabs: {
    [prop: string]: ApidocTab[]
  }
}
/*
|--------------------------------------------------------------------------
| api文档，文档录入、远端返回值
|--------------------------------------------------------------------------
|
*/
type ApidocState = {
  apidoc: ApidocDetail,
  originApidoc: ApidocDetail,
  defaultHeaders: ApidocProperty<'string'>[],
  loading: boolean,
  saveLoading: boolean,
  saveDocDialogVisible: boolean,
  savedDocId: string,
}

type ApidocResponseState = {
  /**
     * 返回头信息
     */
  header: Record<string, unknown>,
  /**
     * 返回值contentType
     */
  contentType?: string,
  /**
     * http版本信息
     */
  httpVersion: string,
  /**
     * 远端ip信息
     */
  ip: string,
  /**
     * 状态码
     */
  statusCode: number,
  /**
     * 状态信息
     */
  statusMessage: string,
  /**
     * 耗时
     */
  rt: number,
  /**
     * 返回值大小
     */
  size: number,
  /**
     * 是否正在请求中
     */
  loading: boolean,
  /**
     * 是否已经接收到返回值
     */
  isResponse: boolean,
  /**
     * cookie信息
     */
  cookies: ApidocCookieInfo[],
  /**
     * 返回进度
     */
  process: {
    /**
         * 百分比
         */
    percent: number,
    /**
         * 总大小
         */
    total: number,
    /**
         * 当前传输数据大小
         */
    transferred: number,
  },
  /**
     * 返回值
     */
  data: {
    /**
         * 文件类型
         */
    file: {
      url: string,
      raw: string,
      mime: string, //mime类型
      ext: string, //后缀
      name: string, //文件名称
    },
    /**
         * 数据类型(contentType)
         */
    type?: string,
    /**
         * 文本返回值
         */
    text: string,
  },
}

/*
|--------------------------------------------------------------------------
| mock相关
|--------------------------------------------------------------------------
*/
type ApidocMockMapInfo = {
  id: string, //接口id
  projectId: string, //项目id
  url: string, //请求地址
  customMockUrl: string, //自定义mock地址
  method: ApidocHttpRequestMethod, //请求方法
  isCustom?: boolean, //是否为用户自定义mock数据
}
type ApidocMockState = {
  /**
     * mock服务器监听端口
     */
  mockServerPort: number,
  /**
     * 地址映射，用于
     */
  urlMap: ApidocMockMapInfo[],
  /**
     * 服务器状态
     */
  serverState: 'disconnection' | 'connecting' | 'connection' | 'error' | 'closing',
};
/*
|--------------------------------------------------------------------------
| 最终请求参数
|--------------------------------------------------------------------------
*/
type ApidocRequest = {
  url: string, //请求url
  headers: Record<string, string>, //请求头
  method: ApidocHttpRequestMethod, //请求方法
  body: string | FormData, //请求body
};
/*
|--------------------------------------------------------------------------
| 前置脚本，后置脚本公共变量
|--------------------------------------------------------------------------
*/
type ApidocWorkerState = {
  /**
     * 会话状态，刷新页面消失
     */
  sessionState: Record<string, unknown>;
  /**
     * 本地状态，刷新页面不会刷新
     */
  localState: Record<string, unknown>;
  /**
     * 项目内成员可见状态，允许多机共享
     */
  remoteState: Record<string, unknown>
};
/*
|--------------------------------------------------------------------------
| 接口编排
|--------------------------------------------------------------------------
*/
type ApiflowNodeType = 'node' | 'line';
type ApiflowOutComingDirection = 'left' | 'top' | 'right' | 'bottom'
/**
 * 坐标信息
 */
type ApiflowCoordinate = {
  clientX: number,
  clientY: number
}
/**
 * 线条信息
 */
type ApiflowLineInfo = {
  /**
     * 线条id
     */
  id: string,
  /**
     * 线条从节点那个方向引出的
     */
  fromPosition: ApiflowOutComingDirection,
  /**
     * 线条从节点那个方向引入的
     */
  toPosition: ApiflowOutComingDirection | null,
  /**
 * 相对于窗口开始位置x值
 */
  lineClientStartX: number,
  /**
     * 相对于窗口开始位置y值
     */
  lineClientStartY: number,
  /**
     * 相对于窗口结束位置x值
     */
  lineClientEndX: number,
  /**
     * 相对于窗口结束位置y值
     */
  lineClientEndY: number,
  /**
     * 宽度
     */
  width: number,
  /**
     * 高度
     */
  height: number,
  /**
     * left值
     */
  offsetX: number,
  /*
     * top值
     */
  offsetY: number,
  /**
     * z-index值
     */
  zIndex: number,
  /**
     * 箭头相关信息
     */
  arrowInfo: {
    leftTopPoint: ApiflowCoordinate,
    rightBottomPoint: ApiflowCoordinate,
  },
}
/**
 * 节点信息
 */
type ApiflowNodeInfo = {
  /**
     * 节点id
     */
  id: string,
  /**
     * 样式信息
     */
  styleInfo: {
    /**
         * 距离左侧距离
         */
    offsetX: number,
    /**
         * 距离顶部距离
         */
    offsetY: number,
    /**
         * 节点宽度
         */
    width: number,
    /**
         * 节点高度
         */
    height: number,
    /**
         * z-index值
         */
    zIndex: number
  },
  /**
     * 出线
     */
  outcomings: ApiflowLineInfo[],
  /**
     * 入线
     */
  incomings: ApiflowLineInfo[],
};
/**
 * resizebar状态
 */
type ApiflowResizeBarState = {
  hoverNodeId: string;
  /**
     * 缩放方向
     */
  hoverPosition: 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom',
  /**
     * 缩放节点是否被按下
     */
  isMouseDown: boolean;
  /**
     * 鼠标clientX
     */
  mouseDownclientX: number;
  /**
     * 鼠标clientY
     */
  mouseDownclientY: number;
  /**
     * 点击时node宽度
     */
  mouseDownNodeWidth: number;
  /**
     * 点击时node高度
     */
  mouseDownNodeHeight: number;
  /**
     * 缩放时候，节点相对于某个点固定位置
     */
  nodeFixedX: number;
  /**
     * 缩放时候，节点相对于某个点固定位置
     */
  nodeFixedY: number;
}
/**
 * createLineDot状态
 */
type ApiflowCreateLineDotState = {
  hoverNodeId: string;
  /**
     * 缩放方向
     */
  hoverPosition: 'left' | 'top' | 'right' | 'bottom',
  /**
     * 是否被点击
     */
  isMouseDown: boolean;
}
/**
 * 线条状态
 */
type ApiflowLineState = {
  /**
     * 鼠标hover线条id
     */
  hoverLineId: string;
  /**
     * 当前拖拽节点id
     */
  dragLineId: string;
  /**
     * 是否在拖拽箭头上
     */
  isHoverDragArrow: boolean;
  /**
     * 是否mousedown拖拽箭头
     */
  isMouseDown: boolean;
}
//画布容器信息
type ApiflowContainerInfo = {
  /**
     * 距离左侧距离
     */
  clientX: number,
  /**
     * 距离顶部距离
     */
  clientY: number,
  /**
     * 容器宽度
     */
  width: number,
  /**
     * 容器高度
     */
  height: number,
  /**
     * 引出线条圆点大小
     */
  createLineDotSize: number;
  /**
     * 节点缩放按钮大小
     */
  resizeNodeBarSize: number;
  /**
     * 节点最小宽度
     */
  nodeMinWidth: number;
  /**
     * 节点最小高度
     */
  nodeMinHeight: number;
};
type ApiflowState = {
  /**
     * 当前被点击dot的节点
     */
  currentSelectedDotId: string,
  /**
     * 鼠标在引出线条dot上面信息
     */
  mouseInCreateLineDotInfo: {
    nodeId: string;
    position: 'left' | 'top' | 'right' | 'bottom'
  };
  /**
     * 鼠标在节点放大缩小按钮上面信息
     */
  mouseInResizeDotInfo: {
    /**
         * 当前被缩放节点id
         */
    nodeId: string;
    /**
         * 缩放方向
         */
    position: 'leftTop' | 'rightTop' | 'leftBottom' | 'rightBottom',
    /**
         * 缩放节点是否被按下
         */
    isMouseDown: boolean;
    /**
         * 鼠标clientX
         */
    mouseDownclientX: number;
    /**
         * 鼠标clientY
         */
    mouseDownclientY: number;
    /**
         * 点击时node宽度
         */
    mouseDownNodeWidth: number;
    /**
         * 点击时node高度
         */
    mouseDownNodeHeight: number;
    /**
         * 缩放时候，节点相对于某个点固定位置
         */
    nodeFixedX: number;
    /**
         * 缩放时候，节点相对于某个点固定位置
         */
    nodeFixedY: number;
  };
  /**
     * 鼠标在线条区域上信息
     */
  mouseInLineInfo: {
    /**
         * 线条id
         */
    mouseInlineId: string;
    /**
         * 是否在拖拽箭头上
         */
    isInDragArrow: boolean;
    /**
         * 当前拖拽节点id
         */
    dragLineId: string;
    /**
         * 是否mousedown拖拽箭头
         */
    isMouseDown: boolean;
  },
  /**
     * 当前被激活的节点
     */
  activeNodeId: string,
  /**
     * 鼠标位置在节点上id
     */
  hoverNodeId: string,
  /**
     * 鼠标是否点击元素
     */
  isMouseDownNode: boolean,
  /**
     * 当前操作的节点信息
     */
  currentMouseDownNode: ApiflowNodeInfo | null;
  /**
     * 容器信息
     */
  containerInfo: ApiflowContainerInfo,
  /**
     * 元素集合
     */
  nodeList: ApiflowNodeInfo[]
}

/*
|--------------------------------------------------------------------------
| 其他
|--------------------------------------------------------------------------
|
*/
//全局state
type State = {
  permission: PermissionState,
  'apidoc/banner': ApidocBannerState,
  'apidoc/baseInfo': ApidocProjectBaseInfoState,
  'apidoc/tabs': ApidocTabsState,
  'apidoc/apidoc': ApidocState,
  'apidoc/response': ApidocResponseState,
  'apidoc/mock': ApidocMockState,
  'apidoc/request': ApidocRequest,
  'apidoc/workerState': ApidocWorkerState,
  'apidoc/apiflow': ApiflowState,
}
export {
  PermissionState,
  ApidocBannerState,
  ApidocProjectBaseInfoState,
  ApidocTabsState,
  ApidocTab,
  ApidocState,
  ApidocProjectHost,
  ApidocRequestMethodRule,
  ApidocResponseState,
  ApidocCookieInfo,
  ApidocProjectParamsTemplate,
  ApidocProjectRules,
  ApidocMockState,
  ApidocMockMapInfo,
  ApiflowNodeInfo,
  ApidocRequest,
  ApidocProjectVariable,
  ApidocWorkerState,
  ApiflowState,
  ApiflowContainerInfo,
  ApiflowLineInfo,
  ApiflowOutComingDirection,
  State,
}
