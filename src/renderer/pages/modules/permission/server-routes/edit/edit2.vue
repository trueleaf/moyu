/*
    创建者：shuxiaokai
    创建时间：2021-06-28 21:04
    模块名称：批量修改服务端路由类型
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" title="批量修改服务端路由类型" @close="handleClose">
        <s-form ref="form">
            <s-form-item label="分组名称" prop="groupName" required one-line></s-form-item>
        </s-form>
        <template #footer>
            <el-button :loading="loading" size="mini" type="primary" @click="handleSaveServerRoute">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { ServerRoute } from "@@/global"

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        editData: {
            type: Object as PropType<ServerRoute[]>,
            default: () => {
                return {}
            }
        },
    },
    emits: ["update:modelValue", "success"],
    data() {
        return {
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
                        ids: this.editData.map((v) => v._id),
                        groupName: formInfo.groupName,
                    };
                    this.loading = true;
                    this.axios.put("/api/security/server_routes_type", params).then(() => {
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
