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

export default defineComponent({
    components: {
        "s-guide": guide,
        "s-apidoc": apidoc,
        "s-variable": variable,
        "s-mind-params": mindParams,
        "s-params-template": paramsTemplate,
    },
    data() {
        return {
        };
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
