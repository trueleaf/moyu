/*
    创建者：shuxiaokai
    创建时间：2020-11-4 19:07
    模块名称：导出文档
    备注：xxxx
*/
<template>
    <s-dialog title="导出文档" :isShow="visible" width="40%" class="doc-export" @close="handleClose">
        <div class="download-wrap">
            <s-download url="/api/project/doc_offline_data" :params="{ projectId: $route.query.id }" class="item">
                <svg class="svg-icon" aria-hidden="true">
                    <use xlink:href="#iconhtml"></use>
                </svg>
                <div class="mt-1">HTML</div>
            </s-download>
            <s-download url="/api/project/export/moyu" :params="{ projectId: $route.query.id }" class="item">
                <img src="@/assets/imgs/logo.png" alt="moyu" class="svg-icon">
                <div class="mt-1">JSON文档</div>
            </s-download>
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
            default: false,
        },
    },
    data() {
        return {
            formInfo: {
                name: "", //------文件名称
            },
            //=====================================其他参数====================================//
            loading: false, //----确认按钮状态
        };
    },
    mounted() {},
    methods: {
        handleExport() {
            this.loading = true;
            this.axios.get("/api/project/doc_word", { params: { projectId: this.$route.query.id } }).then(() => {}).catch((err) => {
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
    },
};
</script>

<style lang="scss">
.doc-export {
    .download-wrap {
        padding: 0 size(30);
        display: flex;
        .item {
            width: size(100);
            height: size(100);
            margin-right: size(20);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            &:hover {
                box-shadow: $box-shadow-sm;
            }
            .svg-icon {
                width: size(70);
                height: size(70);
            }
        }

    }
}
</style>
