/*
    创建者：shuxiaokai
    创建时间：2019-09-06 11:31
    模块名称：登录注册
    备注：xxxx
*/
<template>
    <div class="login-container d-flex a-center j-center">
        <div class="login-box d-flex">
            <div class="left hidden-md-and-down"></div>
            <div class="right">
                <h2 class="text-center">欢迎登录</h2>
                <el-tabs v-model="activeName" class="w-100" @tab-click="handleClickTabs">
                    <!-- 账号登录 -->
                    <el-tab-pane label="账号登录" name="first">
                        <s-login-account @jumpToRegister="handleJumpToRegister"></s-login-account>
                    </el-tab-pane>
                    <!-- 手机号登录 -->
                    <el-tab-pane label="手机登录" name="second">
                        <s-login-phone></s-login-phone>
                    </el-tab-pane>
                    <!-- 注册 -->
                    <el-tab-pane label="账号注册" name="third">
                        <s-register></s-register>
                    </el-tab-pane>  
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script>
import loginAccount from "./components/login-account"
import loginPhone from "./components/login-phone"
import register from "./components/register"
export default {
    components: {
        "s-login-account": loginAccount,
        "s-login-phone": loginPhone,
        "s-register": register,
    },
    data() {
        return {
            //=====================================其他参数====================================//
            activeName: "first", //----------tabs切换
        };
    },
    methods: {
        //=====================================组件操作====================================//
        handleClickTabs() {},
        handleJumpToRegister() {
            this.activeName = "third"
        },
    }
};
</script>



<style lang="scss">
.login-container {
    width: 100vw;
    height: 100vh;
    background: $gray-200;
    .login-box {
        height: size(500);
        width: size(850);
        background: $white;
        box-shadow: $box-shadow-base;
        border-radius: $border-radius-base;
        .left {
            flex: 0 0 45%;
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
