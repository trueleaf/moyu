import Vue from "vue";

import computed from "./computed";
import methods from "./methods";
import props from "./props";
import filters from "./filters";
import data from "./data";

export default (function() {
    Vue.mixin({
        data() {
            return data;
        },
        filters,
        props,
        computed,
        methods,
    });
})();
