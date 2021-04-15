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
            // console.log(properties)
            let globalResult = {};
            if (properties && properties[0] && properties[0].type === "array") {
                globalResult = [];
            }
            const foo = (items, result, parent, level) => {
                for (let i = 0; i < items.length; i += 1) {
                    const item = items[i];
                    if (item._isRaw) {
                        globalResult = item.value;
                        return;
                    }
                    const isParentArray = (parent && parent.type === "array"); //父元素为数组，不校验key因为数组元素不必填写key值
                    const key = items[i].key.trim();
                    const value = this.convertVariable(items[i].value);
                    const { type } = items[i]; // object,array,file
                    const valueTypeIsArray = Array.isArray(result);
                    const isComplex = (type === "object" || type === "array" || type === "file");
                    //============================================================================//
                    let arrTypeResultLength = 0; //数组类型值长度，用于数组里面嵌套对象时候对象取值
                    if (jumpChecked && !items[i]._select) { //过滤掉_select属性为false的值
                        continue;
                    }
                    if (!isParentArray && !isComplex && (key === "")) { //父元素不为数组并且也不是复杂数据类型
                        continue
                    }
                    if (isParentArray && !isComplex && key === "" && value === "") { //父元素为数组子元素为简单类型
                        continue
                    }
                    //=========================================================================//
                    if (type === "number") { //数字类型需要转换为数字，转换前所有值都为字符串
                        valueTypeIsArray ? result.push(Number(value)) : result[key] = Number(value);
                    } else if (type === "boolean") {
                        valueTypeIsArray ? result.push(result[key] = (value === "true")) : (result[key] = (value === "true"));
                    } else if (type === "object") {
                        const { children } = items[i];
                        if (valueTypeIsArray) {
                            arrTypeResultLength = result.push({});
                        } else if (level !== 1) {
                            result[key] = {};
                        }
                        if (children && children.length > 0) {
                            if (valueTypeIsArray) {
                                foo(children, result[arrTypeResultLength - 1], items[i], level + 1);
                            } else if (level === 1) {
                                foo(children, result, items[i], level + 1);
                            } else {
                                foo(children, result[key], items[i], level + 1);
                            }
                        }
                    } else if (type === "array") {
                        const { children } = items[i];
                        result[key] = [];
                        if (children && children.length > 0) {
                            if (level === 1) {
                                foo(children, result, items[i], level + 1);
                            } else {
                                foo(children, result[key], items[i], level + 1);
                            }
                        }
                    } else if (type === "file") {
                        result[key] = items[i]._value;
                        if (result[key]) {
                            const proto = Object.getPrototypeOf(result[key]);
                            proto._name = items[i]._name;
                        }
                    } else { //字符串或其他类型类型不做处理
                        valueTypeIsArray ? result.push(value) : (result[key] = value);
                    }
                }
            }
            foo(properties, globalResult, {}, 1);
            return globalResult;
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
                // eslint-disable-next-line no-param-reassign
                mindParams = [];
            }
            const globalResult = [];
            const rootType = this.getType(jsonData);
            if (rootType === "object" || rootType === "array") {
                const rootProperty = this.generateProperty(rootType);
                globalResult.push(rootProperty);
                const foo = (obj, result, deep) => {
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
                                result.push(property);
                            } else if (valueType === "object") {
                                const property = this.generateProperty(valueType);
                                property.key = i;
                                property.description = description;
                                result.push(property);
                                foo(obj[i], property.children, deep + 1);
                            } else if (valueType === "array") {
                                const property = this.generateProperty(valueType);
                                property.key = i;
                                property.description = description;
                                result.push(property);
                                if (this.getType(obj[i][0]) === "object") {
                                    const property2 = this.generateProperty("object");
                                    property2.description = description;
                                    property.children.push(property2)
                                    foo(obj[i][0], property.children[0].children, deep + 1);
                                } else {
                                    foo(obj[i][0], property.children, deep + 1);
                                }
                            }
                        });
                    } else {
                        const valueType = this.getType(obj);
                        const property = this.generateProperty(valueType);
                        result.push(property)
                    }
                }
                foo(jsonData, rootProperty.children, 1);
            } else {
                const rootProperty = this.generateProperty(rootType);
                globalResult.push(rootProperty);
            }
            return globalResult;
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
