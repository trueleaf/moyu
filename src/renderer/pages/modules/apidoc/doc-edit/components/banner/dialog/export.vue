/*
    创建者：shuxiaokai
    创建时间：2020-11-4 19:07
    模块名称：导出文档
    备注：xxxx
*/
<template>
    <s-dialog :isShow="visible" width="40%" class="doc-export" @close="handleClose">
        <s-fieldset title="导出文档">
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
        </s-fieldset>
        <s-fieldset title="生成在线链接">
            <div class="d-flex">
                <pre class="w-80"></pre>
                <el-button size="mini">生成</el-button>
                <el-button size="mini">复制</el-button>
                <el-button size="mini">高级</el-button>
            </div>
        </s-fieldset>
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
            loading: false, //----导出加载按钮
            loading2: false, //----导出加载按钮
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
                border: 1px solid $gray-400;
            }
            .svg-icon {
                width: size(70);
                height: size(70);
            }
        }

    }
}
</style>
