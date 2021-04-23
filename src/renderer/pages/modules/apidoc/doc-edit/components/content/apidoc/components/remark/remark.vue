/*
    创建者：shuxiaokai
    创建时间：2020-11-20 16:01
    模块名称：文档备注
    备注：xxxx
*/
<template>
    <s-collapse-card ref="collapse" title="备注信息" class="remark-params" fold>
        <div class="px-5 py-2">
            <s-rich-text v-model="description"></s-rich-text>
        </div>
    </s-collapse-card>
</template>

<script>
export default {
    computed: {
        description: {
            get() {
                return this.$store.state.apidoc.apidocInfo?.info?.description;
            },
            set(val) {
                this.$store.commit("apidoc/changeDescription", val);
            },
        },
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">

</style>
