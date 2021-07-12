/*
    创建者：shuxiaokai
    创建时间：2021-06-28 21:04
    模块名称：新增服务端路由
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" title="新增服务端路由" @close="handleClose">
        <s-form ref="form" :edit-data="formInfo">
            <s-form-item label="名称" prop="name" required one-line></s-form-item>
            <s-form-item label="请求方法" prop="method" required one-line></s-form-item>
            <s-form-item label="路径" prop="path" required one-line></s-form-item>
            <s-form-item label="分组名称" prop="groupName" required one-line></s-form-item>
        </s-form>
        <template #footer>
            <el-button :loading="loading" size="mini" type="primary" @click="handleSaveServerRoute">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
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
    },
    emits: ["update:modelValue", "success"],
    data() {
        return {
            formInfo: {
                name: "", //------------路由名称
                path: "", //------------路由地址
                method: "", //----------请求方法
                groupName: "", //-------路由分组名称
            },
            //=========================================================================//
            //=========================================================================//
            loading: false,
        };
    },
    methods: {
        handleSaveServerRoute() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const { formInfo } = this.$refs.form;
                    const params = {
                        ...formInfo,
                    };
                    this.loading = true;
                    this.axios.post("/api/security/server_routes", params).then(() => {
                        this.$emit("success");
                        this.handleClose();
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => {
                        const input = document.querySelector(".el-form-item.is-error input");
                        if (input) {
                            (input as HTMLInputElement).focus();
                        }
                    });
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

<style lang="scss">
</style>
