/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:00
    模块名称：
    备注：
*/
<template>
    <s-resize-x :min="280" :max="450" :width="300" name="banner">
        <s-loading ref="bannerRef" :loading="loading" class="banner" tabindex="1">
            <s-tool></s-tool>
        </s-loading>
    </s-resize-x>
</template>

<script lang="ts">
import { useStore } from "@/store/index"
import { defineComponent, computed } from "vue"
import tool from "./components/tool/tool.vue"
import { useBannerData } from "./composables/banner-data"

export default defineComponent({
    components: {
        "s-tool": tool,
    },
    setup() {
        const store = useStore();
        //获取banner数据
        const { loading, banner, getBannerData } = useBannerData();
        //获取项目名称
        const projectName = computed(() => {
            return store.state["apidoc/baseInfo"].projectName;
        });
        return {
            projectName,
            banner,
            loading,
            getBannerData,
        };
    },
})
</script>

<style lang="scss">
.banner {
    flex: 0 0 auto;
    // width: size(300);
    height: 100%;
    border-right: 1px solid $gray-400;
    display: flex;
    flex-direction: column;
    position: relative;
}
</style>
