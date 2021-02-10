/*
    创建者：shuxiaokai
    创建时间：2020-03-01 20:42
    模块名称：数据展示
    备注：xxxx
*/
<template>
    <el-row>
        <slot />
    </el-row>
</template>

<script>
export default {
    name: "SView",
    props: {
        showTip: { //是否formInfo打印,生产环境不生效
            type: Boolean,
            default: false,
        },
        labelWidth: {
            type: String,
            default: "150px"
        },
    },
    data() {
        return {
        };
    },
    provide() {
        return {
            //formInfo: this.formInfo, //表格参数
            //labelWidth: this.labelWidth, //label宽度
        }
    },
    created() {
        //this.initFormInfo(); //初始化表单参数
    },
    methods: {
        //初始化表单参数
        // initFormInfo() {
        //     this.$slots.default.forEach(components => {
        //         const propsData = components.componentOptions.propsData;
        //         const defaultValue = this.formInfo[propsData.vModel]
        //         this.$set(this.formInfo, propsData.vModel, defaultValue || "");
        //     })
        // },
    }
};
</script>



<style lang="scss">

</style>
