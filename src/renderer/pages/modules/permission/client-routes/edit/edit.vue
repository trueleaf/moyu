/*
    创建者：shuxiaokai
    创建时间：2021-06-28 21:04
    模块名称：修改前端路由
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" :title="$t('修改前端路由')" @close="handleClose">
        <s-form ref="form" :edit-data="formInfo">
            <s-form-item :label="$t('名称')" prop="name" required one-line></s-form-item>
            <s-form-item :label="$t('路径')" prop="path" required one-line></s-form-item>
            <s-form-item :label="$t('分组名称')" prop="groupName" required one-line></s-form-item>
        </s-form>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="handleSaveClientRoute">{{ $t("确定") }}</el-button>
            <el-button type="warning" @click="handleClose">{{ $t("取消") }}</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from "vue"
import { PermissionClientRoute } from "@@/global"

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        editData: {
            type: Object as PropType<PermissionClientRoute>,
            default: () => ({})
        },
    },
    emits: ["update:modelValue", "success"],
    setup(props) {
        const formInfo = ref({});
        watch(props.editData, (val) => {
            formInfo.value = val;
        }, {
            immediate: true
        })
        return {
            formInfo
        };
    },
    data() {
        return {
            //=========================================================================//
            loading: false,
        };
    },
    methods: {
        handleSaveClientRoute() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const { formInfo } = this.$refs.form;
                    const params = {
                        ...formInfo,
                    };
                    this.loading = true;
                    this.axios.put("/api/security/client_routes", params).then(() => {
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
