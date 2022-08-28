/*
    创建者：shuxiaokai
    创建时间：2021-06-08 19:23
    模块名称：布局页面
    备注：
*/
<template>
    <div class="s-content">
        <div class="s-header">
            <div class="ml-5 header-left">
                <span class="flex0 f-lg mr-5 gray-200 cursor-pointer" @click="jumpToHome">
                    <span>{{ config.localization.title }}</span>
                    <span v-if="config.isDev">(本地)</span>
                </span>
                <el-menu :default-active="activeMenuPath" mode="horizontal" background-color="#343a40" text-color="#fff" active-text-color="#ffd04b" :router="true">
                    <el-menu-item v-for="(item) in menus" :key="item.path" :index="item.path">
                        {{ $t(item.name) }}
                    </el-menu-item>
                </el-menu>
            </div>
            <div class="header-right mr-5 ml-auto">
                <div class="operation">
                    <div :title="$t('刷新')" class="op_item" @click="freshPage">
                        <el-icon :size="20">
                            <RefreshRight />
                        </el-icon>
                    </div>
                    <div :title="$t('后退')" class="op_item" @click="goBack">
                        <el-icon :size="20">
                            <Back />
                        </el-icon>
                    </div>
                    <div :title="$t('前进')" class="op_item" @click="goForward">
                        <el-icon :size="20">
                            <Right />
                        </el-icon>
                    </div>
                    <el-dropdown>
                        <i class="iconfont iconyuyan language"></i>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item @click="changeLocale('zh-cn')">中文简体</el-dropdown-item>
                                <el-dropdown-item @click="changeLocale('zh-tw')">中文繁體</el-dropdown-item>
                                <el-dropdown-item @click="changeLocale('en')">English</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
                <div v-if="downloading" class="process">
                    <span v-if="progress !== 100" :title="$t('更新进度')">{{ progress.toFixed(1) }}%</span>
                    <span v-else class="cursor-pointer yellow" @click="handleInstall">{{ $t('安装') }}</span>
                </div>
                <el-dropdown @command="handleClickDropdown">
                    <span class="d-flex a-center cursor-pointer">
                        <span>{{ userInfo.realName || userInfo.loginName }}</span>
                        <el-icon :size="16" class="ml-1">
                            <ArrowDown />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="user-setting">{{ $t('个人中心') }}</el-dropdown-item>
                            <el-dropdown-item v-if="config.isElectron" :disabled="downloading" command="update">{{ $t('检查更新') }}</el-dropdown-item>
                            <el-dropdown-item command="version">{{ $t('版本') }}{{ $store.state.permission.globalConfig.version }}</el-dropdown-item>
                            <el-dropdown-item command="clear-cache">{{ $t('清除所有缓存') }}</el-dropdown-item>
                            <el-dropdown-item command="logout">{{ $t('退出登录') }}</el-dropdown-item>
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
// eslint-disable-next-line import/no-extraneous-dependencies
import { IpcRenderer } from "electron"
import { defineComponent } from "vue";
import { useRouter } from "vue-router"
import { RefreshRight, Back, Right, ArrowDown } from "@element-plus/icons-vue"
import { PermissionMenu, PermissionUserInfo } from "@@/global"
import type { Language } from "@@/global"
import { changeLanguage } from "@/i18n/i18n"
import { useStore } from "@/store/index";
import config from "@/../config/config"

let ipcRenderer: IpcRenderer;
if (window.require) {
    // eslint-disable-next-line prefer-destructuring
    ipcRenderer = window.require("electron").ipcRenderer;
}

export default defineComponent({
    components: {
        RefreshRight,
        Back,
        Right,
        ArrowDown,
    },
    setup() {
        const router = useRouter();
        const store = useStore();
        //辅助操作按钮(electron不具备浏览器前进、后退、刷新)
        const goBack = () => router.back()
        const goForward = () => router.forward();
        const freshPage = () => window.location.reload();
        //个人中心
        const jumpToHome = () => router.push("/v1/apidoc/doc-list");
        const jumpToUserSetting = () => router.push("/v1/settings/user");
        const logout = () => {
            store.commit("permission/clearAllPermission");
            sessionStorage.clear();
            router.push("/login");
        };
        //国际化
        const changeLocale = (language: Language) => {
            changeLanguage(language);
        }
        return {
            goBack,
            goForward,
            freshPage,
            jumpToHome,
            jumpToUserSetting,
            logout,
            changeLocale,
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
        this.initUploadEvent();
        if (this.config.updateConfig.autoUpdate) {
            this.handleCheckUpdate();
        }
    },
    methods: {
        handleClickDropdown(command: string) {
            switch (command) {
            case "logout":
                this.logout();
                break;
            case "user-setting":
                this.jumpToUserSetting();
                break;
            case "update":
                this.handleCheckUpdate(true);
                break;
            case "clear-cache":
                this.clearAllCache();
                break;
            default:
                break;
            }
        },
        //初始化自动更新相关事件
        initUploadEvent() {
            if (config.isElectron) {
                //存在可用更新
                ipcRenderer.on("vue-update-available", () => {
                    console.log("存在可用更新");
                });
                //没有可用更新
                ipcRenderer.on("vue-update-not-available", () => {
                    console.log(`${this.$t("没有可用更新")}`);
                    this.downloading = false;
                    if (this.isManual) {
                        this.$message.warning(`${this.$t("暂无可用更新")}`);
                    }
                });
                //下载中
                ipcRenderer.on("vue-download-progress", (e, progressObj) => {
                    console.log(`${this.$t("下载中")}`, e, progressObj);
                    this.downloading = true;
                    this.progress = progressObj.percent;
                });
                //下载完成
                ipcRenderer.on("vue-update-downloaded", (e, upload) => {
                    this.progress = 100;
                    console.log(`${this.$t("下载完成")}`, e, upload);
                });
                ipcRenderer.on("vue-download-error", (e, error) => {
                    if (this.isManual) {
                        this.$message.warning(`${this.$t("更新异常请稍后再试")}`);
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
        handleCheckUpdate(isManual = false) {
            this.downloading = true;
            this.isManual = isManual;
            if (config.isElectron) {
                ipcRenderer.send("vue-check-update");
            }
        },
        //清空缓存
        clearAllCache() {
            this.$confirm("此操作将清空所有本地缓存, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                //移除serviceworker
                if ("serviceWorker" in navigator) {
                    navigator.serviceWorker.getRegistrations().then((registrations) => {
                        registrations.forEach(registration => {
                            console.log(registration.unregister())
                        })
                    })
                }
                //移除本地存储
                localStorage.clear();
                sessionStorage.clear();
                //清空indexedDB
                indexedDB.deleteDatabase(this.config.renderConfig.indexedDB.dbName)
                //刷新页面
                this.$router.replace("/login")
            }).catch((err: Error | "cancel" | "close") => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                console.error(err);
            });
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
        display: flex;
        .header-left {
            display: flex;
            align-items: center;
            flex: 1;
            height: 100%;
            .el-menu {
                flex: 1;
            }
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
                .language {
                    width: size(30);
                    height: size(30);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    font-size: size(16);
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
