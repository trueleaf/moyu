/*
    创建者：shuxiaokai
    创建时间：2020-08-30 19:28
    模块名称：label-value
    备注：xxxx
*/
<template>
    <div class="label-value" :style="{width: realWidth}">
        <span class="label" :style="{width: labelWidth}">
            <span>{{ label }}</span>
        </span>
        <span v-if="!$slots.default" class="value">{{ value }}</span>
        <slot v-else class="value" />
    </div>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            default: "",
        },
        labelWidth: {
            type: String,
            default: "80px",
        },
        value: {
            type: String,
            default: "",
        },
        halfLine: {
            type: Boolean,
            default: false,
        },
        oneLine: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        realWidth() {
            if (this.halfLine) {
                return "50%";
            }
            if (this.oneLine) {
                return "100%";
            }
            return "";
        },
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

<style lang="scss">
.label-value {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    max-width: 100%;
    margin-bottom: size(10);
    .label {
        color: $gray-800;
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        flex-grow: 0;
        flex-shrink: 0;
    }
    .value {
        color: $gray-600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
    }
}
</style>
