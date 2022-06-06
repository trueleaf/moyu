/*
    创建者：shuxiaokai
    创建时间：2021-08-29 10:49
    模块名称：保存参数为模板
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" width="30%" :title="$t('保存参数为模板')" @close="handleClose">
        <s-form ref="form">
            <s-form-item label="模板名称" prop="name" one-line required></s-form-item>
        </s-form>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="handleSave">{{ $t("保存") }}</el-button>
            <el-button type="warning" @click="handleClose">{{ $t("取消") }}</el-button>
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
    emits: ["update:modelValue"],
    data() {
        return {
            loading: false
        };
    },
    methods: {
        //保存
        handleSave() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const { formInfo } = this.$refs.form;
                    const bodyParams = this.$store.state["apidoc/apidoc"].apidoc.item.requestBody.json
                    const params = {
                        name: formInfo.name,
                        presetParamsType: "bodyParams",
                        projectId: this.$route.query.id,
                        items: bodyParams,
                    };
                    this.loading = true;
                    this.axios.post("/api/project/doc_preset_params", params).then((res) => {
                        this.$store.commit("apidoc/baseInfo/addParamsTemplate", res.data);
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
                            (input as HTMLElement).focus();
                        }
                    });
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
