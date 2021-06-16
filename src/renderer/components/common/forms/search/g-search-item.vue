/*
    创建者：shuxiaokai
    创建时间：2021-06-15 22:49
    模块名称：搜索数据项
    备注：
*/
<template>
    <el-col>
        {{ label }}: {{ prop }}
    </el-col>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        label: { //文案
            type: String,
            default: ""
        },
        prop: { //绑定参数的字段名称
            type: [String, Number, Boolean, Array],
            default: "",
        },
    },
    data() {
        return {
        };
    },
    methods: {
    },
})
</script>

<style lang="scss">

</style>
