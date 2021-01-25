/*
    创建者：shuxiaokai
    创建时间：2020-09-21 10:16
    模块名称：账号密码登录
    备注：xxxx
*/
<template>
    <el-form ref="form" class="login-account" :model="userInfo" :rules="rules" @submit.native.stop.prevent="handleLogin">
        <el-form-item prop="loginName">
            <el-input v-model="userInfo.loginName" prefix-icon="el-icon-user" name="loginName" type="text" placeholder="请输入用户名..."></el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input v-model="userInfo.password" prefix-icon="el-icon-lock" name="password" type="password" placeholder="请输入密码..."></el-input>
        </el-form-item>
        <el-form-item v-if="isShowCapture" prop="captcha">
            <div class="captcha">
                <el-input v-model="userInfo.captcha" name="captcha" type="text" placeholder="验证码"></el-input>
                <img :src="captchaUrl" @click="freshCapchaUrl" />
            </div>
        </el-form-item>
        <el-form-item class="mb-1">
            <div>
                <el-button :loading="loading" type="primary" native-type="submit" size="small" class="w-100">登录</el-button>
            </div>
        </el-form-item>
        <el-form-item class="mb-1">
            <div>
                <el-button :loading="loading"  size="small" class="w-100" @click="handleGuesttLogin">直接登录(体验账号，数据不会被保存)</el-button>
            </div>
        </el-form-item>
        <el-form-item>
            <div>
                <el-button size="small" class="w-100" @click="handleJumpToRegister">注册账号</el-button>
            </div>
        </el-form-item>
        <div class="d-flex j-around">
            <a href="https://github.com/trueleaf/moyu" target="_blank" class="d-flex flex-column j-center a-center">
                <svg class="svg-icon" aria-hidden="true" title="跳转github">
                    <use xlink:href="#icongithub"></use>
                </svg>
                <div>GitHub</div>
            </a>

            <a href="https://gitee.com/shuzhikai/moyu" target="_blank"  class="d-flex flex-column j-center a-center">
                <svg class="svg-icon" aria-hidden="true" title="跳转码云">
                    <use xlink:href="#icongitee"></use>
                </svg>
                <div>码云</div>
            </a>
        </div>
    </el-form>
</template>

<script>
export default {
    data() {
        return {
            //账号密码登录
            userInfo: {
                loginName: process.env.NODE_ENV === "development" ? "shu" : "", //-----------登录名称
                password: process.env.NODE_ENV === "development" ? "111111" : "", //---------密码
                captcha: "", //----------------验证码
            },
            rules: {
                loginName: [{ required: true, message: "请输入用户名", trigger: "blur" }],
                password: [{ required: true, message: "请输入密码", trigger: "blur" }],
                captcha: [{ required: true, message: "请输入验证码", trigger: "blur" }],
            },
            random: Math.random(), //----------验证码随机参数
            isShowCapture: false, //---------是否展示验证码
            loading: false, //---------------登录按钮loading
        };
    },
    computed: {
        captchaUrl() {
            const { isProcess } = this.$root.VUE_BASE_CONFIG;
            const requestUrl = isProcess ? this.$root.VUE_BASE_CONFIG.devUrl : this.$root.VUE_BASE_CONFIG.proUrl;
            return `${requestUrl}/api/security/captcha?width=120&height=40&random=${this.random}`;
        },
        version() {
            return this.$store.state.config.version;
        },
    },
    created() {},
    methods: {
        //用户名密码登录
        handleLogin() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.axios.post("/api/security/login_password", this.userInfo).then((res) => {
                        if (res.code === 2006 || res.code === 2003) {
                            this.$message.warning(res.msg);
                            this.isShowCapture = true;
                        } else {
                            this.$router.push("/v1/apidoc/doc-list");
                            sessionStorage.setItem("userInfo", JSON.stringify(res.data));
                        }
                    }).catch((err) => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => {
                        const input = document.querySelector(".el-form-item.is-error input");
                        if (input) {
                            input.focus();
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
        //体验账号登录
        handleGuesttLogin() {
            this.loading = true;
            this.axios.post("/api/security/login_guest", this.userInfo).then((res) => {
                this.$router.push("/v1/apidoc/doc-list");
                sessionStorage.setItem("userInfo", JSON.stringify(res.data));
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
    },
};
</script>

<style lang="scss">
.login-account {
    .svg-icon {
        width: size(35);
        height: size(35);
        cursor: pointer;
    }
}
</style>
