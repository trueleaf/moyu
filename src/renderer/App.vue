<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
<script>
let ipcRenderer = null;
if (window.require) {
    // eslint-disable-next-line prefer-destructuring
    ipcRenderer = window.require("electron").ipcRenderer;
}
export default {
    mounted() {
        this.initShortcut();
        if (!this.config.isDev) {
            console.log(`
                     _ _            _ _           _ _ _ _ _ _ _     _ _      _ _    _ _        _ _
                    / _ \\          / _ \\         / _ _ _ _ _ _ \\    \\   \\   /   /   |  |       |  |
                   / / \\ \\        / / \\ \\       / /           \\ \\    \\   \\ /   /    |  |       |  |
                  / /   \\ \\      / /   \\ \\     | |             | |    \\   /   /     |  |       |  |
                 / /     \\ \\    / /     \\ \\    | |             | |     \\ /   /      |  |       |  |
                / /       \\ \\  / /       \\ \\    \\ \\_ _ _ _ _ _/ /       /   /       \\ _|_ _ _ _| _/
               /_/         \\_\\/_/         \\_\\    \\_ _ _ _ _ _ _/       /_ _/         \\ _ _ _ _ _ /

               基于Vue和Electron的接口文档工具

               GitHub地址：https://github.com/trueleaf/moyu

               Gitee地址：https://gitee.com/shuzhikai/moyu
            `)
            console.log(process.env.VUE_APP_BUILD_TIME);
        }
    },
    methods: {
        //初始化快捷键
        initShortcut() {
            if (window.require) {
                window.addEventListener("keyup", (e) => {
                    if (e.ctrlKey && e.key === "F5") {
                        e.preventDefault();
                        ipcRenderer.send("vue-strong-fresh-content")
                    }
                    if (e.ctrlKey && e.key === "F12") {
                        e.preventDefault();
                        ipcRenderer.send("vue-open-dev-tools")
                    }
                    if (e.ctrlKey && e.key === "ArrowLeft") {
                        e.preventDefault();
                        this.$router.go(-1);
                    }
                    if (e.ctrlKey && e.key === "ArrowRight") {
                        e.preventDefault();
                        this.$router.go(1);
                    }
                })
            }
        },
    },
};
</script>

<style lang="scss">
#app {
    height: 100%;
}
</style>
