import Vue from "vue";
import Vuex from "vuex";
import apidoc from "./apidoc/apidoc";
import apidocRules from "./apidoc/apidoc-rules";

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {},
    mutations: {},
    modules: {
        apidoc,
        apidocRules,
    },
    strict: false,
});

export default store;
