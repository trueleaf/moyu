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
            <!-- 统计页面 -->
            <s-statistics v-if="currentSelectDoc.tabType === 'statistics'"></s-statistics>
        </keep-alive>
    </div>
    <s-statistics v-else></s-statistics>
</template>

<script>
import apidoc from "./apidoc/apidoc.vue";
import statistics from "./statistics/statistics.vue";

export default {
    components: {
        "s-apidoc": apidoc,
        "s-statistics": statistics,
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
