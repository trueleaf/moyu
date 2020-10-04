/*
    创建者：shuxiaokai
    创建时间：2020-06-02 13:32
    模块名称：修改用户基本信息
    备注：xxxx
*/
<template>
    <s-dialog class="g-user" title="修改用户基本信息" :isShow="isShow" @close="handleClose">
        <el-divider content-position="left">基础信息</el-divider>
        <s-form v-loading="loading2" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" ref="form" :editData="formInfo">
            <s-form-item label="登录名称" vModel="loginName" required halfLine></s-form-item>
            <s-form-item label="真实姓名" vModel="realName" halfLine disabled></s-form-item>
            <s-form-item label="手机号" vModel="phone" required halfLine phone></s-form-item>
            <s-form-item label="部门" vModel="department" required halfLine></s-form-item>
            <s-form-item label="职位" vModel="title" required halfLine></s-form-item>
            <s-form-item label="qq号" vModel="qq" required halfLine></s-form-item>
        </s-form>  
        <el-divider content-position="left">角色选择</el-divider>
        <el-checkbox-group v-model="formInfo.roleIds">
            <el-checkbox v-for="(item, index) in roleEnum" :key="index" :label="item._id">{{ item.roleName }}</el-checkbox>
        </el-checkbox-group>
        <div slot="footer">
            <el-button :loading="loading" size="mini" type="primary" @click="handleEidtUser">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        isShow: {
            type: Boolean,
            default: false
        },
        id: {
            type: String,
            default: ""
        },
       
    },
    data() {
        return {
            formInfo: {
                _id: this.id,
                roleIds: [],
                roleNames: [],
            },
            roleEnum: [], //角色枚举信息
            //=====================================其他参数====================================//
            loading: false, //新增角色按钮
            loading2: false, //获取用户信息
        };
    },
    created() {
        this.getUserInfo();
        this.getRoleEnum();
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取用户基本信息
        getUserInfo() {
            this.loading2 = true;
            this.axios.get("/api/security/user_info_by_id", { params: { _id: this.id }}).then(res => {
                this.formInfo = res.data;
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading2 = false;
            });
        },
        //获取角色枚举
        getRoleEnum() {
            this.axios.get("/api/security/role_enum").then(res => {
                this.roleEnum = res.data;
            }).catch(err => {
                this.$errorThrow(err, this);
            });
        },
        //=====================================前后端交互====================================//
        //修改用户权限
        handleEidtUser() {
            this.$refs["form"].validate((valid, invalidData) => {
                if (valid) {
                    this.formInfo.roleNames = this.formInfo.roleIds.map(val => {
                        const user = this.roleEnum.find(role => role._id === val)
                        return user ? user.roleName : "";
                    })
                    this.loading = true;
                    this.axios.put("/api/security/user_permission", this.formInfo).then(() => {
                        this.$emit("success");
                        this.handleClose();
                    }).catch(err => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading = false;
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
        handleClose() {
            this.$emit("update:isShow", false);
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
