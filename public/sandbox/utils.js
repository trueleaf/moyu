// 转换queryString
function convertQueryParamsToQueryString(queryParams) {
    let queryString = "";
    queryParams.forEach((v) => {
        if (v.key && v.select) {
            queryString += `${v.key}=${convertPlaceholder(v.value)}&`
        }
    })
    queryString = queryString.replace(/&$/, "");
    if (queryString) {
        queryString = `?${queryString}`;
    }
    return queryString;
}
//转换path路径参数
function getPathParamsMap(pathParams) {
    const pathMap = {};
    pathParams.forEach((v) => {
        if (v.key) {
            pathMap[v.key] = convertPlaceholder(v.value);
        }
    })
    return pathMap;
}
//将{{ 参数 }}转换为真实值
function convertPlaceholder(value) {
    const matchdVariable = value.toString().match(/\{\{\s*([^} ]+)\s*\}\}/);
    const allVariables = Object.assign({}, JSON.parse(JSON.stringify(collectionVariables)), JSON.parse(JSON.stringify(tempVariables)));
    let convertValue = value;
    if (matchdVariable) {
        const realValue = allVariables[matchdVariable[1]];
        if (realValue != null) {
            convertValue = realValue
        }
    }
    return convertValue;
}