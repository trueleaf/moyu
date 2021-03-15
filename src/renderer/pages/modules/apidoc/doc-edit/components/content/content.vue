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
            <!-- 参数模板 -->
            <s-params-template v-if="currentSelectDoc.tabType === 'paramsTemplate'"></s-params-template>
            <!-- 在线链接 -->
            <s-online-link v-if="currentSelectDoc.tabType === 'onlineLink'"></s-online-link>
            <!-- 导出文档 -->
            <s-export-doc v-if="currentSelectDoc.tabType === 'exportDoc'"></s-export-doc>
        </keep-alive>
    </div>
    <s-statistics v-else></s-statistics>
</template>

<script>
import apidoc from "./apidoc/apidoc.vue";
import config from "./config/config.vue";
import statistics from "./statistics/statistics.vue";
import paramsTemplate from "./params-template/params-template.vue";
import onlineLink from "./link/link.vue";
import exportDoc from "./export/export.vue";

export default {
    components: {
        "s-apidoc": apidoc,
        "s-config": config,
        "s-statistics": statistics,
        "s-params-template": paramsTemplate,
        "s-online-link": onlineLink,
        "s-export-doc": exportDoc,
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

<style lang="scss">
.workbench {
    overflow-y: auto;
    min-height: calc(100vh - #{size(100)});
}
</style>
