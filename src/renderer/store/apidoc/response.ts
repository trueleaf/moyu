import { router } from "@/router"
import { ApidocCookieInfo } from "@src/types/apidoc/base-info"
import { ApidocResponseState } from "@src/types/apidoc/response"
import { defineStore, storeToRefs } from "pinia"
import { ref } from "vue"
import { useApidocTas } from "./tabs"
import { apidocCache } from "@/cache/apidoc"
import { formatDate } from "@/helper"
import setCookieParser from 'set-cookie-parser'
import { useApidoc } from "./apidoc"
import { useApidocBaseInfo } from "./base-info"

type ResponseBaseInfo = {
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
     * contentType信息
     */
  contentType: string
}
type FileInfo = {
  url: string,
  mime: string,
  ext: string,
  name: string,
}

export const useApidocResponse = defineStore('apidocResponse', () => {
  const { tabs } = storeToRefs(useApidocTas())
  const { apidoc } = storeToRefs(useApidoc())
  const { globalCookies } = storeToRefs(useApidocBaseInfo())
  const header = ref<Record<string, string>>({})
  const contentType = ref('')
  const httpVersion = ref('')
  const ip = ref('')
  const statusCode = ref(0)
  const statusMessage = ref('')
  const rt = ref(0)
  const size = ref(0)
  const loading = ref(false)
  const isResponse = ref(true)
  const cookies = ref<ApidocCookieInfo[]>([])
  const process = ref({
    percent: 0,
    total: 0,
    transferred: 0,
  })
  const data = ref<ApidocResponseState['data']>({
    file: {
      url: '',
      raw: '',
      mime: '', //mime类型
      ext: '', //后缀
      name: '', //文件名称
    },
    type: '',
    text: '',
  })
  /*
  |--------------------------------------------------------------------------
  | 方法
  |--------------------------------------------------------------------------
  */
  //改变所有数据
  const changeAll = (payload: ApidocResponseState): void => {
    payload.isResponse = true; //fix: isResponse默认设置为true
    if (payload.header != null) {
      header.value = payload.header;
    }
    if (payload.data != null) {
      data.value = payload.data;
    }
    if (payload.contentType != null) {
      contentType.value = payload.contentType;
    }
    if (payload.httpVersion != null) {
      httpVersion.value = payload.httpVersion;
    }
    if (payload.ip != null) {
      ip.value = payload.ip;
    }
    if (payload.statusCode != null) {
      statusCode.value = payload.statusCode;
    }
    if (payload.statusMessage != null) {
      statusMessage.value = payload.statusMessage;
    }
    if (payload.rt != null) {
      rt.value = payload.rt;
    }
    if (payload.size != null) {
      size.value = payload.size;
    }
    if (payload.loading != null) {
      loading.value = payload.loading;
    }
    if (payload.cookies != null) {
      cookies.value = payload.cookies;
    }
    if (payload.process != null) {
      process.value = payload.process;
    }
  }
  //改变加载状态，loading代表数据是否完全加载完
  const changeLoading = (state: boolean): void => {
    loading.value = state;
    if (loading.value === false) {
      const projectId = router.currentRoute.value.query.id as string;
      const currentTabs = tabs.value[projectId];
      const currentSelectTab = currentTabs?.find((tab) => tab.selected) || null;
      if (currentSelectTab) {
        apidocCache.setResponse(currentSelectTab._id, state);
      }
    }
  }
  //数据是否返回
  const changeIsResponse = (state: boolean): void => {
    isResponse.value = state;
  }
  //改变responseHeader
  const changeResponseHeader = (payload: Record<string, string>): void => {
    header.value = payload;
  }
  //改变response基本信息,
  const changeResponseBaseInfo = (payload: ResponseBaseInfo): void => {
    httpVersion.value = payload.httpVersion;
    ip.value = payload.ip;
    statusCode.value = payload.statusCode;
    statusMessage.value = payload.statusMessage;
    contentType.value = payload.contentType;
    data.value.type = payload.contentType;
  }
  //清空response值
  const clearResponseInfo = (): void => {
    header.value = {};
    contentType.value = '';
    httpVersion.value = '';
    ip.value = '';
    statusCode.value = 0;
    statusMessage.value = '';
    rt.value = 0;
    size.value = 0;
    cookies.value = [];
    process.value = {
      percent: 0,
      total: 0,
      transferred: 0,
    };
    data.value = {
      file: {
        url: '',
        raw: '',
        mime: '',
        ext: '',
        name: '',
      },
      type: '',
      text: '',
    };
  }
  //改变返回值进度
  const changeResponseProgress = (progress: ApidocResponseState['process']): void => {
    process.value = progress;
  }
  //=====================================返回值====================================//
  //字符串类型返回值
  const changeResponseTextValue = (textValue: string): void => {
    data.value.text = textValue;
    data.value.file.url = ''; //清空url
  }
  //改变返回file类型数据相关信息
  const changeResponseFileInfo = (fileInfo: FileInfo): void => {
    data.value.file.url = fileInfo.url;
    data.value.file.mime = fileInfo.mime;
    data.value.file.ext = fileInfo.ext;
    data.value.file.name = fileInfo.name;
    data.value.text = ''; //清空文字
  }
  //文件类型返回值
  const changeResponseFileUrl = (url: string): void => {
    data.value.file.url = url;
    data.value.text = ''; //清空文字
  }
  //改变文件类型
  const changeResponseFileExt = (ext: string): void => {
    data.value.file.ext = ext;
  }
  //改变返回data类型
  const changeResponseContentType = (type: string): void => {
    data.value.type = type;
  }
  //改变返回时间
  const changeResponseTime = (rtTime: number): void => {
    rt.value = rtTime;
  }
  //改变返回值大小
  const changeResponseSize = (resSize: number): void => {
    size.value = resSize;
  }
  //改变cookie值
  const changeResponseCookies = (resCookies: string[]): void => {
    const urlInfo = apidoc.value.item.url
    const fullPatth = urlInfo.host + urlInfo.path;
    const dominReg = /([^./]{1,62}\.){1,}[^./]{1,62}/;
    const matchedDomin = fullPatth.match(dominReg);
    cookies.value = [];
    resCookies.forEach((cookieStr) => {
      const parsedCookie = setCookieParser.parse(cookieStr)
      const cookieInfo: ApidocCookieInfo = {
        name: '',
        value: '',
        domin: '',
        path: '',
        expires: '',
        httpOnly: false,
        secure: false,
        sameSite: '',
      };
      const realDomin = parsedCookie[0].domain || (matchedDomin ? matchedDomin[0] : '')
      cookieInfo.name = parsedCookie[0].name;
      cookieInfo.value = parsedCookie[0].value;
      cookieInfo.domin = realDomin;
      cookieInfo.path = parsedCookie[0].path || '';
      cookieInfo.expires = formatDate(parsedCookie[0].expires);
      cookieInfo.httpOnly = parsedCookie[0].httpOnly || false;
      cookieInfo.secure = parsedCookie[0].secure || false;
      cookieInfo.sameSite = parsedCookie[0].sameSite || '';
      cookies.value.push(cookieInfo);
      if (!globalCookies.value[realDomin]) {
        globalCookies.value[realDomin] = [];
      }
      const matchedCookieIndex = globalCookies.value[realDomin].findIndex(info => info.name === cookieInfo.name)
      if (matchedCookieIndex === -1) { //不存在则添加一个
        globalCookies.value[realDomin].push(JSON.parse(JSON.stringify(cookieInfo)));
      } else { //存在则覆盖
        globalCookies.value[realDomin][matchedCookieIndex] = JSON.parse(JSON.stringify(cookieInfo));
      }
    })
    localStorage.setItem('apidoc/globalCookies', JSON.stringify(globalCookies))
  }
  return {
    header,
    contentType,
    httpVersion,
    ip,
    statusCode,
    statusMessage,
    rt,
    size,
    loading,
    isResponse,
    cookies,
    process,
    data,
    changeAll,
    changeResponseFileUrl,
    changeResponseFileExt,
    changeResponseSize,
    changeResponseCookies,
    changeLoading,
    changeIsResponse,
    changeResponseHeader,
    changeResponseBaseInfo,
    clearResponseInfo,
    changeResponseProgress,
    changeResponseTextValue,
    changeResponseFileInfo,
    changeResponseContentType,
    changeResponseTime,
  }
})