import Vue from "vue";
import computed from "./computed";
import methods from "./methods";
import props from "./props";
import filters from "./filters";
import data from "./data";

export default (() => {
    Vue.mixin({
        filters,
        props,
        data() {
            return data;
        },
        computed,
        methods,
    });
})();
