/*
    创建者：shuxiaokai
    创建时间：2021-03-09 11:23
    模块名称：配置块
    备注：
*/
<template>
    <div class="config-item">
        <div v-if="hasCheck">
            <el-checkbox v-model="enabled" :disabled="disabled" @change="handleEnabled">
                <span class="label">{{ label }}</span>
            </el-checkbox>
        </div>
        <div v-else class="label">{{ label }}</div>
        <div v-show="description" class="mt-1 description">{{ description }}</div>
        <div class="mt-2">
            <slot :enabled="enabled"/>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        label: { //标题信息
            type: String,
            default: "",
        },
        description: { //额外描述信息
            type: String,
            default: "",
        },
        hasCheck: { //是否选中
            type: Boolean,
            default: true,
        },
        disabled: { //是否禁用
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            //=================================表单与表格参数================================//
            enabled: false,
            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        handleEnabled() {
            this.$emit("change", this.enabled);
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //=====================================其他操作=====================================//
    },
};
</script>

<style lang="scss">
.config-item {
    padding: size(10) size(20);
    &:hover {
        background: $gray-200;
    }
    .description {
        font-size: fz(12);
        color: $gray-500;
    }
    .label {
        font-size: fz(15);
    }
}
</style>
