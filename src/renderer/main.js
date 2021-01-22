import Vue from "vue";
import ElementUI from "element-ui";
import MyDB from "@/indexedDB";
import * as helper from "@/lib";
import Logs from "@/logs/index";
import { router } from "./router";
import store from "./store";
import App from "./App.vue";
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/display.css";
import "./components/index";
import "./mixin";
import "./directive";
import "@/assets/css/index.css";
import axios from "./api/api";

const myDB = new MyDB();
myDB.initDB();
Vue.prototype.db = myDB;

const logs = new Logs();

Vue.use(ElementUI);
Vue.use(axios);

Vue.config.productionTip = true;

Vue.prototype.$helper = helper;
//挂载全局错误处理，处理请求报错
Vue.prototype.$httpThrow = logs.httpCatch;
Vue.prototype.$errorThrow = logs.errorCatch;
Vue.prototype.$langRequestWarning = logs.langTimeCatch;
Vue.prototype.$httpFailCatch = logs.httpFailCatch;
Vue.config.errorHandler = logs.errorCatch;
Vue.config.warnHandler = logs.warningCatch;

/* eslint-disable no-new */
new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount("#app");
