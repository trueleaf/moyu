/*
    创建者：shuxiaokai
    创建时间：2019-10-29 19:04
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div class="s-collaps mb-1">
        <div class="header" @click="toggleCollapse">
            <span v-if="!disabled" class="gray-700" :class="{'el-icon-arrow-down': isActive, 'el-icon-arrow-right': !isActive}"></span>
            <span v-if="!$slots.title" class="ml-1">{{ title }}</span>
            <slot v-else name="title" />
        </div>
        <div v-show="isActive" class="pr-2 pl-5 gray-700">
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: "请输入标题",
        },
        active: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            isActive: false,
        };
    },
    watch: {
        active: {
            handler() {
                this.isActive = this.active;
            },
            immediate: true,
        },
    },
    created() {

    },
    methods: {
        toggleCollapse() {
            if (this.disabled) {
                return;
            }
            this.isActive = !this.isActive
        },
    },
};
</script>

<style lang="scss">
.s-collaps {
    &>.header {
        cursor: pointer;
        height: size(25);
        display: flex;
        align-items: center;;
        user-select: none;
        color: $gray-800;
        &:hover {
            background: mix($theme-color, $white, 25%);
        }
    }
}
</style>
