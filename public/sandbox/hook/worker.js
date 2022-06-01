/**
 * 代码生成钩子函数
 */

const apidocInfo = {};
self.addEventListener("message", (e) => {
    if (e.data && e.data.type === "generate-code") {
        const execResult = eval(`
            ${e.data.value}
            codeHook(apidocInfo)
        `);
        const result = (typeof execResult === "object") ? JSON.stringify(execResult, null, 2) : execResult.toString()
        self.postMessage({
            type: "success",
            value: result
        })
    }
    if (e.data && e.data.type === "init") {
        Object.assign(apidocInfo, e.data.value)
    }
})