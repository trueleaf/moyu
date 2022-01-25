/*
    创建者：shuxiaokai
    创建时间：2021-08-18 22:29
    模块名称：带错误验证的输入框
    备注：
*/
<template>
    <div ref="inputWrap" class="valid-input" tabindex="-1" @keydown="handleInputKeydown" @mouseenter="handleMouseoverWrap">
        <div class="ipt-wrap">
            <input
                v-bind="$attrs"
                :disabled="disabled"
                :value="modelValue"
                type="text"
                class="ipt-inner"
                :class="{ error, disabled }"
                :placeholder="placeholder"
                @input="handleInput"
                @focus="handleFocus"
                @blur="isFocus = false;isHover = false;isInput = false;"
            >
        </div>
        <div v-if="error" class="ipt-error">{{ errorTip }}</div>
        <div v-if="isInput && isHover && realSelectData.length > 0" ref="mindWrap" class="mind-wrap" :style="{ left: focusX + 'px', top: focusY + 'px' }">
            <div
                v-for="(item, index) in realSelectData"
                :key="index"
                class="select-item"
                :class="{ active: currentSelectIndex === index }"
                @mouseover="handleMouseoverItem(index)"
                @click="handleSelectItem"
            >
                <span class="head">
                    <s-emphasize :value="item.key" :keyword="modelValue"></s-emphasize>
                </span>
                <span class="tail">{{ item.type }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import type Schema from "async-validator";
import type { ApidocProperty } from "@@/global"

export default defineComponent({
    props: {
        modelValue: {
            type: String,
            default: "",
        },
        /**
         * placeholder
         */
        placeholder: {
            type: String,
            default: "",
        },
        error: {
            type: Boolean,
            default: false,
        },
        errorTip: {
            type: String,
            default: "",
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        selectData: {
            type: Array as PropType<ApidocProperty[]>,
            default: () => []
        },
    },
    emits: ["update:modelValue", "remote-select"],
    data() {
        return {
            focusX: 0,
            focusY: 0,
            isFocus: false, //是否focus
            isHover: false, //鼠标是否在整个输入框内
            isInput: false, //是否输入了数据
            currentSelectIndex: 0,
            validator: null as Schema | null,
        };
    },
    computed: {
        realSelectData() {
            if (!this.modelValue) {
                return [];
            }
            return this.selectData.filter(v => v.key.includes(this.modelValue))
        },
    },
    mounted() {
        document.documentElement.addEventListener("click", this.bindClick)
    },
    beforeUnmount() {
        document.documentElement.removeEventListener("click", this.bindClick)
    },
    methods: {
        //=====================================input事件====================================//
        //键盘输入
        handleInput(e: Event) {
            const iptValue = (e.target as HTMLInputElement).value;
            this.$emit("update:modelValue", iptValue);
            this.isHover = true;
            this.isInput = true;
        },
        //处理focus
        handleFocus(e: FocusEvent) {
            const iptDom = e.target as HTMLInputElement;
            const iptRect = iptDom.getBoundingClientRect();
            this.focusX = iptRect.left;
            this.focusY = iptRect.top + 30;
            const exactMatchData = this.selectData.find(v => v.key === this.modelValue);
            const hasData = this.selectData.filter(v => v.key.includes(this.modelValue));
            if (hasData && !exactMatchData) {
                this.isFocus = true;
                this.isHover = true;
            }
        },
        //处理blur
        handleBlur() {
            console.log("blur")
        },
        //=========================================================================//
        //处理键盘事件
        handleInputKeydown(e: KeyboardEvent) {
            if (e.code === "ArrowDown") {
                e.preventDefault();
                this.currentSelectIndex = (this.currentSelectIndex + 1) % this.realSelectData.length;
                this.$nextTick(() => {
                    const mindWrap = this.$refs.mindWrap as HTMLElement | null;
                    const activeDom = mindWrap?.querySelector(".select-item.active");
                    if (activeDom && mindWrap) {
                        activeDom.scrollIntoView({
                            block: "end"
                        })
                    }
                })
            } else if (e.code === "ArrowUp") {
                e.preventDefault();
                let index = this.currentSelectIndex - 1;
                if (index < 0) {
                    index = this.realSelectData.length - 1;
                }
                this.currentSelectIndex = index;
                this.$nextTick(() => {
                    const mindWrap = this.$refs.mindWrap as HTMLElement | null;
                    const activeDom = mindWrap?.querySelector(".select-item.active");
                    if (activeDom && mindWrap) {
                        activeDom.scrollIntoView({
                            block: "end"
                        })
                    }
                })
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (this.realSelectData && this.realSelectData.length > 0) {
                    this.handleSelectItem();
                }
            }
            if (e.ctrlKey && (e.key === "v" || e.key === "V")) {
                setTimeout(() => {
                    const exactMatchData = this.selectData.find(v => v.key === this.modelValue);
                    if (exactMatchData) {
                        this.$emit("remote-select", exactMatchData);
                        this.isHover = false;
                    }
                })
            }
        },
        //选择参数
        handleSelectItem() {
            const selectData = this.realSelectData[this.currentSelectIndex];
            this.$emit("update:modelValue", selectData.key || "");
            this.isHover = false;
            this.$emit("remote-select", selectData);
        },
        //鼠标移入选项默认选中当前选项
        handleMouseoverItem(index: number) {
            this.currentSelectIndex = index;
            this.$nextTick(() => {
                const inputWrap = this.$refs.inputWrap as HTMLElement | null;
                if (inputWrap) {
                    inputWrap.focus();
                }
            })
        },
        //鼠标移入整个输入框
        handleMouseoverWrap() {
            if (this.isFocus) { //只有focus了移动鼠标才会变为true
                this.isHover = true;
            }
        },
        //全局点击取消选择面板
        bindClick() {
            this.isHover = false;
            this.isFocus = false;
        },
    },
})
</script>

<style lang="scss">
.valid-input {
    height: size(45);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    .ipt-wrap {
        width: 100%;
        .ipt-inner {
            width: 100%;
            height: size(32);
            display: flex;
            align-items: center;
            border: 1px solid $gray-400;
            border-radius: size(4);
            padding: 0 size(10);
            font-size: fz(14);
            color: var(--el-input-text-color,var(--el-text-color-regular));
             &.disabled {
                cursor: not-allowed;
                //保持与elementui样式统一
                background-color: var(--el-disabled-bg-color);
                border-color: var(--el-disabled-border-color);
                color: var(--el-disabled-text-color);
            }
            &::placeholder {
                color: $gray-400;
            }
            &.error {
                border: 1px solid $red;
            }
        }
    }
    .ipt-error {
        font-size: fz(12);
        color: $red;
        line-height: 1.2;
        text-align: left;
    }
    .mind-wrap {
        top: size(42);
        left: 0;
        background: $white;
        z-index: $zIndex-contextmenu;
        position: fixed;
        min-width: size(200);
        border: 1px solid $gray-200;
        // box-shadow: 0 0 5px rgb(0 0 0 / 10%);
        box-shadow: rgb(0 0 0 / 10%) 0px 2px 8px 0px; //墨刀弹窗样式
        max-height: size(220);
        overflow-y: auto;
        &::-webkit-scrollbar {
            width: size(5);
        }
        &::-webkit-scrollbar-thumb {
            background: $gray-400;
        }
        // padding: size(10) 0;
        .select-item {
            line-height: 1.8em;
            padding: size(5) size(25);
            cursor: pointer;
            display: flex;
            &:hover {
                background: $theme-color;
                color: $white;
            }
            &.active {
                background: $theme-color;
                color: $white;
            }
            .head {
                margin-right: size(10);
            }
            .tail {
                margin-left: auto;
                // color: $gray-500;
            }
        }
    }
}
</style>
