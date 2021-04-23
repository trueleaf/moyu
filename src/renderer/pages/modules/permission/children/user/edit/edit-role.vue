/*
    创建者：shuxiaokai
    创建时间：2020-06-02 13:32
    给用户添加角色
    备注：xxxx
*/
<template>
    <s-dialog class="g-user" title="给用户添加角色" :is-show="isShow" @close="handleClose">
        <s-form ref="form" :form-info="formInfo">
            <!-- eslint-disable-next-line vue/attribute-hyphenation -->
            <s-form-item label="输入框" vModel="a"></s-form-item>
        </s-form>
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
            default: false,
        },
        id: {
            type: String,
            default: "",
        },
        roleIds: {
            type: Array,
            default() {
                return [];
            },
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
            loading: false, //新增角色按钮
        };
    },
    watch: {
        roleIds: {
            handler() {
                this.formInfo.roleIds = this.roleIds;
            },
            immediate: true,
            deep: true,
        },
    },
    created() {
        this.getRoleEnum();
    },
    methods: {
        //=====================================获取远程数据==================================//
        getRoleEnum() {
            this.axios.get("/api/security/role_enum").then((res) => {
                this.roleEnum = res.data;
            }).catch((err) => {
                this.$errorThrow(err, this);
            });
        },
        //=====================================前后端交互====================================//
        //修改用户权限
        handleEidtUser() {
            this.formInfo.roleNames = this.formInfo.roleIds.map((val) => {
                const user = this.roleEnum.find((role) => role._id === val);
                return user ? user.roleName : "";
            });
            this.loading = true;
            this.axios.put("/api/security/user_permission", this.formInfo).then(() => {
                this.$emit("success");
                this.handleClose();
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================组件间交互====================================//
        handleClose() {
            this.$emit("update:isShow", false);
        },
    },
};
</script>

<style lang="scss">

</style>
