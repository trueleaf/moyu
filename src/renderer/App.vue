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
