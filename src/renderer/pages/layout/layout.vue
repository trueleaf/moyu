/*
    创建者：shuxiaokai
    创建时间：2021-06-08 19:23
    模块名称：布局页面
    备注：
*/
<template>
    <div class="s-content">
        <div class="s-header">
            <div class="ml-5 header-left fl d-flex a-center">
                <span class="f-lg mr-5 gray-200 cursor-pointer" @click="jumpToHome">{{ config.renderConfig.layout.title }}</span>
                <el-menu :default-active="activeMenuPath" mode="horizontal" background-color="#343a40" text-color="#fff" active-text-color="#ffd04b" :router="true">
                    <el-menu-item v-for="(item) in menus" :key="item.path" :index="item.path">
                        {{ item.name }}
                    </el-menu-item>
                </el-menu>
            </div>
            <div class="header-right mr-5 fr">
                <div class="operation">
                    <div title="刷新" class="op_item" @click="freshContent">
                        <span class="el-icon-refresh-right"></span>
                    </div>
                    <div title="后退" class="op_item" @click="goBack">
                        <span class="el-icon-back"></span>
                    </div>
                    <div class="op_item" @click="goForward">
                        <span title="前进" class="el-icon-right"></span>
                    </div>
                </div>
                <div v-if="downloading" class="process">
                    <span v-if="progress !== 100" title="更新进度">{{ progress.toFixed(1) }}%</span>
                    <span v-else class="cursor-pointer yellow" @click="handleInstall">安装</span>
                </div>
                <el-dropdown>
                    <span class="cursor-pointer">
                        <span>{{ userInfo.realName || userInfo.loginName }}</span>
                        <i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="jumpToUserSetting">个人中心</el-dropdown-item>
                            <el-dropdown-item v-if="!isWeb" :disabled="downloading" @click="handleCheckUpdate(true)">检查更新</el-dropdown-item>
                            <el-dropdown-item>版本{{ config.updateConfig.version }}</el-dropdown-item>
                            <el-dropdown-item @click="logout">退出登陆</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
        <div class="page-wrap">
            <router-view></router-view>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IpcRenderer } from "electron"

let ipcRenderer: IpcRenderer;
if (window.require) {
    // eslint-disable-next-line prefer-destructuring
    ipcRenderer = window.require("electron").ipcRenderer;
}

export default defineComponent({
    data() {
        return {
            activeMenuPath: "", //=========当前路由路径
            progress: 0, //================下载进度
            downloading: false, //=========是否正在下载安装包
            isWeb: !window.require, //=====当前环境，electron环境才允许下载升级
            isManual: false, //============是否手动更新
            ip: null, //===================当前本机内网ip地址，方便联调
        };
    },
    computed: {
        menus(): Array<number> { //所有菜单
            return [];
        },
        userInfo() { //用户信息
            return [];
        },
    },
    methods: {
        //=====================================操作区域====================================//
        //刷新页面
        freshContent() {
            if (ipcRenderer) {
                ipcRenderer.send("vue-fresh-content");
            }
        },
        //后退
        goBack() {
            this.$router.back();
        },
        //前进
        goForward() {
            this.$router.forward();
        },
        //=====================================组件操作====================================//
        //跳转到首页
        jumpToHome() {
            this.$router.push("/v1/apidoc/doc-list");
        },
        //跳转到用户设置
        jumpToUserSetting() {
            this.$router.push("/v1/settings/user");
        },
        //退出登录
        logout() {
            this.$store.commit("permission/clearAllPermission");
            sessionStorage.clear();
            this.$router.push("/login");
        },
    },
})
</script>

<style lang="scss">
.s-content {
    width: 100%;
    height: 100%;
    .s-header {
        background: $gray-800;
        height: 60px;
        .header-left {
            height: 100%;
        }
        .header-right {
            height: 100%;
            display: flex;
            align-items: center;
            color: $white;
            .operation {
                margin-right: size(10);
                display: flex;
                height: 100%;
                align-items: center;
                .op_item {
                    width: size(30);
                    height: size(30);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: size(20);
                    border-radius: 50%;
                    &:hover {
                        background: $gray-600;
                    }
                }
            }
            .process {
                margin-right: size(10);
            }
        }
        .el-dropdown {
            color: $white;
        }
    }
    .page-wrap {
        overflow-y: auto;
        height: calc(100vh - #{size(60)});
    }
}
</style>
