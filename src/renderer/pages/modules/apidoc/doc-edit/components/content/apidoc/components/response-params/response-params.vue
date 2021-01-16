/*
    创建者：shuxiaokai
    创建时间：2021-01-16 21:59
    模块名称：返回参数
    备注：xxxx
*/
<template>
    <s-collapse-card title="返回参数">
        <!-- <s-params-tree 
            ref="paramsTree"
            :tree-data="responseParams"
            :nest="false"
            :mind-params="mindParams.mindRequestParams"
            showCheckbox
        >
        </s-params-tree> -->
        {{ responseParams }}
    </s-collapse-card>
</template>

<script>
export default {
    computed: {
        responseParams: { //请求参数
            get(){
                return this.$store.state.apidoc.apidocInfo?.item?.responseParams;
            },
            set(val) {
                this.$store.commit("apidoc/changeresponseParams", val);
            }
        },
    },
    data() {
        return {

        };
    },
    created() {

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

</style>
