/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:00
    模块名称：内容编辑区域
    备注：
*/
<template>
    <keep-alive>
        <s-guide v-if="!currentSelectTab || currentSelectTab?.tabType === 'guide'"></s-guide>
        <s-variable v-else-if="currentSelectTab.tabType === 'variable'"></s-variable>
        <s-params-template v-else-if="currentSelectTab.tabType === 'paramsTemplate'"></s-params-template>
        <s-mind-params v-else-if="currentSelectTab.tabType === 'mindParams'"></s-mind-params>
        <s-apidoc v-else-if="currentSelectTab.tabType === 'doc'"></s-apidoc>
        <s-export v-else-if="currentSelectTab.tabType === 'exportDoc'"></s-export>
        <s-import-doc v-else-if="currentSelectTab.tabType === 'importDoc'"></s-import-doc>
        <s-online-link v-else-if="currentSelectTab.tabType === 'onlineLink'"></s-online-link>
        <s-recycler v-else-if="currentSelectTab.tabType === 'recycler'"></s-recycler>
        <s-history v-else-if="currentSelectTab.tabType === 'history'"></s-history>
        <s-config v-else-if="currentSelectTab.tabType === 'config'"></s-config>
        <s-hook v-else-if="currentSelectTab.tabType === 'hook'"></s-hook>
        <s-common-header v-else-if="currentSelectTab.tabType === 'commonHeader'"></s-common-header>
        <s-package v-else-if="currentSelectTab.tabType === 'package'"></s-package>
    </keep-alive>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import type { ApidocTab } from "@@/store"
import apidoc from "./apidoc/apidoc.vue";
import guide from "./guide/guide.vue";
import variable from "./variable/variable.vue";
import mindParams from "./mind-params/mind-params.vue";
import paramsTemplate from "./params-template/params-template.vue";
import exportDoc from "./export/export.vue";
import importDoc from "./import/import.vue"
import onlineLink from "./link/link.vue"
import recycler from "./recycler/recycler.vue"
import history from "./history/history.vue"
import config from "./config/config.vue"
import hook from "./hook/hook.vue"
import commonHeader from "./common-header/common-header.vue"
import sPackage from "./package/package.vue"

export default defineComponent({
    components: {
        "s-guide": guide,
        "s-apidoc": apidoc,
        "s-variable": variable,
        "s-mind-params": mindParams,
        "s-params-template": paramsTemplate,
        "s-export": exportDoc,
        "s-import-doc": importDoc,
        "s-online-link": onlineLink,
        "s-recycler": recycler,
        "s-history": history,
        "s-config": config,
        "s-hook": hook,
        "s-common-header": commonHeader,
        "s-package": sPackage,
    },
    computed: {
        currentSelectTab(): ApidocTab | null { //当前选中的doc
            const projectId = this.$route.query.id as string;
            const tabs = this.$store.state["apidoc/tabs"].tabs[projectId];
            const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
            return currentSelectTab;
        },
    },
})
</script>

<style lang="scss" scoped>

</style>
