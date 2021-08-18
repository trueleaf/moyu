/*
    创建者：shuxiaokai
    创建时间：2021-06-08 19:20
    模块名称：首页
    备注：
*/
<template>
    <el-config-provider :locale="locale">
        <router-view></router-view>
    </el-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { ElConfigProvider } from "element-plus"
import zhCn from "element-plus/lib/locale/lang/zh-cn"

export default defineComponent({
    components: {
        [ElConfigProvider.name]: ElConfigProvider,
    },
    data() {
        return {
            locale: zhCn,
        };
    },
    methods: {
    },
})
</script>

<style lang="scss">
#app {
    width: 100vw;
    height: 100vh;
}
</style>
