/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:58
    模块名称：文档编辑页面
    备注：
*/
<template>
    <div class="doc-view">
        <s-banner></s-banner>
        <div class="doc-wrap">
            <s-nav></s-nav>
            <s-content></s-content>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import banner from "./banner/banner.vue";
import nav from "./nav/nav.vue";
import content from "./content/content.vue";

export default defineComponent({
    components: {
        "s-banner": banner,
        "s-nav": nav,
        "s-content": content,
    },
    data() {
        return {
            loading: false, //数据加载效果
        };
    },
    created() {
        this.getProjectInfo();
    },
    methods: {
        /**
         * 获取项目基本信息
         */
        getProjectInfo() {
            this.$store.dispatch("apidoc/baseInfo/getProjectBaseInfo", { projectId: this.$route.query.id });
            this.$store.commit("apidoc/baseInfo/initCookies")
        },
    },
})
</script>

<style lang="scss">
.doc-view {
    display: flex;
    overflow: hidden;
    height: 100%;
    .doc-wrap {
        flex: 1;
        overflow: hidden;
    }
}
</style>
