/**
 * @description        接口文档全局混入，所有公共方法必须引入mixin进行使用
 * @author             shuxiaokai
 * @create             2021-01-16 17:30
 */
import { uuid } from "@/lib"

export default {
    computed: {
        variables() { //全局变量
            return this.$store.state.apidoc.variables || [];
        },
    },
    methods: {
        /**
         * @description        生成参数
         * @author             shuxiaokai
         * @create             2021-01-16 17:33
         * @param {string=}    [type = 'string'] - 参数类型
         * @return {property}}    返回参数
         * @remark
           interface Property {
               key:string, //参数key
               type:PropertyTypeEnum, //参数类型
               description:string, //参数描述
               value:string, //参数值
               required:boolean, //是否必填
               children:Array<Property>, //子参数
               _select:boolean, //是否被选中
           }
           enum PropertyTypeEnum { string, number, boolean, array, object, file }
         */
        generateProperty(type = "string") {
            return {
                _id: uuid(),
                key: "",
                type,
                description: "",
                value: "",
                required: true,
                children: [],
                _select: true,
            }
        },
        /**
         * @description              将扁平数据转换为树形结构数据
         * @author                   shuxiaokai
         * @create                   2021-01-21 19:21
         * @param {Array<Property>}  properties - 参数数组
         * @param {boolean}          jumpChecked - 是否跳过
         * @return {JSON}            返回JSON字符串
         */
        convertPlainParamsToTreeData(properties, jumpChecked) {
            const result = {};
            const parent = {};
            /* eslint-disable no-shadow */
            /* eslint-disable no-param-reassign */
            const foo = (properties, result, parent) => {
                for (let i = 0; i < properties.length; i += 1) {
                    // const isSimpleType = ((properties[i].type === "string") || (properties[i].type === "boolean") || (properties[i].type === "number"));
                    const isParentArray = (parent && parent.type === "array"); //父元素为数组，不校验key因为数组元素不必填写key值
                    const key = properties[i].key.trim();
                    const value = this.convertVariable(properties[i].value);
                    const { type } = properties[i]; // object,array,file
                    const valueTypeIsArray = Array.isArray(result);
                    const isComplex = (type === "object" || type === "array" || type === "file");
                    let arrTypeResultLength = 0; //数组类型值长度，用于数组里面嵌套对象时候对象取值
                    if (jumpChecked && !properties[i]._select) { //过滤掉_select属性为false的值
                        continue;
                    }
                    if (!isParentArray && !isComplex && (key === "")) { //父元素不为数组并且也不是复杂数据类型
                        continue
                    }
                    if (isParentArray && !isComplex && key === "" && value === "") { //父元素为数组子元素为简单类型
                        continue
                    }
                    switch (type) {
                    case "number": //数字类型需要转换为数字，转换前所有值都为字符串
                        valueTypeIsArray ? result.push(Number(value)) : result[key] = Number(value);
                        break;
                    case "boolean": //布尔值处理
                        valueTypeIsArray ? result.push(result[key] = (value === "true")) : (result[key] = (value === "true"));
                        break;
                    case "object":
                        valueTypeIsArray ? (arrTypeResultLength = result.push({})) : (result[key] = {});
                        if (properties[i].children && properties[i].children.length > 0) {
                            parent = properties[i];
                            foo(properties[i].children, valueTypeIsArray ? (result[arrTypeResultLength - 1]) : result[key], parent);
                        }
                        break;
                    case "array":
                        result[key] = [];
                        if (properties[i].children && properties[i].children.length > 0) {
                            parent = properties[i];
                            foo(properties[i].children, result[key], parent);
                        }
                        break;
                    case "file":
                        result[key] = properties[i]._value;
                        break;
                    default: //字符串或其他类型类型不做处理
                        valueTypeIsArray ? result.push(value) : (result[key] = value);
                        break;
                    }
                }
            }
            foo(properties, result, parent);
            return result;
        },

        /**
         * @description        将json类型数据转换为扁平数据
         * @author             shuxiaokai
         * @create             2021-01-26 13:35
         * @param {json}       jsonData - 任意类型变量
         * @param {any}        mindParams - 联想参数
         * @return {String}    返回字符串
         */
        convertTreeDataToPlainParams(jsonData, mindParams) {
            if (!Array.isArray(mindParams)) {
                mindParams = [];
            }
            const result = [];
            const foo = (obj, result) => {
                if (this.getType(obj) === "object") {
                    Object.keys(obj).forEach((i) => {
                        const valueType = this.getType(obj[i]);
                        const matchedVal = mindParams?.find((val) => val.key === i);
                        const description = matchedVal ? matchedVal.description : ""
                        if (valueType === "string" || valueType === "number" || valueType === "boolean") {
                            const property = this.generateProperty(valueType);
                            property.key = i;
                            property.value = obj[i] == null ? "null" : obj[i].toString();
                            property.description = description;
                            result.push(property)
                        } else if (valueType === "object") {
                            const property = this.generateProperty(valueType);
                            property.key = i;
                            property.description = description;
                            result.push(property)
                            foo(obj[i], property.children);
                        } else if (valueType === "array") {
                            const property = this.generateProperty(valueType);
                            property.key = i;
                            property.description = description;
                            result.push(property);
                            if (this.getType(obj[i][0]) === "object") {
                                const property2 = this.generateProperty("object");
                                property2.description = description;
                                property.children.push(property2)
                                foo(obj[i][0], property.children[0].children);
                            } else {
                                foo(obj[i][0], property.children);
                            }
                        }
                    });
                } else {
                    const valueType = this.getType(obj);
                    const property = this.generateProperty(valueType);
                    result.push(property)
                }
            }
            foo(jsonData, result);
            return result;
        },

        /**
         * @description        获取property字段类型
         * @author             shuxiaokai
         * @create             2021-01-26 13:38
         * @param {any}        value - 任意类型变量
         * @return {string}    返回参数类型
         */
        getType(value) {
            let result = "string";
            if (typeof value === "string") {
                result = "string"
            } else if (typeof value === "number") { //NaN
                result = "number"
            } else if (typeof value === "boolean") {
                result = "boolean"
            } else if (Array.isArray(value)) {
                result = "array"
            } else if (typeof value === "object" && value !== null) {
                result = "object"
            } else { // null undefined ...
                result = "string"
            }
            return result;
        },
        //将变量转换为实际数据
        convertVariable(val) {
            if (val == null) {
                return null;
            }
            const matchedData = val.toString().match(/{{\s*(\w+)\s*}}/);
            if (val && matchedData) {
                const varInfo = this.variables.find((v) => v.name === matchedData[1]);
                if (varInfo) {
                    return val.replace(/{{\s*(\w+)\s*}}/, varInfo.value);
                }
                return val;
            }
            return val;
        },
        //获取cookie
        getCookies(rawCookies) {
            const result = [];
            if (!rawCookies || rawCookies.length === 0) {
                return [];
            }
            rawCookies.forEach((val) => {
                const name = val.match(/[^=]+/);
                const value = val.match(/(?<==)[^;]*/);
                result.push({
                    name: name[0],
                    value: value[0],
                })
            })
            return result;
        },
    },
}
