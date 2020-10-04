/*
    创建者：shuxiaokai
    创建时间：2020-8-24 20:24
    模块名称：文档查看页面
    备注：xxxx
*/
<template>
    <div class="doc-view">
        <s-banner></s-banner>
        <div class="doc-wrap">
            <s-navs></s-navs>
            <s-content></s-content>
        </div>
    </div>
</template>

<script>
import banner from "./components/banner/banner"
import navs from "./components/navs/navs"
import content from "./components/content/content"
export default {
    components: {
        "s-banner": banner,
        "s-navs": navs,
        "s-content": content,
    },
    data() {
        return {

        };
    },
    created() {
        this.$store.dispatch("apidoc/getDocVariable", {
            projectId: this.$route.query.id
        });
    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.doc-view {
    height: 100%;
    display: flex;
    .banner {
        flex: 0 0 auto;
    }
    .doc-wrap {
        width: calc(100vw - #{size(300)});
    }
}
</style>
