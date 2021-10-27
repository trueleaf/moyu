import { App } from "vue"

export function registeGlobalComponent(app: App): void {
    const requireComponent = require.context(
        // 其组件目录的相对路径
        "./",
        // 是否查询其子目录
        true,
        // 匹配基础组件文件名的正则表达式
        /g-.+\.(vue|js)$/,
    );
    requireComponent.keys().forEach((fileName: string) => {
        // 获取组件配置
        const componentConfig = requireComponent(fileName);
        let componentName = "";
        const gName = fileName.match(/\/([^/]*)\.(vue|js)/)
        if (!gName) {
            throw new Error("公共组件必须在components下");
        } else {
            componentName = `s-${gName[1].replace(/g-/, "")}`;
        }
        app.component(componentName, componentConfig.default || componentConfig)
    });
}
