import { 
  apidocGenerateApidoc, 
  event, 
  apidocGenerateProperty, 
  cloneDeep, 
  forEachForest, 
  uuid,
  apidocGenerateMockInfo
} from "@/helper"
import { 
  ApidocBodyMode,
  Response, 
  ApidocBodyRawType, 
  ApidocContentType, 
  ApidocDetail, 
  ApidocHttpRequestMethod, 
  ApidocMindParam, 
  ApidocProperty 
} from "@src/types/global"
import { defineStore, storeToRefs } from "pinia"
import axios, { Canceler } from 'axios'
import { axios as axiosInstance } from '@/api/api'
import { ref } from "vue"
import 'element-plus/es/components/message-box/style/css';
import { ElMessageBox } from "element-plus"
import { router } from "@/router"
import { apidocCache } from "@/cache/apidoc"
import { useApidocTas } from "./tabs"
import { useApidocBanner } from "./banner"

type EditApidocPropertyPayload<K extends keyof ApidocProperty> = {
  data: ApidocProperty,
  field: K,
  value: ApidocProperty[K]
}

export const useApidoc = defineStore('apidoc', () => {
  const cancel: Canceler[] = [] //请求列表  
  const apidoc = ref<ApidocDetail>(apidocGenerateApidoc());
  const originApidoc = ref<ApidocDetail>(apidocGenerateApidoc());
  const defaultHeaders = ref<ApidocProperty<"string">[]>([]);
  const loading = ref(false);
  const saveLoading = ref(false);
  const saveDocDialogVisible = ref(false);
  const savedDocId = ref('');
  /*
  |--------------------------------------------------------------------------
  | 通用方法
  |--------------------------------------------------------------------------
  */
  //添加默认请求头
  const getDefaultHeaders = (contentType: ApidocContentType) => {
    const defaultHeaders: ApidocProperty<'string'>[] = [];
    const params = apidocGenerateProperty();
    params.key = 'Content-Length';
    params.value = '<发送请求时候自动计算>';
    params.description = '<消息的长度>';
    defaultHeaders.push(params);
    //=========================================================================//
    const params2 = apidocGenerateProperty();
    params2.key = 'User-Agent';
    params2.value = '<发送请求时候自动处理>';
    params2.description = '<用户代理软件信息>';
    defaultHeaders.push(params2);
    //=========================================================================//
    const params3 = apidocGenerateProperty();
    params3.key = 'Host';
    params3.value = '<发送请求时候自动处理>';
    params3.description = '<主机信息>';
    defaultHeaders.push(params3);
    //=========================================================================//
    const params4 = apidocGenerateProperty();
    params4.key = 'Accept-Encoding';
    params4.value = 'gzip, deflate, br';
    params4.description = '<客户端理解的编码方式>';
    defaultHeaders.push(params4);
    //=========================================================================//
    const params5 = apidocGenerateProperty();
    params5.key = 'Connection';
    params5.value = 'keep-alive';
    params5.description = '<当前的事务完成后，是否会关闭网络连接>';
    defaultHeaders.push(params5);
    if (contentType) {
      const params6 = apidocGenerateProperty();
      params6.key = 'Content-type';
      params6.value = contentType;
      params6.description = '<根据body类型自动处理>';
      defaultHeaders.push(params6);
    }
    return defaultHeaders;
  }
  //过滤合法的联想参数(string、number)
  const filterValidParams = (arrayParams: ApidocProperty[], type: ApidocMindParam['paramsPosition']) => {
    const result: ApidocMindParam[] = [];
    // const projectId = router.currentRoute.value.query.id as string || shareRouter.currentRoute.value.query.id as string;
    //todo
    const projectId = router.currentRoute.value.query.id as string;
    forEachForest(arrayParams, (data) => {
      const isComplex = data.type === 'object' || data.type === 'array';
      const copyData = cloneDeep(data) as ApidocMindParam;
      copyData.paramsPosition = type;
      copyData.projectId = projectId;
      if (!isComplex && data.key !== '' && data.value !== '' && data.description !== '') { //常规数据
        result.push(copyData);
      } else if (isComplex && data.key !== '' && data.description !== '') {
        result.push(copyData);
      }
    });
    return result;
  }
  /*
  |--------------------------------------------------------------------------
  | url、host、method、name、description
  |--------------------------------------------------------------------------
  */
  //改变host值
  const changeApidocHost = (host: string): void => {
    apidoc.value.item.url.host = host;
  }
  //改变url值
  const changeApidocUrl = (path: string): void => {
    apidoc.value.item.url.path = path;
  }
  //改变请求method
  const changeApidocMethod = (method: ApidocHttpRequestMethod): void => {
    apidoc.value.item.method = method;
  }
  //改变接口名称
  const changeApidocName = (name: string): void => {
    apidoc.value.info.name = name;
  }
  //改变api文档id值
  const changeApidocId = (_id: string): void => {
    apidoc.value._id = _id;
  }
  //改变接口描述
  const changeDescription = (description: string): void => {
    apidoc.value.info.description = description;
  }
  /*
    |--------------------------------------------------------------------------
    | Params
    |--------------------------------------------------------------------------
  */
  //改变path参数
  const changePathParams = (paths: ApidocProperty<'string'>[]): void => {
    apidoc.value.item.paths = paths
  }
  //在头部插入查询参数
  const unshiftQueryParams = (queryParams: ApidocProperty<'string'>[]): void => {
    queryParams.forEach((params) => {
      apidoc.value.item.queryParams.unshift(params);
    })
  }
  /*
    |--------------------------------------------------------------------------
    | requestBody
    |--------------------------------------------------------------------------
    */
  //改变body参数mode类型
  const changeBodyMode = (mode: ApidocBodyMode): void => {
    apidoc.value.item.requestBody.mode = mode;
  }
  //改变body参数raw的mime类型
  const changeBodyRawType = (rawType: ApidocBodyRawType): void => {
    apidoc.value.item.requestBody.raw.dataType = rawType;
  }
  //改变rawBody数据
  const changeRawJson = (rawJson: string): void => {
    apidoc.value.item.requestBody.rawJson = rawJson;
  }
  /*
  |--------------------------------------------------------------------------
  | raw参数
  |--------------------------------------------------------------------------
  */
  //改变raw的参数值
  const changeBodyRawValue = (rawValue: string): void => {
    apidoc.value.item.requestBody.raw.data = rawValue;
  }
  //改变contentType值
  const changeContentType = (contentType: ApidocContentType): void => {
    apidoc.value.item.contentType = contentType;
    const matchedValue = defaultHeaders.value.find((val) => val.key === 'Content-type');
    const matchedIndex = defaultHeaders.value.findIndex((val) => val.key === 'Content-type');
    if (contentType && matchedValue) { //存在contentType并且默认header值也有
      matchedValue.value = contentType
    } else if (contentType && !matchedValue) { //存在contentType但是默认header没有
      const params = apidocGenerateProperty();
      params.key = 'Content-type';
      params.value = contentType;
      params.description = '<根据body类型自动处理>';
      defaultHeaders.value.push(params);
    } else if (!contentType && matchedIndex !== -1) {
      defaultHeaders.value.splice(matchedIndex, 1)
    }
  }
  /*
    |--------------------------------------------------------------------------
    | response参数
    |--------------------------------------------------------------------------
    */
  //改变某个response的title参数
  const changeResponseParamsTitleByIndex = (payload: { index: number, title: string }): void => {
    const { index, title } = payload
    apidoc.value.item.responseParams[index].title = title;
  }
  //改变某个response的statusCode值
  const changeResponseParamsCodeByIndex = (payload: { index: number, code: number }): void => {
    const { index, code } = payload
    apidoc.value.item.responseParams[index].statusCode = code;
  }
  //改变某个response的dataType值
  const changeResponseParamsDataTypeByIndex = (payload: { index: number, type: ApidocContentType }): void => {
    const { index, type } = payload
    apidoc.value.item.responseParams[index].value.dataType = type;
  }
  //改变某个response文本value值
  const changeResponseParamsTextValueByIndex = (payload: { index: number, value: string }): void => {
    const { index, value } = payload
    apidoc.value.item.responseParams[index].value.text = value;
  }
  //根据index值改变response
  const changeResponseByIndex = (payload: { index: number, value: string }): void => {
    const { index, value } = payload
    apidoc.value.item.responseParams[index].value.strJson = value;
  }
  //根据index值改变response的json数据
  const changeResponseStrJsonByIndex = (payload: { index: number, value: string }): void => {
    const { index, value } = payload
    apidoc.value.item.responseParams[index].value.strJson = value;
  }
  //根据index值改变mock值
  const changeResponseMockByIndex = (index: number): void => {
    apidoc.value.item.responseParams.forEach(v => {
      v.isMock = false;
    })
    apidoc.value.item.responseParams[index].isMock = true;
  }
  //新增一个response
  const addResponseParam = (): void => {
    apidoc.value.item.responseParams.push({
      _id: uuid(),
      title: '返回参数名称',
      statusCode: 200,
      value: {
        strJson: '',
        dataType: 'application/json',
        text: '',
        file: {
          url: '',
          raw: '',
        }
      },
      isMock: false,
    })
  }
  //删除一个response
  const deleteResponseByIndex = (index: number): void => {
    apidoc.value.item.responseParams.splice(index, 1);
  }
  /*
    |--------------------------------------------------------------------------
    | 其它
    |--------------------------------------------------------------------------
    |
  */
  //重新赋值apidoc数据
  const changeApidoc = (payload: ApidocDetail): void => {
    // queryParams如果没有数据则默认添加一条空数据
    if (payload.item.queryParams.length === 0) {
      payload.item.queryParams.push(apidocGenerateProperty());
    }
    //formData如果没有数据则默认添加一条空数据
    if (payload.item.requestBody.formdata.length === 0) {
      payload.item.requestBody.formdata.push(apidocGenerateProperty());
    }
    //urlencoded如果没有数据则默认添加一条空数据
    if (payload.item.requestBody.urlencoded.length === 0) {
      payload.item.requestBody.urlencoded.push(apidocGenerateProperty());
    }
    //headers如果没有数据则默认添加一条空数据
    if (payload.item.headers.length === 0) {
      payload.item.headers.push(apidocGenerateProperty());
    }
    defaultHeaders.value = getDefaultHeaders(payload.item.contentType);
    //若全部返回数据isMock都为false，则取第一条数据为mock数据
    if (payload.item.responseParams.every(v => !v.isMock)) {
      payload.item.responseParams[0].isMock = true;
    }
    if (payload.item.headers.length === 0) {
      payload.item.headers.push(apidocGenerateProperty());
    }
    if (payload.mockInfo == null) {
      payload.mockInfo = apidocGenerateMockInfo();
    }
    if (!payload.mockInfo.responseHeaders) {
      payload.mockInfo.responseHeaders = []
    }
    if (payload.mockInfo.responseHeaders?.length === 0) {
      payload.mockInfo.responseHeaders.push(apidocGenerateProperty());
    }
    //如果host为空则默认为mockserver
    // if (!payload.item.url.host && !payload.item.url.path.startsWith("http")) {
    //     payload.item.url.host = `http://${config.renderConfig.mock.ip}:${store.state["apidoc/mock"].mockServerPort}`
    // }
    apidoc.value = payload;
  }
  //改变apidoc原始缓存值
  const changeOriginApidoc = (): void => {
    originApidoc.value = cloneDeep(apidoc.value);
  }
  //改变apidoc数据加载状态
  const changeApidocLoading = (state: boolean): void => {
    loading.value = state;
  }
  //保存apidoc时候更新loading
  const changeApidocSaveLoading = (loading: boolean): void => {
    saveLoading.value = loading;
  }
  //添加一个请求参数数据
  const addProperty = (payload: { data: ApidocProperty[], params: ApidocProperty }): void => {
    payload.data.push(payload.params);
  }
  //删除一个请求参数数据
  const deleteProperty = (payload: { data: ApidocProperty[], index: number }): void => {
    payload.data.splice(payload.index, 1);
  }
  //改变请求参数某个属性的值
  const changePropertyValue = <K extends keyof ApidocProperty>(payload: EditApidocPropertyPayload<K>): void => {
    const { data, field, value } = payload;
    data[field] = value;
  }
  //保存接口弹窗是否展示
  const changeSaveDocDialogVisible = (visible: boolean): void => {
    saveDocDialogVisible.value = visible;
  }
  //改变当前需要保存的节点id
  const changeSavedDocId = (id: string): void => {
    savedDocId.value = id;
  }
  /*
  |--------------------------------------------------------------------------
  | 接口调用
  |--------------------------------------------------------------------------
  */
  //获取项目基本信息
  const getApidocDetail = (payload: { id: string, projectId: string }): Promise<void> => {
    const { deleteTabByIds } = useApidocTas();
    if (cancel.length > 0) {
      cancel.forEach((c) => {
        c('取消请求');
      })
    }
    return new Promise((resolve, reject) => {
      changeApidocLoading(true);
      changeApidocLoading(true)
      const params = {
        projectId: payload.projectId,
        _id: payload.id,
      }
      axiosInstance.get<Response<ApidocDetail>, Response<ApidocDetail>>('/api/project/doc_detail', {
        params,
        cancelToken: new axios.CancelToken((c) => {
          cancel.push(c);
        }),
      }).then((res) => {
        if (res.data === null) { //接口不存在提示用户删除接口
          ElMessageBox.confirm('当前接口不存在，可能已经被删除!', '提示', {
            confirmButtonText: '关闭接口',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            deleteTabByIds({
              projectId: payload.projectId,
              ids: [payload.id]
            })
          }).catch((err) => {
            if (err === 'cancel' || err === 'close') {
              return;
            }
            console.error(err);
          });
          return;
        }
        changeApidoc(res.data);
        changeOriginApidoc()
        const cachedServer = apidocCache.getPreviousServer(payload.projectId);
        const { path } = apidoc.value.item.url
        if (cachedServer && !path.startsWith('http') && !path.startsWith('https')) {
          changeApidocHost(cachedServer)
        }
        resolve()
      }).catch((err) => {
        console.error(err);
        reject(err);
      }).finally(() => {
        changeApidocLoading(false)
      })
    });
  }
  //保存接口
  const saveApidoc = (): Promise<void> => {
    const { tabs } = storeToRefs(useApidocTas());
    const { changeTabInfoById } = useApidocTas();
    const { changeBannerInfoById } = useApidocBanner()
    return new Promise((resolve, reject) => {
      //todo
      // const projectId = router.currentRoute.value.query.id as string || shareRouter.currentRoute.value.query.id as string;
      const projectId = router.currentRoute.value.query.id as string;
      const currentTabs = tabs.value[projectId];
      const currentSelectTab = currentTabs?.find((tab) => tab.selected) || null;
      if (!currentSelectTab) {
        console.warn('缺少tab信息');
        return;
      }
      const apidocDetail = apidoc.value;
      changeApidocSaveLoading(true)
      //todo
      // context.dispatch('saveMindParams');
      const params = {
        _id: currentSelectTab._id,
        projectId,
        info: apidocDetail.info,
        item: apidocDetail.item,
        preRequest: apidocDetail.preRequest,
        afterRequest: apidocDetail.afterRequest,
        mockInfo: apidocDetail.mockInfo,
      };
      axiosInstance.post('/api/project/fill_doc', params).then(() => {
        //改变tab请求方法
        changeTabInfoById({
          id: currentSelectTab._id,
          field: 'head',
          value: {
            icon: params.item.method,
            color: '',
          },
        })
        
        //改变banner请求方法
        changeBannerInfoById({
          id: currentSelectTab._id,
          field: 'method',
          value: params.item.method,
        })
        //改变origindoc的值
        changeOriginApidoc();
        //改变tab未保存小圆点
        changeTabInfoById({
          id: currentSelectTab._id,
          field: 'saved',
          value: true,
        })
        //todo 新增一个mock映射
        // store.commit('apidoc/mock/addMockUrl', {
        //   id: currentSelectTab._id,
        //   projectId,
        //   url: apidocDetail.item.url.path,
        //   method: apidocDetail.item.method,
        // })
        resolve();
      }).catch((err) => {
        //改变tab未保存小圆点
        changeTabInfoById({
          id: currentSelectTab._id,
          field: 'saved',
          value: false,
        })
        console.error(err);
        reject(err);
      }).finally(() => {
        changeApidocSaveLoading(false)
      });
    })
  }
  /**
   * 保存联想参数
   */
  const saveMindParams = (): void => {
    const apidocDetail = apidoc.value;
    //todo
    const projectId = router.currentRoute.value.query.id as string;
    // const projectId = router.currentRoute.value.query.id as string || shareRouter.currentRoute.value.query.id as string;
    const paths = filterValidParams(apidocDetail.item.paths, 'paths');
    const queryParams = filterValidParams(apidocDetail.item.queryParams, 'queryParams').filter(v => v.description && v.value);
    const params = {
      projectId,
      mindParams: paths.concat(queryParams)
    };
    axiosInstance.post('/api/project/doc_params_mind', params).then((res) => {
      if (res.data != null) {
        //todo
        // store.commit('apidoc/baseInfo/changeMindParams', res.data);
      }
    }).catch((err) => {
      console.error(err);
    });
  }
  //改变保存apidoc弹窗状态
  const openSaveDocDialog = (id: string): Promise<'save' | 'cancel'> => {
    changeSaveDocDialogVisible(true)
    changeSavedDocId(id)
    return new Promise((resolve, reject) => {
      try {
        event.on('tabs/saveTabSuccess', () => {
          resolve('save');
        })
        event.on('tabs/cancelSaveTab', () => {
          resolve('cancel');
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  return {
    apidoc,
    originApidoc,
    loading,
    defaultHeaders,
    saveLoading,
    saveDocDialogVisible,
    savedDocId,
    getApidocDetail,
    changeApidocSaveLoading,
    addProperty,
    deleteProperty,
    changeApidoc,
    changeOriginApidoc,
    changeApidocLoading,
    changeSaveDocDialogVisible,
    changeSavedDocId,
    changePropertyValue,
    changePathParams,
    unshiftQueryParams,
    changeBodyMode,
    changeBodyRawType,
    changeApidocHost,
    changeBodyRawValue,
    changeContentType,
    changeApidocUrl,
    changeApidocMethod,
    changeApidocName,
    changeApidocId,
    changeDescription,
    changeRawJson,
    changeResponseParamsTitleByIndex,
    changeResponseParamsCodeByIndex,
    changeResponseParamsDataTypeByIndex,
    changeResponseParamsTextValueByIndex,
    changeResponseByIndex,
    changeResponseStrJsonByIndex,
    changeResponseMockByIndex,
    addResponseParam,
    deleteResponseByIndex,
    saveApidoc,
    saveMindParams,
    openSaveDocDialog,
  }
})