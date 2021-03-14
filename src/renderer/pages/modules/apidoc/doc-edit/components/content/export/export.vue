/*
    创建者：shuxiaokai
    创建时间：2020-11-4 19:07
    模块名称：导出文档
    备注：xxxx
*/
<template>
    <div class="doc-export">
        <div class="download-wrap">
            <div class="item" :class="{active: selectedType === 'html'}" @click="selectedType = 'html'">
                <svg class="svg-icon" aria-hidden="true">
                    <use xlink:href="#iconhtml"></use>
                </svg>
                <div class="mt-1">HTML</div>
            </div>
            <div class="item" :class="{active: selectedType === 'moyu'}" @click="selectedType = 'moyu'">
                <img src="@/assets/imgs/logo.png" alt="moyu" class="svg-icon">
                <div class="mt-1">JSON文档</div>
            </div>
            <!-- <s-download url="/api/project/doc_offline_data" :params="{ projectId: $route.query.id }" class="item"></s-download> -->
            <!-- <s-download url="/api/project/export/moyu" :params="{ projectId: $route.query.id }" class="item"></s-download> -->
        </div>
        <s-fieldset title="配置">
            <s-config label="文档过滤">
                <h2>222</h2>
            </s-config>
        </s-fieldset>
        <div>
            <el-button size="mini" type="primary" @click="handleExport">确定</el-button>
        </div>
    </div>
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
            selectedType: "html", //导出文档类型
            //=====================================其他参数====================================//
            loading: false, //----导出加载按钮
            loading2: false, //----导出加载按钮
        };
    },
    mounted() {},
    methods: {
        //=====================================其他操作=====================================//
        //确认导出
        handleExport() {},
    },
};
</script>

<style lang="scss" scoped>
.doc-export {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    width: 70%;
    min-width: size(768);
    margin: 0 auto;
    .download-wrap {
        display: flex;
        .item {
            width: size(100);
            height: size(100);
            padding: size(10);
            margin-right: size(20);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            border: 1px solid transparent;
            &.active {
                border: 1px solid $theme-color;
            }
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
