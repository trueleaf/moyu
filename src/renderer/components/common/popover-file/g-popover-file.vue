/*
    创建者：shuxiaokai
    创建时间：2020-11-08 12:13
    模块名称：文件预览popover
    备注：xxxx
*/
<template>
    <el-popover placement="top-start" v-bind="$attrs">
        <div class="file-view">
            <img v-if="mime.includes('image')" :src="url" alt="图片类型" width="100%" height="100%">
            <!-- word -->
            <div v-else-if="mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')">
                <svg class="type-icon" aria-hidden="true" title="word">
                    <use xlink:href="#iconWORD"></use>
                </svg>
            </div>
            <div v-else-if="mime.includes('application/msword')">
                <svg class="type-icon" aria-hidden="true" title="word">
                    <use xlink:href="#iconWORD"></use>
                </svg>
            </div>
            <!-- excel -->
            <div v-else-if="mime.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')">
                <svg class="type-icon" aria-hidden="true" title="word">
                    <use xlink:href="#iconexcel"></use>
                </svg>
            </div>
            <div v-else-if="mime.includes('application/vnd.ms-excel')">
                <svg class="type-icon" aria-hidden="true" title="word">
                    <use xlink:href="#iconexcel"></use>
                </svg>
            </div>
            <!-- pdf -->
            <div v-else-if="mime.includes('application/pdf')">
                <svg class="type-icon" aria-hidden="true" title="word">
                    <use xlink:href="#iconpdfwenjian"></use>
                </svg>
            </div>
            <!-- 未知类型 -->
            <div v-else>
                <svg class="type-icon" aria-hidden="true" title="word">
                    <use xlink:href="#iconicon_weizhiwenjian"></use>
                </svg>
            </div>
        </div>
        <span slot="reference">
            <slot name="reference"/>
        </span>
    </el-popover>
</template>

<script>
export default {
    props: {
        url: {
            type: String,
            default: "",
        },
        mime: {
            type: String,
            default: "",
        },
    },
    data() {
        return {};
    },
    created() {},
    methods: {
        //=====================================获取远程数据==================================//
        //=====================================前后端交互====================================//
        //=====================================组件间交互====================================//
        //=====================================其他操作=====================================//
    },
};
</script>

<style lang="scss" scoped>
.file-view {
    width: size(150);
    height: size(150);
    display: flex;
    align-items: center;
    justify-content: center;
    .type-icon {
        width: size(120);
        height: size(120);
    }
}
</style>
