/*
    创建者：shuxiaokai
    创建时间：2021-07-30 22:39
    模块名称：contextmenu-item
    备注：
*/
<template>
    <div v-if="type === 'divider'" class="s-contextmenu-divider"></div>
    <div v-else class="s-contextmenu-item" :class="{disabled: disabled}" @click="handleClickItem">
        <span>{{ label }}</span>
        <span class="hot-key">{{ hotKey }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"

export default defineComponent({
    props: {
        /**
         * 标签
         */
        label: {
            type: String,
            default: "",
        },
        /**
         * 快捷键
         */
        hotKey: {
            type: String,
            default: "",
        },
        /**
         * 类型，divider代表分割线
         */
        type: {
            type: String as PropType<"divider" | "">,
            default: "",
        },
        /**
         * 是否禁用
         */
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["click"],
    data() {
        return {
        };
    },
    methods: {
        handleClickItem(e: MouseEvent) {
            if (this.disabled) {
                return;
            }
            this.$emit("click", e)
        },
    },
})
</script>

<style lang="scss">
.s-contextmenu-item {
    line-height: 1.8em;
    padding: size(5) size(25);
    cursor: pointer;
    display: flex;
    &.disabled {
        color: $gray-400;
        cursor: default;
        &:hover {
            background: inherit;
            color: $gray-400;
        }
    }
    .hot-key {
        margin-left: auto;
        color: $gray-500;
    }
    &:hover {
        background: $gray-200;
        color: $theme-color;
    }
}
.s-contextmenu-divider {
    margin: size(4) 0;
    border-top: 1px solid $gray-200;
}
</style>
