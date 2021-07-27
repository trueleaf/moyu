/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:00
    模块名称：
    备注：
*/
<template>
    <s-loading ref="bannerRef" :loading="loading" class="banner" tabindex="1">
        <s-tool></s-tool>
    </s-loading>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import tool from "./components/tool/tool.vue"
import { useBannerData } from "./composables/banner-data"

export default defineComponent({
    components: {
        "s-tool": tool,
    },
    setup() {
        const { loading, banner, getBannerData } = useBannerData();
        return {
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
    width: size(300);
    height: 100%;
    border-right: 1px solid $gray-400;
    display: flex;
    flex-direction: column;
    position: relative;
}
</style>
