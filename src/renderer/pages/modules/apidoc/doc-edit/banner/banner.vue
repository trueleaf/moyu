/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:00
    模块名称：
    备注：
*/
<template>
    <div ref="bannerRef" class="banner" tabindex="1">
        <!-- <s-loading :loading="loading">{{ banner }}</s-loading> -->
        {{ banner }}
        <!-- 工具栏 -->
        <!-- <div class="tool">
            <h2 class="gray-700 f-lg text-center text-ellipsis" :title="$route.query.name">{{ $route.query.name }}</h2>
            <el-input v-model="queryData" class="doc-search" placeholder="文档名称,文档url,创建者" clearable @input="handleSearchTree"></el-input>
            <s-shortcut></s-shortcut>
        </div> -->
    </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue"
import { useStore } from "vuex"
import { DocBanner } from "@@/global"

export default defineComponent({
    setup() {
        const store = useStore();
        const banner = ref<DocBanner[]>([]);
        const loading = ref(false);
        const getBannerData = async () => {
            loading.value = true;
            banner.value = await store.dispatch("");
            loading.value = false;
        }
        getBannerData();
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
