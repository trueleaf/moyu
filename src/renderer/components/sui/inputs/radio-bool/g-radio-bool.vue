/*
    创建者：shuxiaokai
    创建时间：2020-03-30 15:19
    模块名称：布尔类型radio二次封装
    备注：xxxx
*/
<template>
    <s-col v-bind="$attrs">
        <!-- 存在el-form-item包裹 -->
        <el-form-item v-if="!noFormItem" :label="realLabel" :prop="prop" :label-width="labelWidth">
            <el-radio-group :value="value" @input="handleInput">
                <el-radio :label="trueValue">{{ trueText }}</el-radio>
                <el-radio :label="falseValue">{{ falseText }}</el-radio>
            </el-radio-group>
        </el-form-item>   
        <!-- 不存在el-form-item包裹 -->
        <div v-else>
            <el-radio-group :value="value" @input="handleInput">
                <el-radio :label="trueValue">{{ trueText }}</el-radio>
                <el-radio :label="falseValue">{{ falseText }}</el-radio>
            </el-radio-group>
        </div>
    </s-col>
</template>

<script>
export default {
    props: {
        label: { //文案
            type: String,
            default: ""
        },
        value: { //v-model绑定的值
            type: [String, Boolean, Number],
            default: ""
        },
        noFormItem: { //是否存在el-form-item包裹
            type: Boolean,
            default: false
        },
        prop: { //表单验证prop值
            type: String,
            default: ""
        },
        trueText: {
            type: String,
            default: "是"
        },
        falseText: {
            type: String,
            default: "否"
        },
        trueValue: {
            type: [Number, String, Boolean],
            default: true
        },
        falseValue: {
            type: [Number, String, Boolean],
            default: false
        },
        labelWidth: {
            type: String,
            default: null
        },
    },
    data() {
        return {
            radio: ""
        };
    },
    computed: {
        realLabel() { //实际label值，自动拼接
            if (this.label.endsWith("：")) {
                return this.label;
            } else if (this.label.endsWith(":")) {
                return this.label.replace(":", "：")
            } else {
                return this.label + "："
            }
        },
        placeholder() {
            return "请输入" + this.label;
        },
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        handleInput(val) {
            this.$emit("input", val);
            setTimeout(() => {
                this.$emit("_change", val);
            }, 1);
            console.log(val)
        }
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
