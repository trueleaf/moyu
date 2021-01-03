/*
    创建者：shuxiaokai
    创建时间：2020-11-20 16:01
    模块名称：文档备注
    备注：xxxx
*/
<template>
    <s-collapse-card ref="collapse" title="备注信息" class="remark-params" fold>
        <div class="px-5 py-5">
            <s-rich-text v-model="request.description"></s-rich-text>
        </div>
    </s-collapse-card>
</template>

<script>
export default {
    props: {
        request: {
            type: Object,
            default() {
                return {};
            }
        }
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
