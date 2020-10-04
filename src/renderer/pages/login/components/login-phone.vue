/*
    创建者：shuxiaokai
    创建时间：2020-09-21 10:25
    模块名称：手机号登录
    备注：xxxx
*/
<template>
    <el-form ref="form" :model="userInfo" :rules="rules" @submit.native.stop.prevent="handleLogin">
        <el-form-item prop="phone">
            <el-input v-model="userInfo.phone" prefix-icon="el-icon-user" name="phone" type="text" placeholder="请输入手机号..."></el-input>
        </el-form-item>
        <el-form-item prop="smsCode">
            <div class="d-flex">
                <el-input v-model="userInfo.smsCode" name="smsCode" type="text" placeholder="验证码"></el-input>
                <s-sms-button :hook="smsCodeHook" @click="getSmsCode"></s-sms-button>
            </div>
        </el-form-item>
        <el-form-item>
            <el-button :loading="loading" type="primary" native-type="submit" size="small" class="w-100">登录</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
export default {
    data() {
        return {
            //手机号密码登录
            userInfo: {
                phone: "", //------------------手机号码
                smsCode: "", //----------------短信验证码
            },
            rules: {
                phone: [{ required: true, message: "请输入手机号", trigger: "blur" }],
                smsCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
            },
            //=====================================其他参数====================================//
            loading: false
        };
    },
    created() {},
    methods: {
        //校验手机号码
        smsCodeHook() {
            if (this.userInfo.phone.length !== 11) {
                this.$message.warning("请填写正确手机号");
                return false;
            } else {
                return true;
            }
        },
        //获取短信验证码
        getSmsCode() {
            const params = {
                phone: this.userInfo.phone
            };
            this.axios.get("/api/security/sms", { params }).then(() => {
                
            }).catch(err => {
                this.$errorThrow(err, this);
            });                
        },
        //手机号登录
        handleLogin() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.axios.post("/api/security/login_phone", this.userInfo).then((res) => {
                        if (res.code === 2006 || res.code === 2003) {
                            this.$message.warning(res.msg);
                            this.isShowCapture = true;
                        } else {
                            this.$router.push("/v1/apidoc/doc-list");
                            sessionStorage.setItem("userInfo", JSON.stringify(res.data));
                        }
                    }).catch(err => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => {
                        document.querySelector(".el-form-item.is-error input") ? document.querySelector(".el-form-item.is-error input").focus() : null;
                    });
                }
            });
        },
    },
};
</script>



<style lang="scss">
</style>
