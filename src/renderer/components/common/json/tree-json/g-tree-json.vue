/*
    创建者：shuxiaokai
    创建时间：2020-08-26 16:21
    模块名称：
    备注：xxxx
*/
<template>
    <div class="tree-json" :style="{height: height, maxHeight: maxHeight}">
        <div class="operation">
            <div v-copy="JSON.stringify(convertPlainParamsToTreeData(data))" class="item" title="复制为json" @click="handleCopy">复制为json</div>
            <slot name="operation" :data="opData" />
        </div>
        <s-tree-json-inner :data="data" v-bind="$attrs"></s-tree-json-inner>
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: [Object, Array],
            default() {
                return {};
            },
        },
        height: {
            type: String,
            default: null,
        },
        maxHeight: {
            type: String,
            default: null,
        },
    },
    computed: {
        opData() {
            return {
                raw: this.data,
                json: this.convertPlainParamsToTreeData(this.data),
            }
        },
    },
    data() {
        return {

        };
    },
    created() {

    },
    methods: {
        handleCopy() {
        },
        //将扁平数据转换为树形结构数据
        convertPlainParamsToTreeData(plainData, jumpChecked) {
            const result = {};
            // eslint-disable-next-line no-shadow
            const foo = (plainData, result) => {
                for (let i = 0, len = plainData.length; i < len; i += 1) {
                    if (jumpChecked && !plainData[i]._select) { //若请求参数未选中则不发送请求
                        continue;
                    }
                    const key = plainData[i].key?.toString().trim();
                    const { type, value } = plainData[i];
                    const resultIsArray = Array.isArray(result);
                    const isComplex = (type === "object" || type === "array");
                    let arrTypeResultLength = 0; //数组类型值长度，用于数组里面嵌套对象时候对象取值
                    if (!isComplex && (key === "" || value === "")) { //非复杂数据需要填写参数名称才可以显示
                        continue
                    }
                    /*eslint-disable indent*/
                    switch (type) {
                        case "number": //数字类型需要转换为数字，转换前所有值都为字符串
                            resultIsArray ? result.push(Number(value)) : result[key] = Number(value);
                            break;
                        case "boolean": //字符串类型不做处理
                            resultIsArray ? result.push(result[key] = (value === "true")) : (result[key] = (value === "true"));
                            break;
                        case "object":
                            resultIsArray ? (arrTypeResultLength = result.push({})) : (result[key] = {});
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                foo(plainData[i].children, resultIsArray ? (result[arrTypeResultLength - 1]) : result[key]);
                            }
                            break;
                        case "array":
                            result[key] = [];
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                foo(plainData[i].children, result[key]);
                            }
                            break;
                        default: //字符串或其他类型类型不做处理
                            resultIsArray ? result.push(value) : (result[key] = value);
                            break;
                    }
                }
            }
            foo(plainData, result);
            return result;
        },
        //=====================================获取远程数据==================================//
        //=====================================前后端交互====================================//
        //=====================================组件间交互====================================//
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.tree-json {
    background: #282c34;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
    font-size: size(14);
    padding: size(10) size(10);
    position: relative; //递归组件只在外层添加relative，否则offsetleft取值会出现问题
    border-radius: $border-radius-sm;
    overflow-y: auto;
    .operation {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: size(20);
        color: $gray-500;
        font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
        .item {
            cursor: pointer;
            user-select: none;
            margin-right: size(10);
            &.active {
                color: $green;
            }
        }
    }
}
</style>
