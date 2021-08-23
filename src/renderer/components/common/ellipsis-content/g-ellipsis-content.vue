/*
    创建者：shuxiaokai
    创建时间：2021-08-23 21:11
    模块名称：文字溢出展示
    备注：
*/
<template>
    <div class="s-ellipsis">
        <el-tooltip effect="light" placement="top-start" :content="value.toString()" :disabled="!isOverflow">
            <span ref="text" class="s-ellipsis-content" @dblclick="handleSelect">{{ value }}</span>
        </el-tooltip>
        <!-- <span v-if="copy || isOverflow" v-copy="value" class="copy el-icon-document-copy cursor-pointer orange"></span> -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        /**
         * 展示值
         */
        value: {
            type: [String, Number, Boolean],
            default: "",
        },
        /**
         * 最大宽度
         */
        maxWidth: {
            type: [String, Number],
            default: 100,
        },
        /**
         * 是否允许拷贝
         */
        copy: {
            type: [Boolean],
            default: false,
        },
    },
    data() {
        return {
            isOverflow: false,
        };
    },
    watch: {
        value: {
            handler() {
                this.changeValueWidth();
                setTimeout(() => {
                    const textDom = this.$refs.text as HTMLElement;
                    if (textDom) {
                        this.isOverflow = textDom.clientWidth < textDom.scrollWidth;
                    }
                });
            },
            immediate: true,
        },
    },
    mounted() {
        this.changeValueWidth();
    },
    methods: {
        changeValueWidth() {
            const textDom = this.$refs.text as HTMLElement;
            if (!textDom) {
                return;
            }
            if (typeof this.maxWidth === "number") {
                textDom.style.maxWidth = `${this.maxWidth}px`;
            } else if (typeof this.maxWidth === "string") {
                textDom.style.maxWidth = this.maxWidth;
            }
        },
        handleSelect(e: Event) {
            const selection = window.getSelection();
            selection?.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(e.target as HTMLElement);
            selection?.addRange(range);
        },
    },
})
</script>

<style lang="scss">
.s-ellipsis {
    display: flex;
    align-items: center;
    .s-ellipsis-content {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: -3px;
        display: inline-block;
        margin-right: size(10);
    }
    .copy {
        margin-right: size(10);
    }
}
</style>
