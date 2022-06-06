/*
    创建者：shuxiaokai
    创建时间：2021-08-02 21:25
    模块名称：新增一个文档
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" width="40%" :title="$t('新建接口')" @close="handleClose">
        <s-form ref="form" @submit.prevent="handleAddFile">
            <s-form-item :label="$t('文档名称')" prop="name" focus one-line></s-form-item>
        </s-form>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="handleAddFile">{{ $t("确定") }}</el-button>
            <el-button type="warning" @click="handleClose">{{ $t("取消") }}</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { Response, ApidocBanner } from "@@/global"

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        /**
         * 父元素id，没有则代表在根元素上新增节点
         */
        pid: {
            type: String,
            default: "",
        },
    },
    emits: ["update:modelValue", "success"],
    data() {
        return {
            loading: false,
        };
    },
    methods: {
        handleAddFile() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    const { formInfo } = this.$refs.form;
                    const params = {
                        name: formInfo.name,
                        type: "api",
                        projectId: this.$route.query.id,
                        pid: this.pid,
                    };
                    this.axios.post<Response<ApidocBanner>, Response<ApidocBanner>>("/api/project/new_doc", params).then((res) => {
                        this.$emit("success", res.data); //一定要先成功然后才关闭弹窗,因为关闭弹窗会清除节点父元素id
                        this.handleClose();
                    }).catch((err) => {
                        console.error(err)
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$message.warning(this.$t("请完善必填信息"));
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
