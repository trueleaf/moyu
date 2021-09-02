/*
    创建者：shuxiaokai
    创建时间：2021-08-18 22:29
    模块名称：带错误验证的输入框
    备注：
*/
<template>
    <div class="valid-input">
        <div class="ipt-wrap">
            <input v-bind="$attrs" :disabled="disabled" :value="modelValue" type="text" class="ipt-inner" :class="{ error, disabled }" :placeholder="placeholder" @input="handleInput">
        </div>
        <div v-if="error" class="ipt-error">{{ errorTip }}</div> 
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import Schema from "async-validator";

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
    },
    emits: ["update:modelValue"],
    data() {
        return {
            validator: null as Schema | null,
        };
    },
    methods: {
        handleInput(e: Event) {
            const iptValue = (e.target as HTMLInputElement).value;
            this.$emit("update:modelValue", iptValue);
        },
        handleBlur() {
            console.log(2)
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
    .ipt-wrap {
        width: 100%;
        .ipt-inner {
            width: 100%;
            height: size(28);
            display: flex;
            align-items: center;
            border: 1px solid $gray-400;
            border-radius: size(4);
            padding: 0 size(10);
            font-size: fz(12);
             &.disabled {
                cursor: not-allowed;
                //保持与elementui样式统一
                background-color: var(--el-disabled-fill-base);
                border-color: var(--el-disabled-border-base);
                color: var(--el-disabled-color-base);
            }
            &::placeholder {
                color: $gray-400;
                font-size: fz(12);
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
}
</style>
