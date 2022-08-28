/*
    创建者：shuxiaokai
    模块名称：重置密码
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" title="重置密码" @close="handleClose">
        <s-form ref="form" v-loading="loading2" show-tips :edit-data="formInfo">
            <s-form-item label="新密码" prop="password" required :min-length="6" one-line></s-form-item>
        </s-form>
        <template #footer>
            <div>
                <el-button :loading="loading" type="primary" @click="handleEditUser">{{ $t("确定") }}</el-button>
                <el-button type="warning" @click="handleClose">{{ $t("取消") }}</el-button>
            </div>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        /*
         * 用户id
        */
        userId: {
            type: String,
            default: ""
        },
    },
    emits: ["success", "update:modelValue"],
    data() {
        return {
            formInfo: {} as Record<string, unknown>, //用户基本信息
            loading: false, //-------------------------用户信息加载
            loading2: false, //------------------------修改用户加载
        };
    },
    methods: {
        //修改用户
        handleEditUser() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const { formInfo } = this.$refs.form;
                    const params = {
                        userId: this.$props.userId,
                        password: formInfo.password,
                    };
                    this.loading = true;
                    this.axios.put("/api/security/reset_password", params).then(() => {
                        this.$emit("success");
                        this.$message.success("重置成功")
                        this.handleClose();
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => (document.querySelector(".el-form-item.is-error input") as HTMLInputElement)?.focus());
                    this.$message.warning("请完善必填信息");
                    this.loading = false;
                }
            });
        },
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
    },
})
</script>
