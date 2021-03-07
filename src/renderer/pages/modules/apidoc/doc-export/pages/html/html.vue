/*
    创建者：shuxiaokai
    创建时间：2020-8-24 20:24
    模块名称：文档查看页面
    备注：xxxx
*/
<template>
    <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="doc-view">
        <s-banner ref="banner"></s-banner>
        <div class="doc-wrap">
            <s-navs></s-navs>
            <s-content v-if="shareData"></s-content>
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
    created() {
        this.initData(); //初始化文档数据
    },
    methods: {
        //=====================================获取远程数据==================================//
        //初始化文档数据
        initData() {
            /* if (process.env.NODE_ENV === "development") {
                // eslint-disable-next-line global-require
                const data = require("../../assets/data.js");
                window.SHARE_DATA = data;
                window.PROJECT_ID = "5f806b7edd6d9b06e05d7a1e";
            } */
            if (window.SHARE_DATA) { //离线html
                return;
            }
            const { shareId, projectId, password } = this.$route.query;
            this.loading = true;
            const params = {
                projectId,
                shareId,
                password,
            };
            this.axios.get("/api/project/share", { params }).then((res) => {
                if (res.code === 101001) { //密码错误
                    this.initCacheData();
                } else if (res.code === 101002) { //文档sharid错误
                    this.initCacheData();
                } else if (res.code === 0) {
                    window.SHARE_DATA = res.data;
                    this.shareData = res.data;
                    localStorage.setItem("shareData", JSON.stringify(res.data));
                } else {
                    this.initCacheData();
                }
            }).catch((err) => {
                console.error(err);
                this.initCacheData();
            }).finally(() => {
                this.loading = false;
                this.getHostEnum(); //获取host值
                this.getProjectRules(); //获取项目规则
                this.$refs.banner.init();
            });
        },
        //获取缓存数据
        initCacheData() {
            const localData = localStorage.getItem("shareData") || "{}";
            window.SHARE_DATA = JSON.parse(localData);
            this.shareData = JSON.parse(localData);
        },
        //获取host值
        getHostEnum() {
            const { hosts } = window.SHARE_DATA;
            this.$store.commit("apidoc/initAndChangeHostEnum", hosts);
        },
        //获取项目规则
        getProjectRules() {
            //获取规则
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
