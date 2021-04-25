import config from "@/../config/index"

export default class Server {
    constructor() {
        this.server = null;
        this.koaInstance = null;
    }

    init() {
        if (window.require && config.renderConfig.mock.enabled) {
            const Koa = window.require("koa");
            this.koaInstance = new Koa();
            this.koaInstance.use(async (ctx) => {
                ctx.body = ctx.request.url.replace(/(?<=)\?.*/, "");
            });
        }
    }

    start(port) {
        this.server = this.koaInstance?.listen(port || config.renderConfig.mock.port);
    }

    close() {
        this.server?.close();
        this.server = null;
        this.koaInstance = null;
    }
}
