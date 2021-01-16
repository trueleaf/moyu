/*
    创建者：shuxiaokai
    创建时间：2021-01-16 13:09
    模块名称：请求参数
    备注：xxxx
*/
<template>
    <s-collapse-card title="请求参数" class="request-params" ref="collapse">
        <!-- <div class="px-5">
            <el-tabs v-model="activeName">
                <el-tab-pane name="params">
                    <span slot="label">
                        <span>params</span>
                        <span>&nbsp;(2)</span>
                    </span>
                    aaa
                </el-tab-pane>
                <el-tab-pane name="json">
                    <span slot="label" :class="{disabled: activeName !== 'params' && activeName !== 'json'}">
                        <span>json</span>
                        <span>&nbsp;(2)</span>
                    </span>
                    bbb
                </el-tab-pane>
                <el-tab-pane name="form-data">
                    <span slot="label" :class="{disabled: activeName !== 'params' && activeName !== 'form-data'}">
                        <span>form-data</span>
                        <span>&nbsp;(2)</span>
                    </span>
                    ccc
                </el-tab-pane>
                <el-tab-pane name="x-www-form-urlencoded">
                    <span slot="label" :class="{disabled: activeName !== 'params' && activeName !== 'x-www-form-urlencoded'}">
                        <span>x-www-form-urlencoded</span>
                        <span>&nbsp;(2)</span>
                    </span>
                    ddd
                </el-tab-pane>
            </el-tabs>
        </div> -->
        
        <!-- <s-params-tree 
            ref="paramsTree"
            :tree-data="request.requestParams"
            :nest="request.requestType === 'json'"
            :enable-form-data="request.requestType === 'formData'"
            :mind-params="mindParams.mindRequestParams"
            showCheckbox
        >
        </s-params-tree> -->
        <!-- <el-select slot="tail" v-model="formInfo." size="mini">
            <el-option v-for="(item,index) in " :key="index" :value="item.id" :label="item.name"></el-option>
        </el-select> -->
    </s-collapse-card>
</template>

<script>
export default {
    data() {
        return {
            activeName: "params"
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
.request-params {
    .disabled {
        color: $gray-400;
    }
}
</style>
