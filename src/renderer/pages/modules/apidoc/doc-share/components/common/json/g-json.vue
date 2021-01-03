/*
    创建者：shuxiaokai
    创建时间：2020-07-30 17:31
    模块名称：
    备注：xxxx
*/
<template>
    <div class="json-wrap">
        <!-- <pre>{{ checkData }}</pre> -->
        <div class="operation">
            <div class="item" title="默认情况数组数据只展示一个，展示全部将显示完整数据" :class="{active: activeFullArray}" @click="activeFullArray = !activeFullArray">完整数据</div>
            <div class="item" title="将当前返回值应用为响应参数" @click="handleExport">应用为响应值</div>
            <div class="item" v-copy="JSON.stringify(data)">复制为json</div>
        </div>
        <s-json-inner :data="data" :check-data="checkData" :fullArray="activeFullArray"></s-json-inner>
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: [Object, Array],
            default() {
                return {};
            }
        },
        checkData: {
            type: [Object, Array, String, Number, Boolean],
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            activeFullArray: false
        };
    },
    computed: {
        mindResponseParams() {
            return this.$store.state.apidoc.mindParams.mindResponseParams;
        },
    },
    created() {

    },
    methods: {
        //导出数据
        handleExport() {
            const copyData = JSON.parse(JSON.stringify(this.data));
            console.log(copyData)
            const hasOwn = Object.hasOwnProperty;
            const result = [];
            const foo = (obj, result) => {
                if (this.getType(obj) === "object") {
                    for(let i in obj) {
                        if (!hasOwn.call(obj, i)) continue;
                        const valueType = this.getType(obj[i]);
                        const matchedVal = this.mindResponseParams.find(val => val.key === i);
                        const description = matchedVal ? matchedVal.description : ""
                        if (valueType === "string" || valueType === "number" || valueType === "boolean") {
                            result.push({
                                key: i,
                                type: valueType,
                                value: obj[i] == null ? "null" : obj[i].toString(),
                                description
                            })
                        } else if (valueType === "object") {
                            const current = {
                                key: i,
                                type: valueType,
                                value: "",
                                children: []
                            }
                            result.push(current)
                            foo(obj[i], current.children);
                        } else if (valueType === "array") {
                            const current = {
                                key: i,
                                type: valueType,
                                value: "",
                                children: [],
                                description
                            }
                            result.push(current);
                            if (this.getType(obj[i][0]) === "object") {
                                current.children.push({
                                    key: "",
                                    type: "object",
                                    value: "",
                                    children: [],
                                    description
                                })
                                foo(obj[i][0], current.children[0].children);
                            } else {
                                foo(obj[i][0], current.children);
                            }
                        }
                    }
                } else {
                    const valueType = this.getType(obj);
                    result.push({
                        key: "",
                        type: valueType,
                        value: obj,
                    })
                }
            }
            foo(copyData, result);
            console.log(result)
            this.$emit("export", result);
        },
        //生成请求数据
        generateParams() {
            return {
                id: this.$helper.uuid(),
                key: "",
                description: "",
                type: 1,
                value: "",
                required: true,
            }
        },
        //获取参数类型
        getType(value) {
            if (typeof value === "string") {
                return "string"
            } else if (typeof value === "number") { //NaN
                return "number"
            } else if (typeof value === "boolean") {
                return "boolean"
            } else if (Array.isArray(value)) {
                return "array"
            } else if (typeof value === "object" && value !== null) {
                return "object"
            } else { // null undefined ...
                return "string"
            }
        }
    }
};
</script>



<style lang="scss">
.json-wrap {
    padding: size(10) size(10);
    position: relative; //递归组件只在外层添加relative，否则offsetleft取值会出现问题
    border-radius: $border-radius-sm;
    font-size: size(14);
    max-height: size(400);
    overflow-y: auto;
    background: #282c34;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
    .operation {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        height: size(20);
        color: $gray-500;
        font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;;
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
