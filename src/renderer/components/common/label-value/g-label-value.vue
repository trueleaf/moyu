/*
    创建者：shuxiaokai
    创建时间：2021-09-04 15:11
    模块名称：label-value
    备注：
*/
<template>
    <div class="label-value" :style="{width: realWidth}">
        <span class="label" :style="{width: labelWidth}">
            <span>{{ label }}</span>
        </span>
        <span v-if="!$slots.default" :title="value" class="value">{{ value }}</span>
        <slot v-else class="value" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
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
        width: {
            type: String,
            default: "",
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
            if (this.width) {
                return this.width
            }
            return "";
        },
    },
})
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
