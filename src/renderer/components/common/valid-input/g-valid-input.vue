/*
    创建者：shuxiaokai
    创建时间：2021-08-18 22:29
    模块名称：带错误验证的输入框
    备注：
*/
<template>
    <div class="valid-input">
        <div class="ipt-wrap">
            <input v-bind="$attrs" :value="modelValue" type="text" class="ipt-inner" :class="{ error }" :placeholder="placeholder" @input="handleInput">
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .ipt-wrap {
        .ipt-inner {
            height: size(28);
            display: flex;
            align-items: center;
            border: 1px solid $gray-400;
            border-radius: size(4);
            padding: 0 size(10);
            font-size: fz(12);
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
