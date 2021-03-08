/*
    创建者：shuxiaokai
    创建时间：2020-8-24 20:24
    模块名称：文档查看页面
    备注：xxxx
*/
<template>
    <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="doc-view">
        <s-banner></s-banner>
        <div class="doc-wrap">
            <s-navs></s-navs>
            <s-content></s-content>
        </div>
    </div>
</template>

<script>
import banner from "./components/banner/banner.vue";
import content from "./components/content/content.vue";

export default {
    components: {
        "s-banner": banner,
        "s-content": content,
    },
    data() {
        return {
            shareData: null,
            loading: false,
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        //=====================================获取远程数据==================================//
        //初始化
        init() {
            if (!window.SHARE_DATA && !window.IS_OFFLINE) { //非静态页面数据被清空返回密码填写页面
                this.$router.push("/");
                return;
            }
            this.getData();
            this.getHostEnum();
            this.getProjectRules();
        },
        //获取文档数据
        getData() {
            this.loading = true;
            const params = {
                shareId: localStorage.getItem("shareId"),
                password: localStorage.getItem("password"),
            };
            this.axios.get("/api/project/share", { params }).then((res) => {
                window.SHARE_DATA = res.data;
                localStorage.setItem("shareData", JSON.stringify(res.data));
                this.$event.emit("dataReady");
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //获取host值
        getHostEnum() {
            const { hosts } = window.SHARE_DATA;
            this.$store.commit("apidoc/initAndChangeHostEnum", hosts);
        },
        //获取项目规则
        getProjectRules() {
            const { rules } = window.SHARE_DATA;
            this.$store.commit("apidocRules/changeRules", rules);
        },
        //=====================================其他操作=====================================//
    },
};
</script>

<style lang="scss">
.doc-view {
    display: flex;
    overflow: hidden;
    min-height: 100vh;
    .banner {
        flex: 0 0 auto;
    }
    .doc-wrap {
        flex: 1;
        overflow: hidden;
    }
}
</style>
