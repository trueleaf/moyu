/*
    创建者：shuxiaokai
    创建时间：2020-06-24 20:24
    模块名称：文档编辑界面
    备注：xxxx
*/
<template>
    <div class="doc-edit">
        <s-banner></s-banner>
        <div class="doc-wrap">
            <s-navs></s-navs>
            <s-content></s-content>
        </div>
    </div>
</template>

<script>
import banner from "./components/banner/banner.vue";
import navs from "./components/navs/navs.vue";
import content from "./components/content/content.vue";

export default {
    components: {
        "s-banner": banner,
        "s-navs": navs,
        "s-content": content,
    },
    data() {
        return {};
    },
    computed: {
        tabs() { //--------------全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
    },
    created() {
        this.getMindParamsEnum(); //获取联想参数枚举
        this.getPresetParams(); //获取预设参数
        this.getHostEnum(); //获取host值
        this.getVariables(); //获取全局变量
        this.getProjectRules(); //获取项目规则
        this.getLocalCookies(); //获取本地cookies
    },
    mounted() {
        window.addEventListener("keyup", this.initShortcut)
    },
    beforeDestroy() {
        window.removeEventListener("keyup", this.initShortcut)
    },
    methods: {
        //=====================================快捷键====================================//
        initShortcut(e) {
            if (e.ctrlKey && (e.key === "h" || e.key === "H")) {
                e.preventDefault();
                this.addAndChangeTab("历史记录", "history");
            } else if (e.ctrlKey && e.key === ",") {
                this.addAndChangeTab("文档全局配置", "config");
            } else if (e.ctrlKey && (e.key === "p" || e.key === "P")) {
                if (this.$route.path === "/v1/apidoc/doc-view") {
                    return;
                }
                this.$router.push({
                    path: "/v1/apidoc/doc-view",
                    query: {
                        id: this.$route.query.id,
                        name: this.$route.query.name,
                    },
                });
            } else if (e.ctrlKey && e.key === "i") {
                this.addAndChangeTab("文档导入", "importDoc");
            } else if (e.ctrlKey && e.key === "e") {
                this.addAndChangeTab("文档导出", "exportDoc");
            }
        },
        //新增并且改变当前选中tab
        addAndChangeTab(name, type) {
            this.$store.commit("apidoc/addTab", {
                _id: type,
                name,
                changed: false,
                tail: "",
                tabType: type,
                projectId: this.$route.query.id,
            });
            this.$store.commit("apidoc/changeCurrentTab", {
                _id: type,
                name,
                changed: false,
                tail: "",
                tabType: type,
                projectId: this.$route.query.id,
            });
        },
        //=====================================获取远程数据==================================//
        //获取联想参数
        getMindParamsEnum() {
            this.$store.dispatch("apidoc/getMindParamsEnum", {
                projectId: this.$route.query.id,
            });
        },
        //获取预设参数
        getPresetParams() {
            this.$store.dispatch("apidoc/getPresetParams", {
                projectId: this.$route.query.id,
            });
        },
        //获取host值
        getHostEnum() {
            this.$store.dispatch("apidoc/getHostEnum", {
                projectId: this.$route.query.id,
            });
        },
        //获取全局变量
        getVariables() {
            this.$store.dispatch("apidoc/getDocVariable", {
                projectId: this.$route.query.id,
            });
        },
        //获取项目规则
        getProjectRules() {
            this.$store.dispatch("apidocRules/getRuels", {
                projectId: this.$route.query.id,
            });
        },
        //获取本地cookies
        getLocalCookies() {
            let localCookies = localStorage.getItem("apidoc/cookies") || "[]";
            localCookies = JSON.parse(localCookies);
            localCookies = localCookies[this.$route.query.id] || [];
            this.$store.commit("apidoc/changeCookies", localCookies);
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//
    },
};
</script>

<style lang="scss">
.doc-edit {
    height: 100%;
    display: flex;
    .banner {
        flex: 0 0 auto;
    }
    .doc-wrap {
        flex: 1;
        overflow: hidden;
    }
}
</style>
