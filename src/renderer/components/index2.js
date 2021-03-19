import Vue from "vue";

const requireApidocComponents = () => {
    const requireComponent = require.context(
        "./apidoc",
        true,
        /g-.+\.(vue|js)$/,
    );
    requireComponent.keys().forEach((fileName) => {
        const componentConfig = requireComponent(fileName);
        let componentName = "";
        if (!fileName.match(/\/([^/]*)\.(vue|js)/)) {
            throw new Error("公共组件必须在components下");
        } else {
            componentName = `s-${fileName
                .match(/\/([^/]*)\.(vue|js)/)[1]
                .replace(/g-/, "")}`;
        }
        Vue.component(
            componentName,
            componentConfig.default || componentConfig,
        );
    });
}
const requireCommonComponents = () => {
    const requireComponent = require.context(
        "./common",
        true,
        /g-.+\.(vue|js)$/,
    );
    requireComponent.keys().forEach((fileName) => {
        const componentConfig = requireComponent(fileName);
        let componentName = "";
        if (!fileName.match(/\/([^/]*)\.(vue|js)/)) {
            throw new Error("公共组件必须在components下");
        } else {
            componentName = `s-${fileName
                .match(/\/([^/]*)\.(vue|js)/)[1]
                .replace(/g-/, "")}`;
        }
        Vue.component(
            componentName,
            componentConfig.default || componentConfig,
        );
    });
}

export default (() => {
    requireApidocComponents();
    requireCommonComponents();
})();
