import Vue from "vue";
import Router from "vue-router";
import { Button, Loading, Tooltip, Input, Tree, Dialog, Tabs, Popover, Radio, RadioGroup, Divider, TabPane } from "element-ui";
import EventEmitter from "@/lib/event";
import store from "./store/index";
import App from "./App.vue";
import docShare from "./offline-share/doc-share.vue";
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/display.css";
import "./components/index";
import "@/mixin";
import "@/directive";
import "@/assets/css/index.css";

Vue.use(Button);
Vue.use(Loading);
Vue.use(Tooltip);
Vue.use(Input);
Vue.use(Tree);
Vue.use(Router);
Vue.use(Dialog);
Vue.use(Tabs);
Vue.use(Popover);
Vue.use(Radio);
Vue.use(RadioGroup);
Vue.use(Divider);
Vue.use(TabPane);

if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line global-require
    const data = require("./assets/data.js");
    window.SHARE_DATA = data;
    window.PROJECT_ID = "5f806b7edd6d9b06e05d7a1e";
}

const router = new Router({
    routes: [
        {
            path: "/",
            name: "文档分享",
            component: docShare,
        },
    ],
});
const emitter = new EventEmitter();
Vue.prototype.$event = emitter;

Vue.config.productionTip = true;
/* eslint-disable no-new */
new Vue({
    data: {
        // eslint-disable-next-line vue/no-reserved-keys
        _shareConfig: {
            id: window.PROJECT_ID,
        },
    },
    router,
    store,
    render: (h) => h(App),
}).$mount("#app");
