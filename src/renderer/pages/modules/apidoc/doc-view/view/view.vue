/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:58
    模块名称：文档编辑页面
    备注：
*/
<template>
    <div class="doc-view">
        <s-banner></s-banner>
        <div class="doc-wrap">
            <s-nav></s-nav>
            <s-content></s-content>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue"
import { useRoute } from "vue-router"
import banner from "./banner/banner.vue";
import nav from "./nav/nav.vue";
import content from "./content/content.vue";
// import { router } from "@/router/index"
import { useStore } from "@/store/index"

export default defineComponent({
    components: {
        "s-banner": banner,
        "s-nav": nav,
        "s-content": content,
    },
    setup() {
        const store = useStore();
        const route = useRoute()
        //=====================================基本数据获取====================================//
        //获取项目基本信息
        const getProjectInfo = () => {
            const shareId = route.query.id as string;
            const password = localStorage.getItem("share/password") || ""
            store.dispatch("apidoc/baseInfo/getSharedProjectBaseInfo", { shareId, password });
        }
        //初始化cookie
        const initCookies = () => {
            store.commit("apidoc/baseInfo/initCookies")
        }
        //初始化布局
        const initLayout = () => {
            store.commit("apidoc/baseInfo/initLayout")
        }
        onMounted(() => {
            getProjectInfo();
            initCookies();
            initLayout();
        })
        store.commit("apidoc/baseInfo/changeMode", "view");
    }
})
</script>

<style lang="scss">
.doc-view {
    display: flex;
    overflow: hidden;
    height: 100%;
    .doc-wrap {
        flex: 1;
        overflow: hidden;
    }
}
</style>
