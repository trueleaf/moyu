/*
    创建者：shuxiaokai
    创建时间：2021-06-21 23:39
    模块名称：el-row   el-col
    备注：
*/
<template>
    <el-col :xs="24" :sm="24" :md="md" :lg="lg" :xl="xl">
        <slot />
    </el-col>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        /**
         * 是否一行显示
         */
        oneLine: {
            type: Boolean,
            default: false,
        },
        /**
         * 是否只显示半行
         */
        halfLine: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        md() { //处理oneline和halfLine
            if (this.oneLine) {
                return 24;
            }
            if (this.halfLine) {
                return 12;
            }
            return 12;
        },
        lg() { //处理oneline和halfLine
            if (this.oneLine) {
                return 24;
            }
            if (this.halfLine) {
                return 12;
            }
            return 6;
        },
        xl() { //处理oneline和halfLine
            if (this.oneLine) {
                return 24;
            }
            if (this.halfLine) {
                return 12;
            }
            return 6;
        },
    },
})
</script>

<style lang="scss">

</style>
