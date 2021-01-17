/*
    创建者：shuxiaokai
    创建时间：2021-01-16 13:57
    模块名称：查询字符串
    备注：xxxx
*/
<template>
    <s-collapse-card>
        <div slot="head">
            <span>请求参数</span>
            <span>(params)</span>
        </div>
        <s-params-tree 
            ref="paramsTree"
            :tree-data="queryParams"
            :nest="false"
            :mind-params="mindParams.mindRequestParams"
            showCheckbox
        >
        </s-params-tree>
    </s-collapse-card>
</template>

<script>
import paramsTree from "../params-tree/params-tree"
export default {
    components: {
        "s-params-tree": paramsTree
    },
    computed: {
        queryParams: { //请求参数
            get(){
                return this.$store.state.apidoc.apidocInfo?.item?.queryParams;
            },
            set(val) {
                console.log(222222)
                this.$store.commit("apidoc/changeQueryParams", val);
            }
        },
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
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
