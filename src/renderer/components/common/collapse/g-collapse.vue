/*
    创建者：shuxiaokai
    创建时间：2019-10-29 19:04
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div class="s-collaps mb-1">
        <div class="header" @click="isActive = !isActive">
            <span :class="{'el-icon-caret-bottom': isActive, 'el-icon-caret-right': !isActive}"></span>
            <span class="ml-1">{{ title }}</span>
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
            default: "请输入标题"
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            isActive: false
        };
    },
    watch: {
        active: {
            handler() {
                this.isActive = this.active;
            },
            immediate: true
        },
    },
    created() {

    },
    methods: {

    }
};
</script>



<style lang="scss">
.s-collaps {
    .header {
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
    .h-0 {
        height: 0;
        overflow: hidden;
    }
}
</style>
