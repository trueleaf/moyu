import config from "@/../config/index"
import apidocMixin from "@/pages/modules/apidoc/mixin"
import store from "../store/index"
import http from "../api/api"
import Mock from "./mock"

const { axios } = http;

const MockServer = (() => {
    let singleton = null; //单例
    class Server {
        constructor() {
            if (!singleton) {
                singleton = this;
            }
            this.server = null;
            this.koaInstance = null;
            return singleton;
        }

        init(projectId) {
            if (window.require && config.renderConfig.mock.enabled) {
                if (!this.koaInstance) {
                    const Koa = window.require("koa");
                    const cors = window.require("@koa/cors");
                    this.koaInstance = new Koa();
                    this.koaInstance.use(cors());
                }
                this.koaInstance.use(async (ctx) => {
                    const url = ctx.request.url.replace(/(?<=)\?.*/, "");
                    const method = ctx.request.method.toLowerCase();
                    store.commit("apidoc/changeDocPathEnum");
                    const matchedReuqest = store.state.apidoc.uniquePathEnum.find((data) => (data.url === url && data.method === method));
                    if (matchedReuqest) {
                        const params = {
                            projectId,
                            _id: matchedReuqest._id,
                        };
                        const result = await axios.get("/api/project/doc_detail", { params });
                        const rawBody = result.data.item.responseParams[0]?.values;
                        const convertBody = apidocMixin.methods.convertPlainParamsToTreeData(rawBody, null, (value) => {
                            if (value.startsWith("@")) {
                                if (value.startsWith("@/") && value.endsWith("/")) {
                                    const replacedValue = value.replace(/(^@\/|\/$)/g, "")
                                    return Mock.mock(new RegExp(replacedValue));
                                }
                                return Mock.mock(value);
                            }
                            return value;
                        })
                        ctx.body = convertBody;
                    } else {
                        ctx.body = {
                            code: -1,
                            msg: "未匹配到相关的Mock接口",
                        };
                    }
                });
            }
        }

        start(port) {
            if (!this.server) {
                this.server = this.koaInstance?.listen(port || config.renderConfig.mock.port);
            }
        }

        close() {
            this.server?.close();
        }
    }
    return Server;
})();

export default MockServer;
