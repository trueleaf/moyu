/*
    创建者：shuxiaokai
    创建时间：2020-11-4 19:07
    模块名称：导出文档
    备注：xxxx
*/
<template>
    <s-dialog title="导出文档" :isShow="visible" width="40%" @close="handleClose">
        <div>
            <el-radio-group v-model="exportType">
                <el-radio :label="1">备选项</el-radio>
                <el-radio :label="2">备选项2</el-radio>
            </el-radio-group>
            <s-download-button url="/api/project/doc_word" :params="{ projectId: $route.query.id }">导出word</s-download-button>
        </div>
        <div slot="footer">
            <el-button size="mini" type="warning" @click="handleClose">关闭</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: { //是否现实弹窗
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            exportType: "word",
            formInfo: {
                name: "", //------文件名称
            }, 
            //=====================================其他参数====================================//
            loading: false, //----确认按钮状态
        };
    },
    mounted() {
        
    },
    methods: {
        handleExport() {
            this.loading = true;
            this.axios.get("/api/project/doc_word", { params: { projectId: this.$route.query.id } }).then(() => {
                
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================其他操作=====================================//
        //关闭弹窗
        handleClose() {
            this.$emit("update:visible", false);
            this.$emit("close");
        },
    }
};
</script>



<style lang="scss">

</style>
