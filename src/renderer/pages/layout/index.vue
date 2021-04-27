/*
    创建者：shuxiaokai
    创建时间：2019-09-06 11:31
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div class="s-content">
        <div class="s-header">
            <div class="ml-5 header-left fl d-flex a-center">
                <span class="f-lg mr-5 gray-200 cursor-pointer" @click="jumpToHome">{{ config.renderConfig.layout.title }}</span>
                <el-menu :default-active="activeMenu" mode="horizontal" background-color="#343a40" text-color="#fff" active-text-color="#ffd04b" :router="true">
                    <el-menu-item v-for="(item) in menus" :key="item.path" :index="item.path">
                        {{ item.name }}
                    </el-menu-item>
                </el-menu>
            </div>
            <div class="header-right mr-5 fr">
                <!-- <div v-copy="ip" v-copy2="`http://${ip}`" class="mr-2 cursor-pointer">{{ ip }}</div> -->
                <!-- <div class="mr-2 cursor-pointer" @click="getIp">ip</div> -->
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
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="jumpToUserSetting">个人中心</el-dropdown-item>
                        <el-dropdown-item v-if="!isWeb" :disabled="downloading" @click.native="handleCheckUpdate">检查更新</el-dropdown-item>
                        <el-dropdown-item>版本{{ config.updateConfig.version }}</el-dropdown-item>
                        <el-dropdown-item @click.native="logout">退出登陆</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <div class="page-wrap">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
let ipcRenderer = null;
if (window.require) {
    // eslint-disable-next-line prefer-destructuring
    ipcRenderer = window.require("electron").ipcRenderer;
}

export default {
    data() {
        return {
            activeMenu: "",
            progress: 0,
            downloading: false,
            isWeb: !window.require,
            ip: null,
        };
    },
    computed: {
        menus() {
            return this.$store.state.permission.menus;
        },
        userInfo() {
            return this.$store.state.permission.userInfo;
        },
    },
    watch: {
        $route(val) {
            this.activeMenu = val.path;
        },
    },
    mounted() {
        this.initCurrentMenu();
        this.initUploadEvent();
    },
    methods: {
        initUploadEvent() {
            if (window.require) {
                //存在可用更新
                ipcRenderer.on("vue-update-available", () => {
                    console.log("存在可用更新");
                });
                //没有可用更新
                ipcRenderer.on("vue-update-not-available", () => {
                    console.log("没有可用更新");
                    this.downloading = false;
                    this.$message.warning("暂无可用更新");
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
                    this.$message.warning("更新异常请稍后再试");
                    this.downloading = false;
                    console.error(error);
                });
            }
        },
        handleInstall() {
            if (window.require) {
                ipcRenderer.send("quit-and-install");
            }
        },
        handleCheckUpdate() {
            this.downloading = true;
            if (window.require) {
                // ipcRenderer.send("checkUpdate");
                ipcRenderer.send("vue-check-update");
            }
        },
        //=========================================================================//
        initCurrentMenu() {
            this.activeMenu = this.$route.path;
        },
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
        //=====================================页面操作====================================//
        //刷新页面
        freshContent() {
            if (window.require) {
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
    },
};
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
