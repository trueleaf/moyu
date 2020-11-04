/*
    创建者：shuxiaokai
    创建时间：2020-10-19 15:05
    模块名称：请求头
    备注：xxxx
*/
<template>
    <s-collapse-card title="请求头" class="header-params" fold>
        <s-params-tree 
            ref="headerParams"
            :tree-data="request.header"
            :nest="false"
            :enable-form-data="false"
            showCheckbox
            :mindParams="mindParams"
        >
        </s-params-tree>
    </s-collapse-card>
</template> 

<script>
export default {
    props: {
        request: { //---------------请求参数
            type: Object,
            default() {
                return {}
            }
        },
        dataReady: { //------------数据是否请求完毕
            type: Boolean,
            default: false
        }
    },
    watch: {
        dataReady(val) {
            if (val) {
                this.$refs["headerParams"].selectAll();
            }
        }
    },
    data() {
        return {
            mindParams: [
                {
                    key: "cookie",
                    value: "cookie",
                    description: "cookie",
                    type: "string"
                },
                {
                    key: "Authorization",
                    value: "Authorization",
                    description: "认证信息",
                    type: "string"
                },
                {
                    key: "content-type",
                    value: "application/json",
                    description: "请求体的MIME类型",
                    type: "string"
                }
                
            ],
            //=====================================其他参数====================================//
        };
    },
    created() {
    },
    methods: {
        //=====================================数据请求====================================//

    }
};
</script>



<style lang="scss">
.header-params {
    .operation {    
        display: flex;
        align-items: center;
        margin-left: size(20);
    }
}
</style>
