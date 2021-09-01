
import type { ApidocProperty } from "@@/global"
import FormData from "form-data"
/**
 * 将queryParams转换成字符串查询字符串
 */
export function convertQueryParamsToQueryString(queryParams: ApidocProperty<"string">[]): string {
    let queryString = "";
    queryParams.forEach((v) => {
        if (v.key && v.select) {
            queryString += `${v.key}=${v.value}&`
        }
    })
    queryString = queryString.replace(/\&$/, "");
    if (queryString) {
        queryString = "?" + queryString;
    }
    return queryString;
}
/**
 * 将urlencoded参数转换为字符串
 */
export function convertUrlencodedToBodyString(urlencoded: ApidocProperty<"string">[]): string {
    let result = "";
    urlencoded.forEach((v) => {
        if (v.key && v.select) {
            result += `${v.key}=${v.value}&`
        }
    })
    result = result.replace(/\&$/, "");
    return result;
}

/**
 * 将pathParams转换为字符串
 */
export function getPathParamsMap(pathParams: ApidocProperty<"string">[]): Record<string, string> {
    const pathMap: Record<string, string> = {};
    pathParams.forEach((v) => {
        if (v.key) {
            pathMap[v.key] = v.value;
        }
    })
    return pathMap;
}
/**
 * 将formData转换为formData字符串
 */
export function convertFormDataToFormDataString(bodyFormData: ApidocProperty<"string">[]): FormData {
    const formData = new FormData();
    bodyFormData.forEach((data) => {
        if (data.select && data.key) {
            formData.append(data.key, data.value);
        }
    })
    return formData
}
