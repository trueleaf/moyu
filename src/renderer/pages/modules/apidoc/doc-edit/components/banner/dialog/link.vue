/*
    创建者：shuxiaokai
    创建时间：2020-11-4 19:07
    模块名称：导出文档
    备注：xxxx
*/
<template>
    <s-dialog title="生成在线链接" :isShow="visible" width="40%" class="doc-link" @close="handleClose">
        <div class="d-flex">
            <pre class="link w-70">{{ shareLink }}</pre>
            <el-button-group class="flex0 w-200px">
                <el-button :loading="loading" size="mini" @click="handleGenerateLink">生成</el-button>
                <el-button v-copy="shareLink" size="mini">复制</el-button>
                <el-button size="mini">高级</el-button>
            </el-button-group>
        </div>
        <!-- <el-form ref="form" :model="formInfo" label-width="100px">
            <el-form-item label="密码">
                <el-input v-model="formInfo.passowrd" size="mini"></el-input>
            </el-form-item>
        </el-form> -->
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
            default: false,
        },
    },
    data() {
        return {
            formInfo: {
                password: "",
            },
            shareLink: "", //在线链接
            //=====================================其他参数====================================//
            loading: false, //----生成在线链接加载按钮
        };
    },
    mounted() {},
    methods: {
        //=====================================其他操作=====================================//
        //关闭弹窗
        handleClose() {
            this.$emit("update:visible", false);
            this.$emit("close");
        },
        //生成链接
        handleGenerateLink() {
            this.loading = true;
            const params = {
                projectId: this.$route.query.id,
            };
            this.axios.get("/api/project/export/online", { params }).then((res) => {
                this.shareLink = `${this.config.renderConfig.share.baseUrl}?shareId=${res.data}/#/`;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
    },
};
</script>

<style lang="scss">
.doc-link {
    .link {
        height: size(28);
        white-space: nowrap;
        overflow-x: auto;
        user-select: auto;
        &::-webkit-scrollbar {
            height: 0px;
        }
    }
}
</style>
