/*
    创建者：shuxiaokai
    创建时间：2021-06-11 22:13
    模块名称：账号注册
    备注：
*/
<template>
    <el-form ref="form" :model="registerInfo" :rules="rules" @submit.stop.prevent="handleRegister">
        <el-form-item prop="loginName">
            <el-input v-model="registerInfo.loginName" :size="config.renderConfig.layout.size" name="loginName" type="text" :placeholder="`${$t('请输入登录名称')}...`"></el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input v-model="registerInfo.password" :size="config.renderConfig.layout.size" show-password name="password" type="text" :placeholder="`${$t('请输入密码')}...`"></el-input>
        </el-form-item>
        <el-form-item prop="password2">
            <el-input v-model="registerInfo.password2" :size="config.renderConfig.layout.size" show-password name="password2" type="text" :placeholder="`${$t('请再次输入密码')}...`"></el-input>
        </el-form-item>
        <el-form-item prop="phone">
            <el-input v-model="registerInfo.phone" :size="config.renderConfig.layout.size" name="phone" type="text" :placeholder="`${$t('请输入手机号')}...`"></el-input>
        </el-form-item>
        <el-form-item prop="smsCode">
            <div class="d-flex w-100">
                <el-input v-model="registerInfo.smsCode" :size="config.renderConfig.layout.size" name="smsCode" type="text" :placeholder="$t('请输入验证码')"></el-input>
                <s-sms-button :hook="smsCodeHook" @click="getSmsCode"></s-sms-button>
            </div>
        </el-form-item>
        <el-form-item>
            <el-button :loading="loading" type="primary" native-type="submit" class="w-100">{{ $t("注册并登录") }}</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import type { InternalRuleItem } from "async-validator/dist-types/interface"

export default defineComponent({
    data() {
        return {
            //=====================================基础信息====================================//
            registerInfo: {
                loginName: "", //---登录名称
                smsCode: "", //-----验证码
                password: "", //----密码
                password2: "", //---确认密码
                phone: "", //-------手机号码
            },
            //=====================================校验规则====================================//
            rules: {
                loginName: [{ required: true, message: this.$t("请输入登录名称"), trigger: "blur" }],
                password: [
                    { required: true, message: this.$t("请输入密码"), trigger: "blur" },
                    { validator: this.validatePassword, trigger: "blur" },
                ],
                password2: [
                    { required: true, message: this.$t("请再次输入密码"), trigger: "blur" },
                    { validator: this.validatePassword2, trigger: "blur" },
                ],
                phone: [{ required: true, message: this.$t("请输入手机号"), trigger: "blur" }],
                smsCode: [{ required: true, message: this.$t("请输入验证码"), trigger: "blur" }],
            },
            //=====================================其他参数====================================//
            loading: false,
        };
    },
    methods: {
        validatePassword(rule: InternalRuleItem, value: string, callback: (err?: Error | string) => void) {
            const matchString = /[a-zA-Z]/;
            const matchNumber = /\d/;
            const inValidKey = /[^\w\d!@#]/;
            if (value.trim() === "") {
                callback(new Error(this.$t("请输入密码")));
            } else if (value.match(inValidKey)) {
                callback(new Error(this.$t("只允许 数字  字符串 ! @ # 不允许其他字符串")));
            } else if (!value.match(matchString) || !value.match(matchNumber) || value.length < 8) {
                callback(new Error(this.$t("数字+字符串，并且大于8位")));
            } else {
                if (this.registerInfo.password2 !== "") {
                    this.$refs.form.validateField("password2");
                }
                callback();
            }
        },
        validatePassword2(rule: InternalRuleItem, value: string, callback: (err?: Error | string) => void) {
            const matchString = /[a-zA-Z]/;
            const matchNumber = /\d/;
            const inValidKey = /[^\w\d!@#]/;
            if (value === "") {
                callback(new Error(this.$t("请再次输入密码")));
            } else if (value.match(inValidKey)) {
                callback(new Error(this.$t("只允许 数字  字符串 ! @ # 不允许其他字符串")));
            } else if (!value.match(matchString) || !value.match(matchNumber) || value.length < 8) {
                callback(new Error(this.$t("数字+字符串，并且大于8位")));
            } else if (value !== this.registerInfo.password) {
                callback(new Error(this.$t("两次输入密码不一致!")));
            } else {
                callback();
            }
        },
        //校验手机号码
        smsCodeHook() {
            if (this.registerInfo.phone.length !== 11) {
                this.$message.warning(this.$t("请填写正确手机号"));
                return false;
            }
            return true;
        },
        //获取短信验证码
        getSmsCode() {
            const params = {
                phone: this.registerInfo.phone,
            };
            this.axios.get("/api/security/sms", { params }).catch((err) => {
                console.error(err);
            });
        },
        //用户注册
        handleRegister() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const userInfo = {
                        loginName: this.registerInfo.loginName,
                        password: this.registerInfo.password,
                    };
                    this.axios.post("/api/security/register", this.registerInfo).then(() => {
                        this.axios.post("/api/security/login_password", userInfo).then((res) => {
                            this.$router.push("/v1/apidoc/doc-list");
                            sessionStorage.setItem("userInfo", JSON.stringify(res.data));
                        }).catch((err) => {
                            console.error(err);
                        }).finally(() => {
                            this.loading = false;
                        });
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
                    this.$message.warning(this.$t("请完善必填信息"));
                    this.loading = false;
                }
            });
        },
    },
})
</script>

<style lang="scss">

</style>
