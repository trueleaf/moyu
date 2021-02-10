/*
    创建者：shuxiaokai
    创建时间：2020-03-30 15:19
    模块名称：普通输入框二次封装
    备注：xxxx
*/
<template>
    <s-col v-bind="$attrs">
        <!-- 存在el-form-item包裹 -->
        <el-form-item v-if="!noFormItem" :label="realLabel" :label-width="labelWidth">
            <span v-if="!$slots.default" class="text-ellipsis gray-600" :title="value" :class="className">{{ value }}</span>
            <slot v-else />
        </el-form-item>   
        <!-- 不存在el-form-item包裹 -->
        <span v-else class="text-ellipsis gray-600" :title="value" :class="className">{{ value }}</span>  
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
            type: [String, Number],
            default: ""
        },
        noFormItem: { //是否存在el-form-item包裹
            type: Boolean,
            default: false
        },
        className: { //自定义class值
            type: String,
            default: "w-100"
        },
        labelWidth: {
            type: String,
            default: null
        },
    },
    data() {
        return {};
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
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        handleInput() {
            this.$emit("input", this.value);
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
