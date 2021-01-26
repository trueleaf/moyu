/*
    创建者：shuxiaokai
    创建时间：2020-09-28 13:19"
    模块名称：保存当前请求参数为模板
    备注：xxxx
*/
<template>
    <s-dialog title="保存当前请求参数为模板" :isShow="visible" width="40%" @close="handleClose">
       <s-form ref="form" :formInfo="formInfo">
           <s-form-item label="模板名称" vModel="name" oneLine required></s-form-item>
       </s-form>
       <div slot="footer">
            <el-button :loading="loading" size="mini" type="primary" @click="handleSubmit">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: { //弹窗是否显示
            type: Boolean,
            default: false,
        },
        type: { //保存模板类型(请求模板，返回模板)
            validator(value) {
                return ["queryParams", "requestBody", "responseParams"].indexOf(value) !== -1;
            },
        },
        items: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            formInfo: {},
            loading: false,
        };
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        handleSubmit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const params = {
                        name: this.formInfo.name,
                        presetParamsType: this.type,
                        projectId: this.$route.query.id,
                        items: this.items,
                    };
                    this.loading = true;
                    this.axios.post("/api/project/doc_preset_params", params).then(() => {
                        this.$emit("success");
                        this.handleClose();
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                }
            });
        },
        //=====================================其他操作=====================================//
        handleClose() {
            this.$emit("update:visible", false);
        },
    },
};
</script>

<style lang="scss">

</style>
