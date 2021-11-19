/*
    创建者：shuxiaokai
    创建时间：2021-06-14 12:08
    模块名称：
    备注：
*/
<template>
    <div class="s-permission">
        <el-tabs v-model="activeName" @tab-click="handleChangeTabs">
            <el-tab-pane :label="$t('用户')" name="s-user"></el-tab-pane>
            <el-tab-pane :label="$t('角色维护')" name="s-role"></el-tab-pane>
            <el-tab-pane :label="$t('菜单维护')" name="s-menu"></el-tab-pane>
            <el-tab-pane :label="$t('前端路由')" name="s-client-routes"></el-tab-pane>
            <el-tab-pane :label="$t('后端路由(接口)')" name="s-server-routes"></el-tab-pane>
        </el-tabs>
        <component :is="activeName"></component>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import user from "./user/user.vue"
import role from "./role/role.vue"
import menu from "./menu/menu.vue"
import clientRoutes from "./client-routes/client-routes.vue"
import serverRoutes from "./server-routes/server-routes.vue"

export default defineComponent({
    components: {
        "s-user": user,
        "s-role": role,
        "s-menu": menu,
        "s-client-routes": clientRoutes,
        "s-server-routes": serverRoutes,
    },
    data() {
        return {
            activeName: "s-user", //当前选中tab
        };
    },
    created() {
        this.restoreLastVisitTab();
    },
    methods: {
        //恢复上次访问的tab
        restoreLastVisitTab() {
            const localTab = localStorage.getItem("permission/activeTab");
            if (localTab) {
                this.activeName = localTab;
            }
        },
        //缓存上一次访问的tab
        handleChangeTabs() {
            localStorage.setItem("permission/activeTab", this.activeName)
        },
    },
})
</script>

<style lang="scss">
.s-permission {
    width: 70%;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
}
</style>
