/*
    创建者：shuxiaokai
    创建时间：2020-05-21 17:32
    模块名称：权限配置
    备注：xxxx
*/
<template>
    <div class="g-container">
        <el-tabs v-model="activeName">
            <el-tab-pane label="用户" name="s-user"></el-tab-pane>
            <el-tab-pane label="角色维护" name="s-role"> </el-tab-pane>
            <el-tab-pane label="路由维护" name="s-routes"> </el-tab-pane>
            <el-tab-pane label="菜单维护" name="s-menu"> </el-tab-pane>
        </el-tabs>
        <components :is="activeName"></components>
    </div>
</template>

<script>
import user from "./children/user/user"
import role from "./children/role/role"
import routes from "./children/routes/routes"
import menu from "./children/menu/menu"
export default {
    components: {
        "s-user": user,
        "s-role": role,
        "s-routes": routes,
        "s-menu": menu,
    },
    data() {
        return {
            activeName: "s-user"
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
.g-container {
    width: 70%;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
}
</style>
