/*
    创建者：shuxiaokai
    创建时间：2020-8-24 20:24
    模块名称：文档查看页面
    备注：xxxx
*/
<template>
    <div class="doc-view">
        <s-banner></s-banner>
        <div class="doc-wrap">
            <s-navs></s-navs>
            <s-content></s-content>
        </div>
    </div>
</template>

<script>
import Server from "@/server"
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
        return {
            mockServer: null,
        };
    },
    created() {
        this.getHostEnum(); //获取host值
        this.getVariables(); //获取全局变量
        this.getProjectRules(); //获取项目规则
        this.initMockServer(); //初始化mock服务器
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取host值
        getHostEnum() {
            this.$store.dispatch("apidoc/getHostEnum", {
                projectId: this.$route.query.id,
            });
        },
        initMockServer() {
            this.mockServer = new Server();
            this.mockServer.init(this.$route.query.id);
            this.mockServer.start();
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
        //=====================================其他操作=====================================//
    },
};
</script>

<style lang="scss" scoped>
.doc-view {
    display: flex;
    overflow: hidden;
    .banner {
        flex: 0 0 auto;
    }
    .doc-wrap {
        flex: 1;
        overflow: hidden;
    }
}
</style>
