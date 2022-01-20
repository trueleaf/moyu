import type Koa from "koa"
import cors from "@koa/cors"
import config from "@/../config/config"
import { store } from "@/store/index"
import { apidocConvertParamsToJsonData } from "@/helper/index"
import { axios } from "@/api/api"
import Mock from "@/server/mock/mock"

export const mockServer = (): void => {
    let app: Koa | null = null;
    if (config.renderConfig.mock.enabled) {
        if (!app && window.require) {
            let serverPort = config.renderConfig.mock.port;
            const Server = window.require("koa")
            app = new Server();
            if (app) {
                app.use(cors());
                const appInstance = app.listen(serverPort)
                store.commit("apidoc/mock/changeMockServerPort", serverPort)
                appInstance.on("error", (err: { code: string }) => {
                    if (err.code === "EADDRINUSE") {
                        serverPort += 1;
                        app?.listen(serverPort);
                        store.commit("apidoc/mock/changeMockServerPort", serverPort)
                    }
                });
            }
        }
        if (!app) {
            return;
        }
        app.use(async (ctx) => {
            const url = ctx.request.url.replace(/(?<=)\?.*/, "");
            const method = ctx.request.method.toLowerCase();
            const matchedReuqest = store.state["apidoc/mock"].urlMap.find((data) => (data.url === url && data.method.toLocaleLowerCase() === method.toLocaleLowerCase()));
            if (matchedReuqest) {
                const params = {
                    projectId: matchedReuqest.projectId,
                    _id: matchedReuqest.id,
                };
                try {
                    const localApis = JSON.parse(localStorage.getItem("apidoc/apidoc") || "{}");
                    const localApi = localApis[matchedReuqest.id]
                    let result = null;
                    if (localApi) {
                        result = { data: localApi }
                    } else {
                        result = await axios.get("/api/project/doc_detail", { params });
                    }
                    const rawBody = result.data.item.responseParams[0]?.value.json;
                    // console.log(rawBody)
                    const convertBody = apidocConvertParamsToJsonData(rawBody, false, (property) => {
                        // console.log(property)
                        // const isArray = property.type === "array";
                        // const loop = isArray ? property.value : 0;
                        if (property.value.startsWith("@/") && property.value.endsWith("/")) { //正则表达式
                            const replacedValue = property.value.replace(/(^@\/|\/$)/g, "");
                            return Mock.mock(new RegExp(replacedValue));
                        }
                        if (property.value.startsWith("@")) { //普通mock
                            const mockValue = Mock.mock(property.value)
                            if (property.type === "string") {
                                return mockValue.toString();
                            }
                            return mockValue;
                        }
                        return property.value;
                    })
                    ctx.body = convertBody || "";
                } catch (error) {
                    console.error(error)
                    ctx.body = "";
                }
            } else {
                ctx.body = {
                    code: -1,
                    msg: "未匹配到相关的Mock接口",
                };
            }
        });
    }
}
