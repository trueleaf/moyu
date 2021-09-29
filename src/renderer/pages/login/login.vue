/*
    创建者：shuxiaokai
    创建时间：2021-06-10 21:39
    模块名称：登录模块
    备注：
*/
<template>
    <div class="login-container d-flex a-center j-center">
        <div class="login-box d-flex">
            <div ref="left" tabindex="-1" class="left hidden-md-and-down">
            </div>
            <div class="right">
                <h2 class="text-center">
                    <span>{{ config.localization.title }}</span>
                    <span v-if="config.localization.version">({{ config.localization.version }})</span>
                </h2>
                <el-tabs v-model="activeName" class="w-100">
                    <!-- 账号登录 -->
                    <el-tab-pane label="账号登录" name="loginAccount">
                        <s-login-account @jumpToRegister="handleJumpToRegister" @jumpToResetPassword="handleJumpToResetPassword"></s-login-account>
                    </el-tab-pane>
                    <!-- 手机号登录 -->
                    <el-tab-pane label="手机登录" name="loginPassword">
                        <s-login-phone></s-login-phone>
                    </el-tab-pane>
                    <!-- 注册 -->
                    <el-tab-pane v-if="config.localization.enableRegister" label="账号注册" name="register">
                        <s-register></s-register>
                    </el-tab-pane>
                    <!-- 忘记密码 -->
                    <el-tab-pane label="忘记密码" name="reset">
                        <s-reset-password @jumpToLogin="handleJumpToLogin"></s-reset-password>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import config from "@/../config/config"
import loginAccount from "./components/login-account.vue";
import loginPhone from "./components/login-phone.vue";
import register from "./components/register.vue";
import resetPassword from "./components/reset-password.vue";
import { defineComponent } from "vue"

export default defineComponent({
    components: {
        "s-login-account": loginAccount,
        "s-login-phone": loginPhone,
        "s-register": register,
        "s-reset-password": resetPassword,
    },
    data() {
        return {
            config,
            activeName: "loginAccount", //tabs切换
        };
    },
    methods: {
        //跳转注册页面
        handleJumpToRegister() {
            this.activeName = "register";
        },
        //跳转到重置密码
        handleJumpToResetPassword() {
            this.activeName = "reset";
        },
        //跳转到登录页面
        handleJumpToLogin() {
            this.activeName = "login";
        },
    },
})
</script>

<style lang="scss">
.login-container {
    width: 100vw;
    height: 100vh;
    background: $gray-200;
    .login-box {
        height: size(550);
        width: size(960);
        background: $white;
        box-shadow: $box-shadow-base;
        border-radius: $border-radius-base;
        .left {
            flex: 0 0 50%;
            .carousel {
                height: size(550);
            }
            .el-carousel__container {
                height: size(550);
            }
            .item-wrap {
                padding: size(20);
                ul {
                    font-size: fz(15);
                    li {
                        margin-bottom: size(10);
                    }
                }
            }
        }
        .right {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 0 size(40);
            height: 100%;
            &>h2 {
                margin-top: size(20);
            }
            .captcha {
                display: flex;
                &>img {
                    width: size(200);
                    height: size(40);
                }
            }
        }
    }
}
</style>
