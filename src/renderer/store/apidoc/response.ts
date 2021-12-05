import type { ApidocResponseState, ApidocCookieInfo } from "@@/store"
import setCookieParser from "set-cookie-parser"
import { formatDate } from "@/helper/index"
import { store } from "@/store/index"
import { apidocCache } from "@/cache/apidoc"
import { router } from "@/router/index"

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

const response = {
    namespaced: true,
    state: {
        header: {},
        contentType: "",
        httpVersion: "",
        ip: "",
        statusCode: 0,
        statusMessage: "",
        rt: 0,
        size: 0,
        loading: false,
        isResponse: true,
        cookies: [],
        process: {
            percent: 0,
            total: 0,
            transferred: 0,
        },
        data: {
            file: {
                url: "",
                raw: "",
            },
            type: "",
            text: "",
        },
    },
    mutations: {
        //改变所有数据
        changeAll(state: ApidocResponseState, payload: ApidocResponseState): void {
            payload.isResponse = true; //fix: isResponse默认设置为true
            Object.assign(state, payload);
        },
        //改变加载状态，loading代表数据是否完全加载完
        changeLoading(state: ApidocResponseState, loading: boolean): void {
            state.loading = loading;
            if (loading === false) {
                const projectId = router.currentRoute.value.query.id as string;
                const tabs = store.state["apidoc/tabs"].tabs[projectId];
                const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
                if (currentSelectTab) {
                    apidocCache.setResponse(currentSelectTab._id, state);
                }
            }
        },
        //数据是否返回
        changeIsResponse(state: ApidocResponseState, isResponse: boolean): void {
            state.isResponse = isResponse;
        },
        //改变responseHeader
        changeResponseHeader(state: ApidocResponseState, payload: Record<string, unknown>): void {
            state.header = payload;
        },
        //改变response基本信息,
        changeResponseBaseInfo(state: ApidocResponseState, payload: ResponseBaseInfo): void {
            state.httpVersion = payload.httpVersion;
            state.ip = payload.ip;
            state.statusCode = payload.statusCode;
            state.statusMessage = payload.statusMessage;
            state.contentType = payload.contentType;
            state.data.type = payload.contentType;
        },
        //清空response值
        clearResponseInfo(state: ApidocResponseState): void {
            state.header = {};
            state.contentType = "";
            state.httpVersion = "";
            state.ip = "";
            state.statusCode = 0;
            state.statusMessage = "";
            state.rt = 0;
            state.size = 0;
            state.cookies = [];
            state.process = {
                percent: 0,
                total: 0,
                transferred: 0,
            };
            state.data = {
                file: {
                    url: "",
                    raw: "",
                    mime: "",
                    ext: "",
                    name: "",
                },
                type: "",
                text: "",
            };
        },
        //改变返回值进度
        changeResponseProgress(state: ApidocResponseState, progress: ApidocResponseState["process"]): void {
            state.process = progress;
        },
        //=====================================返回值====================================//
        //字符串类型返回值
        changeResponseTextValue(state: ApidocResponseState, textValue: string): void {
            state.data.text = textValue;
            state.data.file.url = ""; //清空url
        },
        //改变返回file类型数据相关信息
        changeResponseFileInfo(state: ApidocResponseState, fileInfo: FileInfo): void {
            state.data.file.url = fileInfo.url;
            state.data.file.mime = fileInfo.mime;
            state.data.file.ext = fileInfo.ext;
            state.data.file.name = fileInfo.name;
            state.data.text = ""; //清空文字
        },
        //文件类型返回值
        changeResponseFileUrl(state: ApidocResponseState, url: string): void {
            state.data.file.url = url;
            state.data.text = ""; //清空文字
        },
        //改变文件类型
        changeResponseFileExt(state: ApidocResponseState, ext: string): void {
            state.data.file.ext = ext;
        },
        //改变返回data类型
        changeResponseContentType(state: ApidocResponseState, type: string): void {
            state.data.type = type;
        },
        //改变返回时间
        changeResponseTime(state: ApidocResponseState, rt: number): void {
            state.rt = rt;
        },
        //改变返回值大小
        changeResponseSize(state: ApidocResponseState, size: number): void {
            state.size = size;
        },
        //改变cookie值
        changeResponseCookies(state: ApidocResponseState, cookies: string[]): void {
            const urlInfo = store.state["apidoc/apidoc"].apidoc.item.url
            const fullPatth = urlInfo.host + urlInfo.path;
            const dominReg = /([^./]{1,62}\.){1,}[^./]{1,62}/;
            const matchedDomin = fullPatth.match(dominReg);
            state.cookies = [];
            cookies.forEach((cookieStr) => {
                const parsedCookie = setCookieParser.parse(cookieStr)
                const cookieInfo: ApidocCookieInfo = {
                    name: "",
                    value: "",
                    domin: "",
                    path: "",
                    expires: "",
                    httpOnly: false,
                    secure: false,
                    sameSite: "",
                };
                const realDomin = parsedCookie[0].domain || (matchedDomin ? matchedDomin[0] : "")
                cookieInfo.name = parsedCookie[0].name;
                cookieInfo.value = parsedCookie[0].value;
                cookieInfo.domin = realDomin;
                cookieInfo.path = parsedCookie[0].path || "";
                cookieInfo.expires = formatDate(parsedCookie[0].expires);
                cookieInfo.httpOnly = parsedCookie[0].httpOnly || false;
                cookieInfo.secure = parsedCookie[0].secure || false;
                cookieInfo.sameSite = parsedCookie[0].sameSite || "";
                state.cookies.push(cookieInfo);
                const { globalCookies } = store.state["apidoc/baseInfo"];
                if (!globalCookies[realDomin]) {
                    globalCookies[realDomin] = [];
                }
                const matchedCookieIndex = globalCookies[realDomin].findIndex(info => info.name === cookieInfo.name)
                if (matchedCookieIndex === -1) { //不存在则添加一个
                    globalCookies[realDomin].push(JSON.parse(JSON.stringify(cookieInfo)));
                } else { //存在则覆盖
                    globalCookies[realDomin][matchedCookieIndex] = JSON.parse(JSON.stringify(cookieInfo));
                }
            })
            localStorage.setItem("apidoc/globalCookies", JSON.stringify(store.state["apidoc/baseInfo"].globalCookies))
        },
    },
}

export { response }
