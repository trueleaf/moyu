/*
    创建者：shuxiaokai
    创建时间：2021-06-15 21:09
    模块名称：表单组件
    备注：
*/
<template>
    <el-form ref="form" v-bind="$attrs" :model="formInfo" :rules="rules" @submit.prevent="handleSubmit">
        <div v-if="config.isDev && showTips">
            {{ formInfo }}
        </div>
        <div v-if="config.isDev && showRules">
            {{ rules }}
        </div>
        <el-row>
            <slot />
        </el-row>
        <div class="d-flex a-center j-center">
            <slot name="operation" />
        </div>
    </el-form>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import config from "@/../config/config"

export default defineComponent({
    props: {
        formInfo: { //表单数据
            type: Object,
            default: () => ({})
        },
        showTips: { //是否formInfo打印,生产环境不生效
            type: Boolean,
            default: false,
        },
        showRules: { //展示rules,生产环境无效
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            rules: {}, //-----验证规则
            config, //--------配置信息
        };
    },
    methods: {
        handleSubmit() {
            console.log(22)
        },
    },
})
</script>

<style lang="scss">

</style>
