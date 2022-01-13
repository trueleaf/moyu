/*
    创建者：shuxiaokai
    创建时间：2021-06-28 21:04
    模块名称：编辑菜单
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" :title="$t('编辑菜单')" @close="handleClose">
        <s-form ref="form" show-tips :edit-data="data">
            <s-form-item :label="$t('菜单名称')" prop="name" one-line required></s-form-item>
            <s-form-item :label="$t('路径')" prop="path" one-line required></s-form-item>
        </s-form>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="handleEditMenu">{{ $t('确定') }}</el-button>
            <el-button type="warning" @click="handleClose">{{ $t('取消') }}</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import type { PermissionClientMenu } from "@@/global"

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        pid: {
            type: String,
            default: "",
        },
        data: {
            type: Object as PropType<PermissionClientMenu | null>,
            default: () => null,
        },
    },
    emits: ["update:modelValue", "success"],
    data() {
        return {
            //=========================================================================//
            //=========================================================================//
            loading: false,
        };
    },
    methods: {
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
        //编辑菜单
        handleEditMenu() {
            const formData = this.$refs.form.formInfo;
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    const params = {
                        name: formData.name,
                        path: formData.path,
                        _id: formData._id,
                    };
                    this.axios.put("/api/security/client_menu", params).then(() => {
                        this.handleClose();
                        this.$emit("success");
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
    },
})
</script>

<style lang="scss">
</style>
