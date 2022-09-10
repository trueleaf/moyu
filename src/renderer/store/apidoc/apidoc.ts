import { ActionContext } from "vuex"
import axios, { Canceler } from "axios"
import { ElMessageBox } from "element-plus"
import type { State as RootState, ApidocState, } from "@@/store"
import type { ApidocDetail, Response, ApidocProperty, ApidocBodyMode, ApidocHttpRequestMethod, ApidocBodyRawType, ApidocContentType, ApidocMindParam } from "@@/global"
import { axios as axiosInstance } from "@/api/api"
import { router } from "@/router/index"
import { store } from "@/store/index"
import { apidocGenerateProperty, apidocGenerateApidoc, apidocGenerateMockInfo, cloneDeep, forEachForest, uuid, apidocConvertParamsToJsonStr, event } from "@/helper/index"
import shareRouter from "@/pages/modules/apidoc/doc-view/router/index"
import { apidocCache } from "@/cache/apidoc"
// import config from "@/../config/config"

type EditApidocPropertyPayload<K extends keyof ApidocProperty> = {
    data: ApidocProperty,
    field: K,
    value: ApidocProperty[K]
}

//接口删除提示用户
function confirmInvalidDoc(projectId: string, delId: string) {
    ElMessageBox.confirm("当前接口不存在，可能已经被删除!", "提示", {
        confirmButtonText: "关闭接口",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        store.dispatch("apidoc/tabs/deleteTabByIds", {
            projectId,
            ids: [delId]
        });
    }).catch((err) => {
        if (err === "cancel" || err === "close") {
            return;
        }
        console.error(err);
    });
}
//添加默认请求头
function getDefaultHeaders(contentType: ApidocContentType) {
    const defaultHeaders: ApidocProperty<"string">[] = [];
    const params = apidocGenerateProperty();
    params.key = "Content-Length";
    params.value = "<发送请求时候自动计算>";
    params.description = "<消息的长度>";
    defaultHeaders.push(params);
    //=========================================================================//
    const params2 = apidocGenerateProperty();
    params2.key = "User-Agent";
    params2.value = "<发送请求时候自动处理>";
    params2.description = "<用户代理软件信息>";
    defaultHeaders.push(params2);
    //=========================================================================//
    const params3 = apidocGenerateProperty();
    params3.key = "Host";
    params3.value = "<发送请求时候自动处理>";
    params3.description = "<主机信息>";
    defaultHeaders.push(params3);
    //=========================================================================//
    const params4 = apidocGenerateProperty();
    params4.key = "Accept-Encoding";
    params4.value = "gzip, deflate, br";
    params4.description = "<客户端理解的编码方式>";
    defaultHeaders.push(params4);
    //=========================================================================//
    const params5 = apidocGenerateProperty();
    params5.key = "Connection";
    params5.value = "keep-alive";
    params5.description = "<当前的事务完成后，是否会关闭网络连接>";
    defaultHeaders.push(params5);
    if (contentType) {
        const params6 = apidocGenerateProperty();
        params6.key = "Content-type";
        params6.value = contentType;
        params6.description = "<根据body类型自动处理>";
        defaultHeaders.push(params6);
    }
    return defaultHeaders;
}
//过滤合法的联想参数(string、number)
function filterValidParams(arrayParams: ApidocProperty[], type: ApidocMindParam["paramsPosition"]) {
    const result: ApidocMindParam[] = [];
    const projectId = router.currentRoute.value.query.id as string || shareRouter.currentRoute.value.query.id as string;
    forEachForest(arrayParams, (data) => {
        const isComplex = data.type === "object" || data.type === "array";
        const copyData = cloneDeep(data) as ApidocMindParam;
        copyData.paramsPosition = type;
        copyData.projectId = projectId;
        if (!isComplex && data.key !== "" && data.value !== "" && data.description !== "") { //常规数据
            result.push(copyData);
        } else if (isComplex && data.key !== "" && data.description !== "") {
            result.push(copyData);
        }
    });
    return result;
}

const cancel: Canceler[] = [] //请求列表
const apidoc = {
    namespaced: true,
    state: {
        /**
         * 实时文档信息
         */
        apidoc: apidocGenerateApidoc(),
        /**
         * 原始文档信息
         */
        originApidoc: apidocGenerateApidoc(),
        /**
         * 默认请求头
         */
        defaultHeaders: [],
        /**
         * 是否正在加载数据
         */
        loading: false,
        /**
         * 是否正在保存接口
         */
        saveLoading: false,
        /**
         * 保存接口弹窗是否展示
         */
        saveDocDialogVisible: false,
        /**
         * 需要保存接口的id
         */
        savedDocId: ""
    },
    mutations: {
        /*
        |--------------------------------------------------------------------------
        | url、host、method、name、description
        |--------------------------------------------------------------------------
        */
        //改变host值
        changeApidocHost(state: ApidocState, host: string): void {
            state.apidoc.item.url.host = host;
        },
        //改变url值
        changeApidocUrl(state: ApidocState, path: string): void {
            state.apidoc.item.url.path = path;
        },
        //改变请求method
        changeApidocMethod(state: ApidocState, method: ApidocHttpRequestMethod): void {
            state.apidoc.item.method = method;
        },
        //改变接口名称
        changeApidocName(state: ApidocState, name: string): void {
            state.apidoc.info.name = name;
        },
        //改变api文档id值
        changeApidocId(state: ApidocState, _id: string): void {
            state.apidoc._id = _id;
        },
        //改变接口描述
        changeDescription(state: ApidocState, description: string): void {
            state.apidoc.info.description = description;
        },
        /*
        |--------------------------------------------------------------------------
        | Params
        |--------------------------------------------------------------------------
        */
        //改变path参数
        changePathParams(state: ApidocState, paths: ApidocProperty<"string">[]): void {
            state.apidoc.item.paths = paths
        },
        //在头部插入查询参数
        unshiftQueryParams(state: ApidocState, queryParams: ApidocProperty<"string">[]): void {
            queryParams.forEach((params) => {
                state.apidoc.item.queryParams.unshift(params);
            })
        },
        /*
        |--------------------------------------------------------------------------
        | requestBody
        |--------------------------------------------------------------------------
        */
        //改变body参数mode类型
        changeBodyMode(state: ApidocState, mode: ApidocBodyMode): void {
            state.apidoc.item.requestBody.mode = mode;
        },
        //改变body参数raw的mime类型
        changeBodyRawType(state: ApidocState, rawType: ApidocBodyRawType): void {
            state.apidoc.item.requestBody.raw.dataType = rawType;
        },
        //改变rawBody数据
        changeRawJson(state: ApidocState, rawJson: string): void {
            state.apidoc.item.requestBody.rawJson = rawJson;
            state.apidoc.item.requestBody.json = [];
        },
        /*
        |--------------------------------------------------------------------------
        | raw参数
        |--------------------------------------------------------------------------
        */
        //改变raw的参数值
        changeBodyRawValue(state: ApidocState, rawValue: string): void {
            state.apidoc.item.requestBody.raw.data = rawValue;
        },
        //改变contentType值
        changeContentType(state: ApidocState, contentType: ApidocContentType): void {
            state.apidoc.item.contentType = contentType;
            const matchedValue = state.defaultHeaders.find((val) => val.key === "Content-type");
            const matchedIndex = state.defaultHeaders.findIndex((val) => val.key === "Content-type");
            if (contentType && matchedValue) { //存在contentType并且默认header值也有
                matchedValue.value = contentType
            } else if (contentType && !matchedValue) { //存在contentType但是默认header没有
                const params = apidocGenerateProperty();
                params.key = "Content-type";
                params.value = contentType;
                params.description = "<根据body类型自动处理>";
                state.defaultHeaders.push(params);
            } else if (!contentType && matchedIndex !== -1) {
                state.defaultHeaders.splice(matchedIndex, 1)
            }
        },
        /*
        |--------------------------------------------------------------------------
        | response参数
        |--------------------------------------------------------------------------
        */
        //改变某个response的title参数
        changeResponseParamsTitleByIndex(state: ApidocState, payload: { index: number, title: string }): void {
            const { index, title } = payload
            state.apidoc.item.responseParams[index].title = title;
        },
        //改变某个response的statusCode值
        changeResponseParamsCodeByIndex(state: ApidocState, payload: { index: number, code: number }): void {
            const { index, code } = payload
            state.apidoc.item.responseParams[index].statusCode = code;
        },
        //改变某个response的dataType值
        changeResponseParamsDataTypeByIndex(state: ApidocState, payload: { index: number, type: ApidocContentType }): void {
            const { index, type } = payload
            state.apidoc.item.responseParams[index].value.dataType = type;
        },
        //改变某个response文本value值
        changeResponseParamsTextValueByIndex(state: ApidocState, payload: { index: number, value: string }): void {
            const { index, value } = payload
            state.apidoc.item.responseParams[index].value.text = value;
        },
        //根据index值改变response
        changeResponseByIndex(state: ApidocState, payload: { index: number, value: ApidocProperty[] }): void {
            const { index, value } = payload
            state.apidoc.item.responseParams[index].value.json = value;
        },
        //根据index值改变response的json数据
        changeResponseStrJsonByIndex(state: ApidocState, payload: { index: number, value: string }): void {
            const { index, value } = payload
            state.apidoc.item.responseParams[index].value.strJson = value;
        },
        //根据index值改变mock值
        changeResponseMockByIndex(state: ApidocState, index: number): void {
            state.apidoc.item.responseParams.forEach(v => {
                v.isMock = false;
            })
            state.apidoc.item.responseParams[index].isMock = true;
        },
        //新增一个response
        addResponseParam(state: ApidocState): void {
            const objectParams = apidocGenerateProperty("object");
            objectParams.children[0] = apidocGenerateProperty();
            state.apidoc.item.responseParams.push({
                _id: uuid(),
                title: "返回参数名称",
                statusCode: 200,
                value: {
                    strJson: "",
                    dataType: "application/json",
                    json: [objectParams],
                    text: "",
                    file: {
                        url: "",
                        raw: "",
                    },
                },
                isMock: false,
            })
        },
        //删除一个response
        deleteResponseByIndex(state: ApidocState, index: number): void {
            state.apidoc.item.responseParams.splice(index, 1);
        },
        /*
        |--------------------------------------------------------------------------
        | 其它
        |--------------------------------------------------------------------------
        |
        */
        //重新赋值apidoc数据
        changeApidoc(state: ApidocState, payload: ApidocDetail): void {
            // queryParams如果没有数据则默认添加一条空数据
            if (payload.item.queryParams.length === 0) {
                payload.item.queryParams.push(apidocGenerateProperty());
            }
            // bodyParams如果没有数据则默认添加一条空数据
            // if (payload.item.requestBody.json.length === 0) {
            //     const bodyRootParams = apidocGenerateProperty("object");
            //     bodyRootParams.children[0] = apidocGenerateProperty();
            //     payload.item.requestBody.json.push(bodyRootParams);
            // }
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
            state.defaultHeaders = getDefaultHeaders(payload.item.contentType);
            //返回参数为json的如果没有数据则默认添加一条空数据
            payload.item.responseParams.forEach((params) => {
                if (params.value.dataType === "application/json" && params.value.json.length === 0) {
                    const objectParams = apidocGenerateProperty("object");
                    objectParams.children[0] = apidocGenerateProperty();
                    params.value.json.push(objectParams);
                }
            })
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
            //替换返回json数据，把以前数组类型数据替换为字符串类型
            payload.item.responseParams.forEach(response => {
                if (response.value.dataType === "application/json" && !response.value.strJson) {
                    response.value.strJson = apidocConvertParamsToJsonStr(response.value.json);
                }
            })
            //如果host为空则默认为mockserver
            // if (!payload.item.url.host && !payload.item.url.path.startsWith("http")) {
            //     payload.item.url.host = `http://${config.renderConfig.mock.ip}:${store.state["apidoc/mock"].mockServerPort}`
            // }
            state.apidoc = payload;
        },
        //改变apidoc原始缓存值
        changeOriginApidoc(state: ApidocState): void {
            state.originApidoc = cloneDeep(state.apidoc);
        },
        //改变apidoc数据加载状态
        changeApidocLoading(state: ApidocState, loading: boolean): void {
            state.loading = loading;
        },
        //保存apidoc时候更新loading
        changeApidocSaveLoading(state: ApidocState, loading: boolean): void {
            state.saveLoading = loading;
        },
        //添加一个请求参数数据
        addProperty(state: ApidocState, payload: { data: ApidocProperty[], params: ApidocProperty }): void {
            payload.data.push(payload.params);
        },
        //删除一个请求参数数据
        deleteProperty(state: ApidocState, payload: { data: ApidocProperty[], index: number }): void {
            payload.data.splice(payload.index, 1);
        },
        //改变请求参数某个属性的值
        changePropertyValue<K extends keyof ApidocProperty>(state: ApidocState, payload: EditApidocPropertyPayload<K>): void {
            const { data, field, value } = payload;
            data[field] = value;
        },
        //改变json类型requestBody
        changeRequestJsonBody(state: ApidocState, payload: ApidocProperty[]): void {
            state.apidoc.item.requestBody.json = payload;
        },
        //保存接口弹窗是否展示
        changeSaveDocDialogVisible(state: ApidocState, visible: boolean): void {
            state.saveDocDialogVisible = visible;
        },
        //改变当前需要保存的节点id
        changeSavedDocId(state: ApidocState, id: string): void {
            state.savedDocId = id;
        },
        /*
        |--------------------------------------------------------------------------
        | 预请求脚本
        |--------------------------------------------------------------------------
        */
        changePreRequest(state: ApidocState, preRequest: string): void {
            state.apidoc.preRequest.raw = preRequest;
        },
        changeAfterRequest(state: ApidocState, afterRequest: string): void {
            state.apidoc.afterRequest.raw = afterRequest;
        },
        /*
        |--------------------------------------------------------------------------
        | mock相关
        |--------------------------------------------------------------------------
        |
        */
        //改变mock地址
        changeMockPath(state: ApidocState, path: string): void {
            console.log(22, path)
            state.apidoc.mockInfo.path = path;
        },
        //改变http状态码
        changeMockHttpStatusCode(state: ApidocState, code: number): void {
            state.apidoc.mockInfo.httpStatusCode = code;
        },
        //改变返回延时
        changeMockResponseDelay(state: ApidocState, delay: number): void {
            state.apidoc.mockInfo.responseDelay = delay;
        },
        //更改返回数据类型
        changeMockResponseType(state: ApidocState, responseType: ApidocDetail["mockInfo"]["responseType"]): void {
            state.apidoc.mockInfo.responseType = responseType;
        },
        //改变json数据
        changeMockJsonValue(state: ApidocState, jsonData: string): void {
            state.apidoc.mockInfo.json = jsonData;
        },
        //改变图片类型
        changeMockImageType(state: ApidocState, type: ApidocDetail["mockInfo"]["image"]["type"]): void {
            state.apidoc.mockInfo.image.type = type;
        },
        //改变图片宽度
        changeMockImageWidth(state: ApidocState, width: number): void {
            state.apidoc.mockInfo.image.width = width;
        },
        //改变图片高度
        changeMockImageHeight(state: ApidocState, height: number): void {
            state.apidoc.mockInfo.image.height = height;
        },
        //改变图片size
        changeMockImageSize(state: ApidocState, size: number): void {
            state.apidoc.mockInfo.image.size = size;
        },
        //改变文字颜色
        changeMockImageColor(state: ApidocState, color: string): void {
            state.apidoc.mockInfo.image.color = color;
        },
        //改变图片背景颜色
        changeMockImageBackgroundColor(state: ApidocState, backgroundColor: string): void {
            state.apidoc.mockInfo.image.backgroundColor = backgroundColor;
        },
        //改变图片背景颜色
        changeMockImageFontSize(state: ApidocState, fontSize: number): void {
            state.apidoc.mockInfo.image.fontSize = fontSize;
        },
        //改变返回文件类型
        changeMockFileType(state: ApidocState, type: ApidocDetail["mockInfo"]["file"]["type"]): void {
            state.apidoc.mockInfo.file.type = type;
        },
        //改变返回text类型数据
        changeMockTextValue(state: ApidocState, text: string): void {
            state.apidoc.mockInfo.text = text;
        },
        //改变自定义返回脚本数据
        changeCustomResponseScript(state: ApidocState, text: string): void {
            state.apidoc.mockInfo.customResponseScript = text;
        },
        //改变自定义文件数据
        changeCustomFile(state: ApidocState, filePath: string): void {
            state.apidoc.mockInfo.file.filePath = filePath;
        },
    },
    actions: {
        /**
         * 获取项目基本信息
         */
        getApidocDetail(context: ActionContext<ApidocState, RootState>, payload: { id: string, projectId: string }): Promise<void> {
            if (cancel.length > 0) {
                cancel.forEach((c) => {
                    c("取消请求");
                })
            }
            return new Promise((resolve, reject) => {
                context.commit("changeApidocLoading", true);
                const params = {
                    projectId: payload.projectId,
                    _id: payload.id,
                }
                axiosInstance.get<Response<ApidocDetail>, Response<ApidocDetail>>("/api/project/doc_detail", {
                    params,
                    cancelToken: new axios.CancelToken((c) => {
                        cancel.push(c);
                    }),
                }).then((res) => {
                    if (res.data === null) { //接口不存在提示用户删除接口
                        confirmInvalidDoc(payload.projectId, payload.id);
                        return;
                    }
                    context.commit("changeApidoc", res.data)
                    context.commit("changeOriginApidoc");
                    const cachedServer = apidocCache.getPreviousServer(payload.projectId);
                    const { path } = context.state.apidoc.item.url
                    if (cachedServer && !path.startsWith("http") && !path.startsWith("https")) {
                        store.commit("apidoc/apidoc/changeApidocHost", cachedServer)
                    }
                    resolve()
                }).catch((err) => {
                    console.error(err);
                    reject(err);
                }).finally(() => {
                    context.commit("changeApidocLoading", false);
                })
            });
        },
        /**
         * 保存接口
         */
        saveApidoc(context: ActionContext<ApidocState, RootState>): Promise<void> {
            return new Promise((resolve, reject) => {
                const projectId = router.currentRoute.value.query.id as string || shareRouter.currentRoute.value.query.id as string;
                const tabs = store.state["apidoc/tabs"].tabs[projectId];
                const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
                if (!currentSelectTab) {
                    console.warn("缺少tab信息");
                    return;
                }
                const apidocDetail = context.state.apidoc;
                context.commit("changeApidocSaveLoading", true);
                context.dispatch("saveMindParams");
                const params = {
                    _id: currentSelectTab._id,
                    projectId,
                    info: apidocDetail.info,
                    item: apidocDetail.item,
                    preRequest: apidocDetail.preRequest,
                    afterRequest: apidocDetail.afterRequest,
                    mockInfo: apidocDetail.mockInfo,
                };
                axiosInstance.post("/api/project/fill_doc", params).then(() => {
                    //改变tab请求方法
                    store.commit("apidoc/tabs/changeTabInfoById", {
                        id: currentSelectTab._id,
                        field: "head",
                        value: {
                            icon: params.item.method,
                            color: "",
                        },
                    });
                    //改变banner请求方法
                    store.commit("apidoc/banner/changeBannerInfoById", {
                        id: currentSelectTab._id,
                        field: "method",
                        value: params.item.method,
                    })
                    //改变origindoc的值
                    store.commit("apidoc/apidoc/changeOriginApidoc");
                    //改变tab未保存小圆点
                    store.commit("apidoc/tabs/changeTabInfoById", {
                        id: currentSelectTab._id,
                        field: "saved",
                        value: true,
                    });
                    //新增一个mock映射
                    store.commit("apidoc/mock/addMockUrl", {
                        id: currentSelectTab._id,
                        projectId,
                        url: apidocDetail.item.url.path,
                        method: apidocDetail.item.method,
                    })
                    resolve();
                }).catch((err) => {
                    //改变tab未保存小圆点
                    store.commit("apidoc/tabs/changeTabInfoById", {
                        id: currentSelectTab._id,
                        field: "saved",
                        value: false,
                    });
                    console.error(err);
                    reject(err);
                }).finally(() => {
                    context.commit("changeApidocSaveLoading", false)
                });
            })
        },
        /**
         * 保存联想参数
         */
        saveMindParams(context: ActionContext<ApidocState, RootState>): void {
            const apidocDetail = context.state.apidoc;
            const projectId = router.currentRoute.value.query.id as string || shareRouter.currentRoute.value.query.id as string;
            const paths = filterValidParams(apidocDetail.item.paths, "paths");
            const queryParams = filterValidParams(apidocDetail.item.queryParams, "queryParams").filter(v => v.description && v.value);
            const requestBody = filterValidParams(apidocDetail.item.requestBody.json, "requestBody").filter(v => v.description && v.value);
            const responseParams = filterValidParams(apidocDetail.item.responseParams[0].value.json, "responseParams").filter(v => v.description && v.value);
            const params = {
                projectId,
                mindParams: paths.concat(queryParams).concat(requestBody).concat(responseParams)
            };
            axiosInstance.post("/api/project/doc_params_mind", params).then((res) => {
                if (res.data != null) {
                    store.commit("apidoc/baseInfo/changeMindParams", res.data);
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        //改变保存apidoc弹窗状态
        openSaveDocDialog(context: ActionContext<ApidocState, RootState>, id: string): Promise<"save" | "cancel"> {
            context.commit("changeSaveDocDialogVisible", true)
            context.commit("changeSavedDocId", id)
            return new Promise((resolve, reject) => {
                try {
                    event.on("tabs/saveTabSuccess", () => {
                        resolve("save");
                    })
                    event.on("tabs/cancelSaveTab", () => {
                        resolve("cancel");
                    })
                } catch (error) {
                    reject(error)
                }
            })
        },
    },
}

export { apidoc }
