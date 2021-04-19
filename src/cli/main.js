import Vue from "vue";
import ElementUI from "element-ui";
import App from "./App.vue";
import "element-ui/lib/theme-chalk/index.css";
import "element-ui/lib/theme-chalk/display.css";
import "@/assets/css/index.css";

Vue.use(ElementUI);

Vue.config.productionTip = true;

console.log(222)
/* eslint-disable no-new */
new Vue({
    render: (h) => h(App),
}).$mount("#app");
