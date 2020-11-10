import Vue from "vue";
import ElementUI from "element-ui";
import router from "./router";
import store from "./store";
import App from "./App.vue";
import MyDB from "@/indexedDB"
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/display.css";
import "./components/index";
import "./mixin"
import "./directive"
import "@/assets/css/index.css"
import axios from "./api/api"

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));



const myDB = new MyDB();
myDB.initDB();
Vue.prototype.db = myDB;

import Logs from "@/logs/index.js"
const logs = new Logs()

Vue.use(ElementUI);
Vue.use(axios)


Vue.config.productionTip = true;


//挂载全局错误处理，处理请求报错
Vue.prototype.$httpThrow = logs.httpCatch;
Vue.prototype.$errorThrow = logs.errorCatch;
Vue.prototype.$langRequestWarning = logs.langTimeCatch;
Vue.prototype.$httpFailCatch = logs.httpFailCatch;
Vue.config.errorHandler = logs.errorCatch;
Vue.config.warnHandler = logs.warningCatch;

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    template: "<App/>",
}).$mount("#app");




