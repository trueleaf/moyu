/*
    创建者：shuxiaokai
    创建时间：2021-07-13 22:20
    模块名称：修改项目
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" :title="$t('修改项目')" @close="handleClose">
        <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px">
            <el-form-item :label="`${$t('项目名称')}`" prop="projectName">
                <el-input v-model="formInfo.projectName" v-focus-select :size="config.renderConfig.layout.size" :placeholder="$t('请输入项目名称')" @keydown.enter="handleEditProject"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="handleEditProject">{{ $t("确定") }}</el-button>
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
        /**
         * 项目id
         */
        projectId: {
            type: String,
            default: "",
        },
        /**
         * 项目名称
         */
        projectName: {
            type: String,
            default: "",
        },
    },
    emits: ["update:modelValue", "success"],
    data() {
        return {
            //=====================================新建项目====================================//
            formInfo: {
                projectName: "", //-------------------------项目名称
            },
            rules: { //-------------------------------------修改项目校验规则
                projectName: [{ required: true, trigger: "blur", message: this.$t("请填写项目名称") }],
            },
            //=====================================其他参数====================================//
            loading: false, //------------------------------成员数据加载状态
        };
    },
    watch: {
        projectName: {
            handler(val) {
                this.formInfo.projectName = val;
            },
            immediate: true,
        },
    },
    methods: {
        //修改项目
        handleEditProject() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    const params = {
                        projectName: this.formInfo.projectName,
                        _id: this.projectId,
                    };
                    this.axios.put("/api/project/edit_project", params).then((res) => {
                        this.handleClose();
                        this.$emit("success", {
                            id: res.data,
                            name: this.formInfo.projectName,
                        });
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => {
                        const input: HTMLInputElement = document.querySelector(".el-form-item.is-error input") as HTMLInputElement;
                        if (input) {
                            input.focus();
                        }
                    });
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
