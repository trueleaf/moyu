/**
 * query参数
 */
 const _queryParams = {}; //为了初始化的时候不执行赋值操作
 const queryParams = new Proxy(_queryParams, {
     get(target, key) {
         if (typeof target[key] === "object") {
             console.warn(`query参数不支持嵌套`)
         } else {
             return target[key];
         }
     },
     set(obj, prop, value) {
         let realValue = value;
         if (typeof value === "number") {
             console.warn(`query参数在给 【${prop}】 字段赋值时，值不为string类型，将通过toString进行转换`)
             realValue = value.toString();
         } else if (typeof value !== "string") {
             console.warn(`query参数在给 【${prop}】 字段赋值时出错，query参数类型只能为字符串`)
         }
         obj[prop] = realValue;
         self.postMessage({
             type: "pre-request-change-query-params",
             value: JSON.parse(JSON.stringify(queryParams))
         })
         return true;
     },
     deleteProperty(target, prop) {
         delete target[prop];
         self.postMessage({
             type: "pre-request-change-query-params",
             value: JSON.parse(JSON.stringify(queryParams))
         })
     },
 })