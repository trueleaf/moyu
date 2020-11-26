/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div v-if="tabs && tabs.length > 0" class="workbench" tabindex="0">
        <keep-alive>
            <s-apidoc v-if="currentSelectDoc.tabType === 'doc'"></s-apidoc>
            <s-config v-if="currentSelectDoc.tabType === 'config'"></s-config>
            <s-statistics v-if="currentSelectDoc.tabType === 'statistics'"></s-statistics>
        </keep-alive>
    </div>
    <s-statistics v-else></s-statistics>
</template>

<script>
import apidoc from "./apidoc/apidoc"
import config from "./config/config"
import statistics from "./statistics/statistics"

export default {
    components: {
        "s-apidoc": apidoc,
        "s-config": config,
        "s-statistics": statistics,
    },
    data() {
        return {
           
        };
    },
    computed: {
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        tabs() { //全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
    },
    mounted() {
        this.getMindParamsEnum(); //获取联想参数枚举
        this.getPresetParams(); //获取预设参数
    },
    methods: {
        //=====================================获取数据====================================//
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
    }
};
</script>



<style lang="scss">
.workbench {
    min-height: calc(100vh - #{size(100)});
}
</style>
