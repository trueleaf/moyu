import type { ApidocProperty } from "@@/global"
import FormData from "form-data"
import fs from "fs"
import { apidocConvertValue } from "@/helper/index"
/**
 * 将queryParams转换成字符串查询字符串
 */
export function convertQueryParamsToQueryString(queryParams: ApidocProperty<"string">[]): string {
    let queryString = "";
    queryParams.forEach((v) => {
        if (v.key && v.select) {
            queryString += `${v.key}=${apidocConvertValue(v.value)}&`
        }
    })
    queryString = queryString.replace(/&$/, "");
    if (queryString) {
        queryString = `?${queryString}`;
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
            result += `${v.key}=${apidocConvertValue(v.value)}&`
        }
    })
    result = result.replace(/&$/, "");
    return result;
}

/**
 * 将pathParams转换为字符串
 */
export function getPathParamsMap(pathParams: ApidocProperty<"string">[]): Record<string, string> {
    const pathMap: Record<string, string> = {};
    pathParams.forEach((v) => {
        if (v.key) {
            pathMap[v.key] = apidocConvertValue(v.value);
        }
    })
    return pathMap;
}
/**
 * 将formData转换为formData字符串
 */
export function convertFormDataToFormDataString(bodyFormData: ApidocProperty<"string" | "file">[]): { data: FormData, headers: FormData.Headers } {
    const formData = new FormData();
    for (let i = 0; i < bodyFormData.length; i += 1) {
        const item = bodyFormData[i];
        if (!item.select || !item.key) {
            // eslint-disable-next-line no-continue
            continue;
        }
        if (item.type === "string") { //字符串类型
            formData.append(item.key, apidocConvertValue(item.value));
        } else if (item.type === "file") { //文件处理
            try {
                fs.accessSync(item.value);
                formData.append(item.key, fs.createReadStream(item.value));
            } catch (error) {
                console.log("文件不存在");
            }
        }
    }
    return {
        data: formData,
        headers: formData.getHeaders(),
    }
}
