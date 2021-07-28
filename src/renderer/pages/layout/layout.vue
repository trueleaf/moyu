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
                    <div title="刷新" class="op_item" @click="freshPage">
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
                            <el-dropdown-item v-if="config.isElectron" :disabled="downloading" @click="handleCheckUpdate(true)">检查更新</el-dropdown-item>
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
import { useStore } from "@/store/index";
import { useRouter } from "vue-router"
import { IpcRenderer } from "electron"
import config from "@/../config/config"
import { PermissionMenu, PermissionUserInfo } from "@@/global"

let ipcRenderer: IpcRenderer;
if (window.require) {
    // eslint-disable-next-line prefer-destructuring
    ipcRenderer = window.require("electron").ipcRenderer;
}

export default defineComponent({
    setup() {
        const router = useRouter();
        const store = useStore();
        //辅助操作按钮(electron不具备浏览器前进、后退、刷新)
        const goBack = () => router.back()
        const goForward = () => router.forward();
        const freshPage = () => ipcRenderer && ipcRenderer.send("vue-fresh-content");
        //个人中心
        const jumpToHome = () => router.push("/v1/apidoc/doc-list");
        const jumpToUserSetting = () => router.push("/v1/settings/user");
        const logout = () => {
            store.commit("permission/clearAllPermission");
            sessionStorage.clear();
            router.push("/login");
        };
        return {
            goBack,
            goForward,
            freshPage,
            jumpToHome,
            jumpToUserSetting,
            logout,
        };
    },
    data() {
        return {
            //=====================================自动更新====================================//
            progress: 0, //-------------------下载进度
            downloading: false, //------------是否正在下载安装包
            isManual: false, //---------------是否手动更新
            //=====================================其他参数====================================//
            config, //------------------------配置相关
            activeMenuPath: "", //------------当前路由路径
        };
    },
    computed: {
        menus(): PermissionMenu[] { //所有菜单
            return this.$store.state.permission.menus;
        },
        userInfo(): PermissionUserInfo { //用户信息
            return this.$store.state.permission.userInfo;
        },
    },
    created() {
        this.activeMenuPath = this.$route.path;
    },
    methods: {
        //初始化自动更新相关事件
        initUploadEvent() {
            if (config.isElectron) {
                //存在可用更新
                ipcRenderer.on("vue-update-available", () => {
                    console.log("存在可用更新");
                });
                //没有可用更新
                ipcRenderer.on("vue-update-not-available", () => {
                    console.log("没有可用更新");
                    this.downloading = false;
                    if (this.isManual) {
                        this.$message.warning("暂无可用更新");
                    }
                });
                //下载中
                ipcRenderer.on("vue-download-progress", (e, progressObj) => {
                    console.log("下载中", e, progressObj);
                    this.downloading = true;
                    this.progress = progressObj.percent;
                });
                //下载完成
                ipcRenderer.on("vue-update-downloaded", (e, upload) => {
                    this.progress = 100;
                    console.log("下载完成", e, upload);
                });
                ipcRenderer.on("vue-download-error", (e, error) => {
                    if (this.isManual) {
                        this.$message.warning("更新异常请稍后再试");
                    }
                    this.downloading = false;
                    console.error(error);
                });
            }
        },
        //安装更新
        handleInstall() {
            if (config.isElectron) {
                ipcRenderer.send("vue-quit-and-install");
            }
        },
        //检查更新
        handleCheckUpdate(isManual: boolean) {
            this.downloading = true;
            this.isManual = isManual;
            if (config.isElectron) {
                ipcRenderer.send("vue-check-update");
            }
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
