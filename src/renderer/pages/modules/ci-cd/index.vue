/*
    创建者：shuxiaokai
    创建时间：2020-06-19 13:19
    模块名称：项目管理
    备注：包含项目列表和团队管理
*/
<template>
    <div class="ci-cd">
        <el-tabs v-model="activeName">
            <el-tab-pane name="tab-a">
                <span slot="label"><i class="el-icon-tickets"></i> 项目列表</span>
            </el-tab-pane>
            <el-tab-pane name="tab-b">
                <span slot="label"><i class="el-icon-user"></i> 团队管理</span>
            </el-tab-pane>
        </el-tabs>
        <component :is="activeName"></component>
    </div>
</template>

<script>
import tabA from "./tab-a/tab-a"
import tabB from "./tab-b/tab-b"
export default {
    components: {
        "tab-a": tabA, //项目列表
        "tab-b": tabB, //团队管理
    },
    data() {
        return {
            activeName: "tab-a", //当前激活选项卡
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
.ci-cd {
    width: 70%;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
    @media only screen and (max-width: 1199px) {
        width: 100%;
        padding: 0 20px;
    }
}
</style>
