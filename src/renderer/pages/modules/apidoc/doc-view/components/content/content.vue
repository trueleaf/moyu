/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div v-if="tabs && tabs.length > 0" class="workbench" tabindex="0">
        <keep-alive>
            <!-- 文档页面 -->
            <s-apidoc v-if="currentSelectDoc.tabType === 'doc'"></s-apidoc>
            <!-- 配置页面 -->
            <s-config v-if="currentSelectDoc.tabType === 'config'"></s-config>
            <!-- 统计页面 -->
            <s-statistics v-if="currentSelectDoc.tabType === 'statistics'"></s-statistics>
            <!-- 在线链接 -->
            <s-online-link v-if="currentSelectDoc.tabType === 'onlineLink'"></s-online-link>
            <!-- 导出文档 -->
            <s-export-doc v-if="currentSelectDoc.tabType === 'exportDoc'"></s-export-doc>
            <!-- 历史记录 -->
            <s-doc-hisotry v-if="currentSelectDoc.tabType === 'history'"></s-doc-hisotry>
        </keep-alive>
    </div>
    <s-statistics v-else></s-statistics>
</template>

<script>
import docHistory from "@/pages/modules/apidoc/mixin/content/history/history.vue";
import onlineLink from "@/pages/modules/apidoc/mixin/content/link/link.vue";
import statistics from "@/pages/modules/apidoc/mixin/content/statistics/statistics.vue";
import exportDoc from "@/pages/modules/apidoc/mixin/content/export/export.vue";
import config from "@/pages/modules/apidoc/mixin/content/config/config.vue";
import apidoc from "./apidoc/apidoc.vue";

export default {
    components: {
        "s-apidoc": apidoc,
        "s-config": config,
        "s-statistics": statistics,
        "s-online-link": onlineLink,
        "s-export-doc": exportDoc,
        "s-doc-hisotry": docHistory,
    },
    data() {
        return {};
    },
    computed: {
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        tabs() { //全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
    },
    mounted() {},
    methods: {},
};
</script>

<style lang="scss" scoped>
.workbench {
    min-height: calc(100vh - #{size(100)});
}
</style>
