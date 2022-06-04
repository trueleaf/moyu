/**
 * 将数组参数转换为json语法树
 */

import { ApidocProperty, ApidocASTInfo } from "@@/global"
import { apidocConvertValue, uuid as getUuid } from "@/helper/index"

//生成语法树基本数据结构
function generateAstInfo(): ApidocASTInfo {
    return {
        id: "",
        indent: 4, //缩进
        line: 0, //行号
        path: { //键
            value: "", //值
            widthQuote: true, //是否存在双引号
        },
        value: "", //值
        valueType: "", //值类型
        colon: "", //冒号
        comma: "", //逗号
        description: "", //备注信息
        required: true, //是否必填
        leftCurlBrace: { //左花括号
            pairId: "", //与之相匹配的另一个括号id
            value: "", //值
        },
        rightCurlBrace: { //右花括号
            pairId: "", //与之相匹配的另一个括号id
            value: "", //值
        },
        leftBracket: { //左中括号
            pairId: "", //与之相匹配的另一个括号id
            value: "", //值
        },
        rightBracket: { //右中括号
            pairId: "", //与之相匹配的另一个括号id
            value: "", //值
        },
    };
}

export const astJson = (data: ApidocProperty[], indent = 4): ApidocASTInfo[] => {
    if (!Array.isArray(data)) {
        return [];
    }
    const result: ApidocASTInfo[] = [];
    const foo = (arrayData: ApidocProperty[], level: number, deepth: number, parent: null | ApidocProperty) => {
        const parentIsArray = (parent && parent.type === "array");
        for (let i = 0; i < arrayData.length; i += 1) {
            const item = arrayData[i];
            const itemValue = apidocConvertValue(item.value);
            const itemType = item.type;
            const hasItemValue = (itemType === "string" && item.value != null) || item.value; //字符串可以为空""
            const itemPath = item.key;
            const isObject = itemType === "object";
            const isArray = itemType === "array";
            const objectHasValue = (isObject && item.children.length > 0);
            const arrayHasValue = (isArray && item.children.length > 0 && item.children.some((val) => val.key !== "" || val.value !== "" || val.type === "object" || val.type === "array"));
            const isSimpleType = ((itemType === "string") || (itemType === "boolean") || (itemType === "number") || (itemType === "file"));
            const astInfo = generateAstInfo();
            astInfo.id = item._id;
            if (isSimpleType && !itemValue && !itemPath) {
                // eslint-disable-next-line no-continue
                continue;
            }
            astInfo.description = item.description;
            astInfo.required = item.required;
            if (isSimpleType) { //简单类型数据 x: 1
                astInfo.indent = indent * level;
                astInfo.path.value = itemPath;
                astInfo.colon = parentIsArray ? "" : ":";
                // astInfo.value = itemType === "string" ? `"${itemValue}"` : itemValue;
                if (hasItemValue && itemType === "string") {
                    astInfo.value = `"${itemValue}"`;
                } else if (hasItemValue && itemType !== "string") {
                    astInfo.value = itemValue;
                } else {
                    astInfo.value = item.type.replace(/./, ($1) => $1.toUpperCase())
                }
                astInfo.valueType = itemType;
                astInfo.comma = ",";
                result.push(astInfo);
                // wordNum += 1;
            } else if (isObject && !objectHasValue) { //对象类型并且子元素无值 x: {}
                if (level !== 0) {
                    astInfo.path.value = itemPath;
                    astInfo.colon = ":";
                    astInfo.comma = ",";
                }
                const uuid = getUuid();
                astInfo.leftCurlBrace.pairId = uuid;
                astInfo.leftCurlBrace.value = "{";
                astInfo.rightCurlBrace.value = "}";
                astInfo.rightCurlBrace.pairId = uuid;
                astInfo.indent = indent * level;
                result.push(astInfo);
                // wordNum += 1;
            } else if (isObject && objectHasValue) { //对象类型并且子元素有值 x: {
                if (level !== 0) {
                    astInfo.path.value = itemPath;
                    astInfo.colon = itemPath ? ":" : ""; //无key值代表父元素为数组类型
                }
                const uuid = getUuid();
                const rightCurlyBraceInfo = generateAstInfo();
                astInfo.leftCurlBrace.pairId = uuid;
                astInfo.leftCurlBrace.value = "{";
                astInfo.indent = indent * level;
                result.push(astInfo);
                foo(item.children, level + 1, deepth + 1, item);
                rightCurlyBraceInfo.indent = indent * level;
                rightCurlyBraceInfo.rightCurlBrace.value = "}";
                rightCurlyBraceInfo.comma = ",";
                rightCurlyBraceInfo.rightCurlBrace.pairId = uuid;
                result.push(rightCurlyBraceInfo);
                // wordNum += 1;
            } else if (isArray && !arrayHasValue) { //数组类型并且子元素无值  x: [],
                if (level !== 0) {
                    astInfo.path.value = itemPath;
                    astInfo.colon = ":";
                }
                const uuid = getUuid();
                // astInfo.path.value = itemPath;
                astInfo.leftBracket.pairId = uuid;
                // astInfo.colon = ":";
                astInfo.leftBracket.value = "[";
                astInfo.rightBracket.value = "]";
                astInfo.rightBracket.pairId = uuid;
                astInfo.indent = indent * level;
                result.push(astInfo);
                // wordNum += 1;
            } else if (isArray && arrayHasValue) { //数组类型并且子元素有值 x: [
                if (level !== 0) {
                    astInfo.path.value = itemPath;
                    astInfo.colon = ":";
                }
                if (parentIsArray) {
                    astInfo.colon = ""; //父元素为array，则不显示：
                }
                const uuid = getUuid();
                const currentLevel = indent * level;
                const rightBracketInfo = generateAstInfo();
                // astInfo.path.value = itemPath;
                astInfo.leftBracket.value = "[";
                astInfo.leftBracket.pairId = uuid;
                astInfo.indent = currentLevel;
                // astInfo.colon = ":";
                result.push(astInfo);
                foo(item.children, level + 1, deepth + 1, item);
                rightBracketInfo.indent = currentLevel;
                rightBracketInfo.rightBracket.value = "]";
                rightBracketInfo.rightBracket.pairId = uuid;
                rightBracketInfo.comma = ",";
                result.push(rightBracketInfo);
                // wordNum += 1;
            }
            if (parentIsArray) {
                break;
            }
        }
    }
    foo(data, 0, 1, null);
    result.forEach((astItem, index) => {
        astItem.line = index + 1;
    });
    return result;
}
