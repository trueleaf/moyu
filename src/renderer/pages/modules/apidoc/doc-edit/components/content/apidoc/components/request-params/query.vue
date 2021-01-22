/*
    创建者：shuxiaokai
    创建时间：2021-01-16 13:57
    模块名称：查询字符串
    备注：xxxx
*/
<template>
    <s-collapse-card>
        <!-- 头部 -->
        <div slot="head">
            <span>请求参数</span>
            <span>(Params)</span>
        </div>
        <!-- 快捷操作 -->
        <div slot="operation" class="px-5">
            <!-- json转换 -->
            <div class="cursor-pointer hover-theme-color mr-3" @click.stop="dialogVisible = true">
                <span>json转换</span>
            </div>
        </div>
        <!-- 参数录入 -->
        <s-params-tree 
            ref="paramsTree"
            :tree-data="queryParams"
            :nest="false"
            :mind-params="mindParams.queryParams"
            showCheckbox
        >
        </s-params-tree>
        <!-- 弹窗 -->
        <s-json-schema :visible.sync="dialogVisible" @success="handleConvertJsonToParams"></s-json-schema>
    </s-collapse-card>
</template>

<script>
import paramsTree from "../params-tree/params-tree"
import jsonSchema from "../../dialog/json-schema"

export default {
    components: {
        "s-params-tree": paramsTree,
        "s-json-schema": jsonSchema,
    },
    computed: {
        queryParams: { //请求参数
            get(){
                return this.$store.state.apidoc.apidocInfo?.item?.queryParams;
            },
            set(val) {
                this.$store.commit("apidoc/changeQueryParams", val);
            }
        },
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
    },
    data() {
        return {
            //=====================================其他参数====================================//
            dialogVisible: false, //将json转换为请求参数弹窗
        };
    },
    created() {
        
    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        //选中_select为true的参数
        selectChecked() {
            return new Promise((resolve, reject) => {
                this.$refs["paramsTree"].selectChecked().then(() => {
                    resolve();
                }).catch(err => {
                    reject(err)
                });
            })
        },
        //将json数据转换为参数
        handleConvertJsonToParams() {

        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
