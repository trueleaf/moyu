/*
    创建者：shuxiaokai
    创建时间：2020-09-21 22:16
    模块名称：账号密码登录
    备注：xxxx
*/
<template>
    <el-form ref="form" class="login-account" :model="userInfo" :rules="rules" @submit.stop.prevent="handleLogin">
        <el-form-item prop="loginName">
            <el-input v-model="userInfo.loginName" :prefix-icon="User" name="loginName" type="text" :placeholder="`${$t('请输入用户名')}...`"></el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input v-model="userInfo.password" :prefix-icon="Lock" name="password" type="password" :placeholder="`${$t('请输入密码')}...`"></el-input>
        </el-form-item>
        <el-form-item v-if="isShowCapture" prop="captcha">
            <div class="captcha">
                <el-input v-model="userInfo.captcha" :size="config.renderConfig.layout.size" name="captcha" type="text" :placeholder="$t('验证码')"></el-input>
                <img :src="captchaUrl" @click="freshCapchaUrl" />
            </div>
        </el-form-item>
        <el-form-item v-if="config.localization.enableGuest" class="mb-1">
            <el-button :loading="loading" class="w-100" type="primary" @click="handleGuesttLogin">{{ $t("直接登录(体验账号，数据不会被保存)") }}</el-button>
        </el-form-item>
        <el-form-item class="mb-1">
            <el-button :loading="loading" :type="config.localization.enableGuest ? '' : 'primary'" native-type="submit" class="w-100">{{ $t("登录") }}</el-button>
        </el-form-item>
        <el-form-item v-if="config.localization.enableRegister" class="mb-1">
            <el-button class="w-100" @click="handleJumpToRegister">{{ $t("注册账号") }}</el-button>
        </el-form-item>
        <div class="forget-pwd-wrap">
            <el-button text link type="primary" @click="handleJumpToResetPassword">{{ $t("已有账号，忘记密码?") }}</el-button>
        </div>
        <div v-if="config.localization.enableDocLink" class="mt-2 d-flex j-around">
            <a href="https://github.com/trueleaf/moyu" target="_blank" class="d-flex flex-column j-center a-center">
                <svg class="svg-icon" aria-hidden="true" :title="$t('跳转github')">
                    <use xlink:href="#icongithub"></use>
                </svg>
                <div class="mt-1">GitHub</div>
            </a>
            <a href="https://gitee.com/shuzhikai/moyu" target="_blank" class="d-flex flex-column j-center a-center">
                <svg class="svg-icon" aria-hidden="true" :title="$t('跳转码云')">
                    <use xlink:href="#icongitee"></use>
                </svg>
                <div class="mt-1">码云</div>
            </a>
            <a href="https://www.yuque.com/happymoyu/as0gig" target="_blank" class="d-flex flex-column j-center a-center">
                <svg class="svg-icon" aria-hidden="true" :title="$t('跳转文档')">
                    <use xlink:href="#iconyuque"></use>
                </svg>
                <div class="mt-1">{{ $t("完整文档") }}</div>
            </a>
            <!-- <a href="https://www.yuque.com/happymoyu/as0gig/vapwmq" target="_blank" class="d-flex flex-column j-center a-center">
                <svg class="svg-icon" aria-hidden="true" :title="$t('跳转部署文档')">
                    <use xlink:href="#iconbushu"></use>
                </svg>
                <div class="mt-1">{{ $t("部署文档") }}</div>
            </a> -->
            <a :href="config.localization.download.url" target="__blank" class="d-flex flex-column j-center a-center cursor-pointer hover-theme-color">
                <svg class="svg-icon" aria-hidden="true" :title="$t('客户端下载')">
                    <use xlink:href="#iconkehuduan"></use>
                </svg>
                <div class="mt-1">{{ $t("客户端下载") }}</div>
            </a>
        </div>
    </el-form>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { PermissionUserInfo, Response } from "@@/global"
import config from "@/../config/config"
import { User, Lock } from "@element-plus/icons-vue"

export default defineComponent({
    emits: ["jumpToRegister", "jumpToResetPassword"],
    setup() {
        return {
            User,
            Lock
        }
    },
    data() {
        return {
            //=====================================用户信息====================================//
            userInfo: {
                loginName: process.env.NODE_ENV === "development" ? "moyu" : "", //-----------登录名称
                password: process.env.NODE_ENV === "development" ? "111111aaa" : "", //---------密码
                captcha: "", //----------------验证码
            },
            //=====================================表单验证规则====================================//
            rules: {
                loginName: [{ required: true, message: `${this.$t("请输入用户名")}`, trigger: "blur" }],
                password: [{ required: true, message: `${this.$t("请输入密码")}`, trigger: "blur" }],
                captcha: [{ required: true, message: `${this.$t("请输入验证码")}`, trigger: "blur" }],
            },
            //=====================================其他参数====================================//
            config, //-----------------------配置信息
            random: Math.random(), //--------验证码随机参数
            isShowCapture: false, //---------是否展示验证码
            loading: false, //---------------登录按钮loading
        };
    },
    computed: {
        captchaUrl(): string {
            const requestUrl = config.renderConfig.httpRequest.url;
            return `${requestUrl}/api/security/captcha?width=120&height=40&random=${this.random}`;
        },
    },
    methods: {
        //用户名密码登录
        handleLogin() {
            this.$refs.form.validate((valid: boolean) => {
                if (valid) {
                    this.loading = true;
                    this.axios.post<Response<PermissionUserInfo>, Response<PermissionUserInfo>>("/api/security/login_password", this.userInfo).then((res) => {
                        if (res.code === 2006 || res.code === 2003) {
                            this.$message.warning(res.msg);
                            this.isShowCapture = true;
                        } else {
                            this.$router.push("/v1/apidoc/doc-list");
                            localStorage.setItem("userInfo", JSON.stringify(res.data));
                            this.$store.dispatch("permission/getPermission")
                        }
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => {
                        const input = document.querySelector(".el-form-item.is-error input");
                        if (input) {
                            (input as HTMLElement).focus();
                        }
                    });
                }
            });
        },
        //刷新验证码
        freshCapchaUrl() {
            this.random = Math.random();
        },
        //用户注册
        handleJumpToRegister() {
            this.$emit("jumpToRegister");
        },
        //重置密码
        handleJumpToResetPassword() {
            this.$emit("jumpToResetPassword");
        },
        //体验账号登录
        handleGuesttLogin() {
            this.loading = true;
            this.axios.post("/api/security/login_guest", this.userInfo).then((res) => {
                this.$router.push("/v1/apidoc/doc-list");
                localStorage.setItem("userInfo", JSON.stringify(res.data));
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
    },
})
</script>

<style lang="scss">
.login-account {
    .svg-icon {
        width: size(35);
        height: size(35);
        cursor: pointer;
    }
    .forget-pwd-wrap {
        // margin-top: size(-20);
        display: flex;
        justify-content: center;
        margin-bottom: size(10);
        .el-button {
            margin: 0;
            padding: 0;
            min-height: size(20);
        }
    }
}
</style>
