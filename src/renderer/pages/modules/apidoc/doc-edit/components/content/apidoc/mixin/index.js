/**
 * @description        接口文档全局混入，所有公共方法必须引入mixin进行使用
 * @author             shuxiaokai
 * @create             2021-01-16 17:30
 */
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
                _id: this.$helper.uuid(),
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
                    if (jumpChecked && !properties[i]._select) { //若请求参数未选中则不发送请求
                        continue;
                    }
                    const key = properties[i].key.trim();
                    const value = this.convertVariable(properties[i].value);
                    const { type } = properties[i]; // object,array,file
                    const valueTypeIsArray = Array.isArray(result);
                    const isParentArray = (parent && parent.type === "array"); //父元素为数组，不校验key因为数组元素不必填写key值
                    const isComplex = (type === "object" || type === "array" || type === "file");
                    let arrTypeResultLength = 0; //数组类型值长度，用于数组里面嵌套对象时候对象取值
                    if (!isParentArray && !isComplex && (key === "" || value === "")) { //非复杂数据需要填写参数名称才被视作合法
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
                        result[key] = value;
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
        //将变量转换为实际数据
        convertVariable(val) {
            if (val == null) {
                return null;
            }
            if (Object.prototype.toString.call(val).slice(8, -1) === "ArrayBuffer") { //ArrayBuffer文件类型
                return val;
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
    },
}
