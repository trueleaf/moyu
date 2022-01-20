/*
    创建者：shuxiaokai
    创建时间：2021-06-08 19:20
    模块名称：首页
    备注：
*/
<template>
    <router-view></router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import config from "@/../config/config"

export default defineComponent({
    created() {
        if (!config.isDev && config.localization.consoleWelcome) {
            console.log(`
                     _ _            _ _           _ _ _ _ _ _ _     _ _      _ _    _ _        _ _
                    / _ \\          / _ \\         / _ _ _ _ _ _ \\    \\   \\   /   /   |  |       |  |
                   / / \\ \\        / / \\ \\       / /           \\ \\    \\   \\ /   /    |  |       |  |
                  / /   \\ \\      / /   \\ \\     | |             | |    \\   /   /     |  |       |  |
                 / /     \\ \\    / /     \\ \\    | |             | |     \\ /   /      |  |       |  |
                / /       \\ \\  / /       \\ \\    \\ \\_ _ _ _ _ _/ /       /   /       \\ _|_ _ _ _| _/
               /_/         \\_\\/_/         \\_\\    \\_ _ _ _ _ _ _/       /_ _/         \\ _ _ _ _ _ /

               ${this.$t("基于Vue和Electron的接口文档工具")}

               ${this.$t("GitHub地址")}：https://github.com/trueleaf/moyu

               ${this.$t("Gitee地址")}：https://gitee.com/shuzhikai/moyu

               ${this.$t("最近一次更新")}：${process.env.VUE_APP_BUILD_TIME}
            `)
        }
        if (!config.localization.consoleWelcome) {
            console.log(process.env.VUE_APP_BUILD_TIME);
        }
        document.title = `${config.isDev ? `${config.localization.title}(本地)` : config.localization.title} `;
    },
})
</script>

<style lang="scss">
#app {
    width: 100vw;
    height: 100vh;
}
</style>
