import type Koa from "koa"
import cors from "@koa/cors"
import config from "@/../config/config"
import { store } from "@/store/index"
import { event, sleep } from "@/helper/index"
import { axios } from "@/api/api"
import { ApidocDetail } from "@@/global"

let app: Koa | null = null;

export const mockServer = (): void => {
    if (!config.renderConfig.mock.enabled) {
        return;
    }
    if (!window.require) {
        return;
    }
    console.log("初始化mock服务器")
    if (!app) {
        const KoaModel = window.require("koa")
        app = new KoaModel();
        let serverPort = config.renderConfig.mock.port;
        if (app) {
            app.use(cors());
            store.commit("apidoc/mock/changeMockServerState", "connecting")
            store.commit("apidoc/mock/changeMockServerPort", serverPort)
            let appInstance = app.listen(serverPort, () => {
                store.commit("apidoc/mock/changeMockServerState", "connection")
            });
            //错误处理
            appInstance.on("error", (err: { code: string }) => {
                console.error(err)
                if (err.code === "EADDRINUSE") {
                    serverPort += 1;
                    app?.listen(serverPort);
                    store.commit("apidoc/mock/changeMockServerPort", serverPort)
                }
            });
            //服务器端口
            appInstance.on("close", () => {
                store.commit("apidoc/mock/changeMockServerState", "disconnection")
            })
            //关闭服务器
            event.on("apidoc/mock/closeMockServer", () => {
                store.commit("apidoc/mock/changeMockServerState", "closing")
                appInstance.close((err) => {
                    if (err) {
                        store.commit("apidoc/mock/changeMockServerState", "error")
                        console.error(err)
                    } else {
                        store.commit("apidoc/mock/changeMockServerState", "disconnection")
                    }
                })
            })
            //打开服务器
            event.on("apidoc/mock/openMockServer", () => {
                if (app) {
                    store.commit("apidoc/mock/changeMockServerState", "connecting");
                    appInstance = app.listen(serverPort, () => {
                        store.commit("apidoc/mock/changeMockServerState", "connection")
                    });
                }
            })
            //重启服务器
            event.on("apidoc/mock/restartMockServer", () => {
                appInstance.close((err) => {
                    if (err) {
                        store.commit("apidoc/mock/changeMockServerState", "error")
                        console.error(err)
                    } else {
                        store.commit("apidoc/mock/changeMockServerState", "disconnection")
                        const port = store.state["apidoc/mock"].mockServerPort
                        if (app) {
                            store.commit("apidoc/mock/changeMockServerState", "connecting");
                            appInstance = app.listen(port, () => {
                                store.commit("apidoc/mock/changeMockServerState", "connection")
                            });
                        }
                    }
                })
            })
        }
    }
    if (!app) {
        return;
    }
    app.use(async (ctx) => {
        const url = ctx.request.url.replace(/(?<=)\?.*/, "");
        const method = ctx.request.method.toLowerCase();
        const { mockInfo } = store.state["apidoc/apidoc"].apidoc;
        const realMockInfo = {} as ApidocDetail["mockInfo"]; //最终的mock数据
        const matchedReuqest = store.state["apidoc/mock"].urlMap.find((data) => (data.url === url && data.method.toLocaleLowerCase() === method.toLocaleLowerCase()));
        if (matchedReuqest) {
            const params = {
                projectId: matchedReuqest.projectId,
                _id: matchedReuqest.id,
            };
            try {
                const localApis = JSON.parse(localStorage.getItem("apidoc/apidoc") || "{}");
                const localApi = localApis[matchedReuqest.id]
                let remoteMockInfo = null;
                if (localApi) {
                    remoteMockInfo = localApi.mockInfo
                } else {
                    const res = await axios.get("/api/project/doc_detail", { params });
                    remoteMockInfo = res.data.mockInfo
                }
                Object.assign(realMockInfo, remoteMockInfo, mockInfo)

                // const convertBody = apidocConvertParamsToJsonData(rawBody, false, (property) => {
                //     if (property.value.startsWith("@/") && property.value.endsWith("/")) { //正则表达式
                //         const replacedValue = property.value.replace(/(^@\/|\/$)/g, "");
                //         return Mock.mock(new RegExp(replacedValue));
                //     }
                //     if (property.value.startsWith("@")) { //普通mock
                //         const mockValue = Mock.mock(property.value)
                //         if (property.type === "string") {
                //             return mockValue.toString();
                //         }
                //         return mockValue;
                //     }
                //     return property.value;
                // })
                await sleep(realMockInfo.responseDelay)
                ctx.set("connection", "close"); //防止keep-alive无法立即结束http链接
                ctx.status = realMockInfo.httpStatusCode;
                ctx.body = "";
            } catch (error) {
                console.error(error)
                ctx.body = "";
            }
        } else {
            ctx.body = {
                code: -1,
                Info: {
                    msg: "未匹配到相关的Mock接口",
                    url,
                    method,
                    urlList: store.state["apidoc/mock"].urlMap,
                },
            };
        }
    });
}
