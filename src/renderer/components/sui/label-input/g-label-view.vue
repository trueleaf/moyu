/*
    创建者：shuxiaokai
    创建时间：2019-08-22 17:33
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div class="px-3">
        <el-row>
            <slot></slot>
        </el-row>        
    </div>

</template>

<script>
export default {
    name: "LabelView",
    props: {
        labelWidth: {
            type: Number,
            default: 100
        }
    },
    data() {
        return {
            
        };
    },
    created() {

    },
    methods: {

    }
};
</script>



<style lang="scss">

</style>
