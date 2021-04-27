/*
    创建者：shuxiaokai
    创建时间：2021-04-16 21:57
    模块名称：path参数
    备注：xxxx
*/
<template>
    <s-collapse-card v-bind="$attrs">
        <!-- 头部 -->
        <div slot="head">
            <span>请求参数</span>
            <span>(Path)</span>
        </div>
        <!-- 参数录入 -->
        <s-params-tree
            ref="paramsTree"
            :tree-data="pathParams"
            :nest="false"
            readonly-key
            disable-add
            disable-delete
        >
        </s-params-tree>
        <!-- 弹窗 -->
    </s-collapse-card>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数

export default {
    mixins: [mixin],
    computed: {
        pathParams: { //请求参数
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.paths;
            },
            set(val) {
                this.$store.commit("apidoc/changePathParams", val);
            },
        },
    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //选中_select为true的参数
        selectChecked() {
            return new Promise((resolve, reject) => {
                this.$refs.paramsTree.selectChecked().then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err)
                });
            })
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.apply-template {
    @include apply-template;
}
</style>
