/*
    创建者：shuxiaokai
    创建时间：2020-08-30 19:28
    模块名称：label-value
    备注：xxxx
*/
<template>
    <div class="label-value">
        <span class="label" :style="{width: labelWidth}">
            <!-- <span class="el-icon-user-solid mr-1"></span> -->
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
            default: ""
        },
        labelWidth: {
            type: String,
            default: "80px"
        },
        value: {
            type: String,
            default: ""
        }
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



<style lang="scss">
.label-value {
    display: inline-flex;
    align-items: center;
    margin-bottom: size(10);
    flex: 0 0 auto;
    .label {
        color: $gray-800;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
    }
    .value {
        color: $gray-600;
    }
}
</style>
