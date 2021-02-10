import Vue from "vue";
import Vuex from "vuex";
import userInfo from "./userInfo/userInfo";
import components from "./components/components";
import permission from "./permission/permission";
import apidoc from "./apidoc/apidoc";
import apidocRules from "./apidoc/apidoc-rules";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {},
    mutations: {},
    modules: {
        userInfo,
        components,
        permission,
        apidoc,
        apidocRules,
    },
    strict: false,
});

export default store;
