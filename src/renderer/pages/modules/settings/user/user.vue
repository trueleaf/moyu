/*
    创建者：shuxiaokai
    创建时间：2020-08-30 19:12
    模块名称：用户设置
    备注：xxxx
*/
<template>
    <div class="user-setting">
        <div class="back f-base my-5 hover-theme-color cursor-pointer" @click="handleBack">
            <span class="el-icon-back"></span>
            <span>返回上级</span>
        </div>
        <s-card v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" shadow>
            <div class="base-info px-3">
                <div class="w-50 flex0">
                    <div class="d-flex a-center">
                        <h2>{{ userInfo.realName }}({{ userInfo.department }})</h2>
                        <el-button type="text" class="ml-3" @click="dialogVisible = true">修改密码</el-button>
                    </div>
                    <div class="px-3">
                        <s-label-value label="登录名称：" :value="userInfo.loginName" class="w-45"></s-label-value>
                        <s-label-value label="手机号码：" :value="userInfo.phone" class="w-45"></s-label-value>
                        <s-label-value label="所在部门：" :value="userInfo.department" class="w-45"></s-label-value>
                        <s-label-value label="所属职位：" :value="userInfo.title" class="w-45"></s-label-value>
                        <s-label-value label="qq号码：" :value="userInfo.qq" class="w-45"></s-label-value>
                        <s-label-value label="最后登录：" class="w-45">
                            <span class="orange">{{ new Date(userInfo.lastLogin).toLocaleString() }}</span>
                        </s-label-value>
                    </div>
                </div>
                <div class="flex1">
                    <div>所拥有项目</div>
                </div>
            </div>            
        </s-card>
        <s-dialog title="修改密码" :isShow.sync="dialogVisible">
            <el-form v-if="dialogVisible" ref="form" :model="formInfo" :rules="rules" label-width="150px">
                <el-form-item label="原始密码" prop="oldPassword">
                    <el-input v-model="formInfo.oldPassword" show-password size="mini" placeholder="请输入原始密码" class="w-100" maxlength="100"></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="formInfo.newPassword" show-password size="mini" placeholder="请输入新密码,至少6位，必须至少包含 数字 和 字母 " class="w-100" maxlength="100"></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="newPassword2">
                    <el-input v-model="formInfo.newPassword2" show-password size="mini" placeholder="请再次输入新密码" class="w-100" maxlength="100"></el-input>
                </el-form-item>
            </el-form>  
            <div slot="footer">
                <el-button :loading="loading2" size="mini" type="primary" @click="handleChangePassword">确定</el-button>
                <el-button size="mini" type="warning" @click="dialogVisible = false">取消</el-button>
            </div>
        </s-dialog>
    </div>
</template>

<script>
export default {
    data() {
        const matchString = /[a-zA-Z]/;
        const matchNumber = /\d/;
        const inValidKey = /[^\w\d!@#]/
        const validatePassword = (rule, value, callback) => {
            if (value.trim() === "") {
                callback(new Error("请输入密码"));
            } else if (value.match(inValidKey)) {
                callback(new Error("只允许 数字  字符串 ! @ # 不允许其他字符串"));
            } else if (!value.match(matchString) || !value.match(matchNumber) || value.length < 8) {
                callback(new Error("数字+字符串，并且大于8位"));
            } else {
                if (this.formInfo.newPassword2 !== "") {
                    this.$refs.form.validateField("newPassword2");
                }
                callback();
            }
        };
        const validatePassword2 = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("请再次输入密码"));
            } else if (value.match(inValidKey)) {
                callback(new Error("只允许 数字  字符串 ! @ # 不允许其他字符串"));
            } else if (!value.match(matchString) || !value.match(matchNumber) || value.length < 8) {
                callback(new Error("数字+字符串，并且大于8位"));
            } else if (value !== this.formInfo.newPassword) {
                callback(new Error("两次输入密码不一致!"));
            } else {
                callback();
            }
        };
        return {
            //=========================================================================//
            userInfo: {},
            //=====================================修改用户密码====================================//
            formInfo: {
                oldPassword: "", //------原始密码
                newPassword: "", //------新密码
                newPassword2: "", //-----重复新密码
            },
            rules: {
                oldPassword: [{ required: true, message: "请输入原始密码", trigger: "blur" }],
                newPassword: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                    { validator: validatePassword, trigger: "blur" },
                ],
                newPassword2: [
                    { required: true, message: "请再次输入密码", trigger: "blur" },
                    { validator: validatePassword2, trigger: "blur" }
                ],
            },
            //=========================================================================//
            dialogVisible: false, //-----修改用户密码
            loading: false, //-----------获取用户信息
            loading2: false, //----------确认修改密码
        };
    },
    created() {
        this.getUserBaseInfo();
    },
    methods: {
        //=====================================获取远程数据==================================//
        getUserBaseInfo() {
            this.loading = true;
            this.axios.get("/api/security/user_info").then(res => {
                this.userInfo = res.data;
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },

        //=====================================前后端交互====================================//
        handleChangePassword() {
            this.$refs["form"].validate((valid, invalidData) => {
                if (valid) {
                    this.loading2 = true;
                    this.axios.put("/api/security/user_password", this.formInfo).then(() => {
                        this.dialogVisible = false;
                        this.$message.success("修改成功");
                    }).catch(err => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading2 = false;
                        this.formInfo = {};
                    });
                } else {
                    this.$nextTick(() => {
                        document.querySelector(".el-form-item.is-error input") ? document.querySelector(".el-form-item.is-error input").focus() : null;
                    });
                    for (const invalid in invalidData) {
                        console.log(invalidData[invalid]);
                    }
                    this.$message.warning("请完善必填信息");
                    this.loading = false;
                }
            });
        },
        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//
        handleBack() {
            this.$router.go("-1");
        },
    }
};
</script>



<style lang="scss">
    .user-setting {
        max-width: size(1440);
        margin: auto;
        .base-info {
            display: flex;
        }
    }
</style>
