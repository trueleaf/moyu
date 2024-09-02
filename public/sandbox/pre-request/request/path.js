/**
 * 路径参数
 */
 const _pathParams = {}; //为了初始化的时候不执行赋值操作
 const pathParams = new Proxy(_pathParams, {
     get(target, key) {
         if (typeof target[key] === "object") {
             console.warn(`path参数不支持嵌套`)
         } else {
             return target[key];
         }
     },
     set(obj, prop, value) {
         let realValue = value;
         if (typeof value === "number") {
             console.warn(`path参数在给 【${prop}】 字段赋值时，值不为string类型，将通过toString进行转换`)
             realValue = value.toString();
         } else if (typeof value !== "string") {
             console.warn(`path参数在给 【${prop}】 字段赋值时出错，path参数类型只能为字符串`)
         }
         obj[prop] = realValue;
         self.postMessage({
             type: "pre-request-change-path-params",
             value: JSON.parse(JSON.stringify(pathParams))
         })
         return true;
     },
     deleteProperty(target, prop) {
         delete target[prop];
         self.postMessage({
             type: "pre-request-change-path-params",
             value: JSON.parse(JSON.stringify(pathParams))
         })
     },
 })