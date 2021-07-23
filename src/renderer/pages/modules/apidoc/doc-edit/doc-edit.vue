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
import { defineComponent } from "vue"
import banner from "./banner/banner.vue";
import nav from "./nav/nav.vue";
import content from "./content/content.vue";

export default defineComponent({
    components: {
        "s-banner": banner,
        "s-nav": nav,
        "s-content": content,
    },
    data() {
        return {
            loading: false, //数据加载效果
        };
    },
    created() {
        this.getProjectInfo();
    },
    methods: {
        /**
         * 获取项目基本信息
         */
        getProjectInfo() {
            this.loading = true;
            const params = {
                _id: this.$route.query.id,
            }
            this.axios.get("/api/project/project_full_info", { params }).then((res) => {
                console.log(res)
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
    },
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
