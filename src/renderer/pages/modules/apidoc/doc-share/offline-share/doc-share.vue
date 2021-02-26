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
    created() {
        this.getHostEnum(); //获取host值
        this.getProjectRules(); //获取项目规则
    },
    methods: {
        //=====================================获取远程数据==================================//
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
    height: 100%;
    display: flex;
    .banner {
        flex: 0 0 auto;
    }
    .doc-wrap {
        width: calc(100vw - #{size(300)});
    }
}
</style>
