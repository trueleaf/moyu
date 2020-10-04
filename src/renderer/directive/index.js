import Vue from "vue"

import copy from "./copy"
import contextCopy from "./context-copy"
import focus from "./focus"
import successTip from "./success"



export default (() => {
    Vue.directive("focus", focus);
    Vue.directive("copy", copy);
    Vue.directive("copy2", contextCopy);
    Vue.directive("success", successTip);
})();


