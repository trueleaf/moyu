/*
    创建者：shuxiaokai
    创建时间：2021-06-11 22:43
    模块名称：使用手机号登录
    备注：
*/
<template>
    <el-form ref="form" :model="userInfo" :rules="rules" @submit.stop.prevent="handleLogin">
        <el-form-item prop="phone">
            <el-input v-model="userInfo.phone" :prefix-icon="iconUser" name="phone" type="text" :placeholder="`${$t('请输入手机号')}...`"></el-input>
        </el-form-item>
        <el-form-item prop="smsCode">
            <div class="d-flex w-100">
                <el-input v-model="userInfo.smsCode" :size="config.renderConfig.layout.size" name="smsCode" type="text" :placeholder="$t('验证码')"></el-input>
                <s-sms-button :hook="smsCodeHook" @click="getSmsCode"></s-sms-button>
            </div>
        </el-form-item>
        <el-form-item>
            <el-button :loading="loading" type="primary" native-type="submit" class="w-100">{{ $t("登录") }}</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { PermissionUserInfo, Response } from "@@/global";
import { User } from "@element-plus/icons-vue"

export default defineComponent({
    data() {
        return {
            //=====================================用户信息====================================//
            userInfo: {
                phone: "", //------------------手机号码
                smsCode: "", //----------------短信验证码
            },
            //=====================================表单验证====================================//
            rules: {
                phone: [{ required: true, message: `${this.$t("请输入手机号")}`, trigger: "blur" }],
                smsCode: [{ required: true, message: `${this.$t("请输入验证码")}`, trigger: "blur" }],
            },
            //=====================================其他参数====================================//
            iconUser: User,
            loading: false,
        };
    },
    methods: {
        //校验手机号码
        smsCodeHook(): boolean {
            if (this.userInfo.phone.length !== 11) {
                this.$message.warning(this.$t("请填写正确手机号"));
                return false;
            }
            return true;
        },
        //获取短信验证码
        getSmsCode() {
            const params = {
                phone: this.userInfo.phone,
            };
            this.axios.get("/api/security/sms", { params }).catch((err) => {
                console.error(err)
            });
        },
        //手机号登录
        handleLogin() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.axios.post<Response<PermissionUserInfo>, Response<PermissionUserInfo>>("/api/security/login_phone", this.userInfo).then((res) => {
                        if (res.code === 2006 || res.code === 2003) {
                            this.$message.warning(res.msg);
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
    },
})
</script>

<style lang="scss">

</style>
