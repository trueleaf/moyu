/*
    创建者：shuxiaokai
    创建时间：2021-08-30 21:01
    模块名称：折叠卡片
    备注：
*/
<template>
    <div class="collapse-card" :class="{shadow: shadow}" :style="{ width: width }">
        <header v-if="$slots.operation || title || $slots.head" :class="{disabled: disabled}" :title="disabled ? disabledTip : ''">
            <div class="head" @click="showContent = !showContent">
                <template v-if="!disabled">
                    <span v-if="!showContent" class="el-icon-caret-right mr-2"></span>
                    <span v-else class="el-icon-caret-bottom mr-2"></span>
                </template>
                <template v-else>
                    <svg class="disabled-icon mr-2" aria-hidden="true">
                        <use xlink:href="#iconweibiaoti-"></use>
                    </svg>
                </template>
                <div v-if="!$slots.head" class="title" :title="title" :style="{ color: titleColor }">{{ title }}</div>
                <slot v-else name="head">{{ title }}</slot>
            </div>
            <div v-show="!disabled" class="operation">
                <slot name="operation"></slot>
            </div>
            <div class="tail">
                <slot name="tail"></slot>
            </div>
        </header>
        <section v-show="!disabled && showContent" ref="content" class="content">
            <slot></slot>
        </section>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        title: { // card头部标题
            type: String,
            default: "",
        },
        width: { //宽度
            type: String,
            default: "100%",
        },
        inline: {
            type: Boolean,
            default: false,
        },
        titleColor: {
            type: String,
            default: "#444",
        },
        fold: { //默认是否折叠
            type: Boolean,
            default: false,
        },
        shadow: {
            type: Boolean,
            default: false,
        },
        disabled: { //是否禁用，禁用后内容区域不显示
            type: Boolean,
            default: false,
        },
        disabledTip: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            showContent: true,
        };
    },
    watch: {
        fold() {
            this.showContent = !this.fold;
        },
    },
    mounted() {
        this.showContent = !this.fold;
    },
    methods: {
        expand() {
            this.showContent = true;
        },
    },
})
</script>

<style lang="scss">
.collapse-card {
    width: 100%;
    background: $white;
    display: flex;
    flex-direction: column;
    margin-bottom: size(10);
    &.shadow {
        box-shadow: $box-shadow;
    }
    &>header {
        background: $gray-200;
        display: flex;
        align-items: center;
        height: size(40);
        user-select: none;
        .head {
            padding-left: size(10);
            padding-right: size(20);
            cursor: pointer;
            display: flex;
            align-items: center;
            height: 100%;
            min-width: size(150);
            border-right: 1px solid $gray-300;
            &:hover {
                background: $gray-300;
            }
        }
        .title {
            max-width: size(300);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            height: size(40);
            line-height: size(40);
        }
        .operation {
            flex: 1;
            padding: 0 size(20);
        }
        .tail {
            padding-right: size(20);
            margin-left: auto;
        }
        &.disabled {
            cursor: not-allowed;
            background: $gray-100;
            .head {
                cursor: not-allowed;
                &:hover {
                    background: none;
                }
            }
        }
    }
    .disabled-icon {
        width: size(15);
        height: size(15);
    }
    // 内容区域
    .content {
        flex: 1;
        overflow: hidden;
    }
}
</style>
