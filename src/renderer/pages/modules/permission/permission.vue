/*
    创建者：shuxiaokai
    创建时间：2021-06-14 12:08
    模块名称：
    备注：
*/
<template>
    <div class="s-permission">
        <el-tabs v-model="activeName" @tab-click="handleChangeTabs">
            <el-tab-pane label="用户" name="s-user"></el-tab-pane>
            <el-tab-pane label="角色维护" name="s-role"> </el-tab-pane>
            <el-tab-pane label="路由维护" name="s-routes"> </el-tab-pane>
            <el-tab-pane label="菜单维护" name="s-menu"> </el-tab-pane>
        </el-tabs>
        <components :is="activeName"></components>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
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
