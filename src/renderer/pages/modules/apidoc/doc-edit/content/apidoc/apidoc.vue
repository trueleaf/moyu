/*
    创建者：shuxiaokai
    创建时间：2021-08-15 16:34
    模块名称：接口文档录入
    备注：
*/
<template>
    <div class="apidoc">
        <div class="request-layout">
            <s-operation></s-operation>
            <s-params></s-params>
        </div>
        <s-resize-x :min="400" :max="500" :width="400" name="response" bar-left class="response-layout" tabindex="1">
            <s-info></s-info>
            <s-response></s-response>
        </s-resize-x>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import operation from "./operation/operation.vue"
import params from "./params/params.vue"
import info from "./info/info.vue"
import response from "./response/response.vue"
import type { ApidocTab } from "@@/store"

export default defineComponent({
    components: {
        "s-operation": operation,
        "s-params": params,
        "s-info": info,
        "s-response": response,
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
    watch: {
        currentSelectTab: {
            handler(val: ApidocTab | null, oldVal: ApidocTab | null) {
                const isApidoc = val?.tabType === "doc";
                if (isApidoc && val?._id !== oldVal?._id) {
                    this.getApidocInfo();
                }
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        //获取api文档数据
        getApidocInfo() {
            this.$store.dispatch("apidoc/apidoc/getApidocDetail", {
                id: this.currentSelectTab?._id,
                projectId: this.$route.query.id,
            })
        },
    },
})
</script>

<style lang="scss" scoped>
.apidoc {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    display: flex;
    // 请求编辑区域
    .request-layout {
        flex: 1;
        overflow: hidden;
        border-right: 1px solid $gray-400;
    }
    // 返回编辑区域
    .response-layout {
        flex-grow: 0;
        flex-shrink: 0;
        width: size(300);
        // flex: 0 0 size(500);
    }
}
</style>
