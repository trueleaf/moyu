import Vue from "vue";

import copy from "./copy";
import contextCopy from "./context-copy";
import successTip from "./success";
import flex1 from "./flex1";

export default (() => {
    Vue.directive("copy", copy);
    Vue.directive("copy2", contextCopy);
    Vue.directive("success", successTip);
    Vue.directive("flex1", flex1);
})();
