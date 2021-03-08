import Vue from "vue";
import Router from "vue-router";
import { Button, Loading, Tooltip, Input, Tree, Dialog, Tabs, Popover, Radio, RadioGroup, Divider, TabPane, Message, MessageBox } from "element-ui";
import EventEmitter from "@/lib/event";
import store from "./store/index";
import App from "./App.vue";
import view from "./pages/view/view.vue";
import check from "./pages/check/check.vue";
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/display.css";
import "./components/index";
import "@/mixin";
import "@/directive";
import "@/assets/css/index.css";
import axios from "./api/api";

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
Vue.use(axios);

Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$message = Message;

const router = new Router({
    mode: "hash",
    routes: [
        {
            path: "/",
            name: "验证和数据获取界面",
            component: check,
        },
        {
            path: "/view",
            name: "在线数据展示",
            component: view,
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
