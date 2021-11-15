/*
    创建者：shuxiaokai
    创建时间：2020-05-19 21:42
    模块名称：短信验证码按钮，具备倒计时功能
    备注：
*/
<template>
    <el-button :disabled="disableBtn" @click="handleClickButton">{{ tip }}</el-button>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { $t } from "@/i18n/i18n"

export default defineComponent({
    props: {
        /**
         * 非发送之前文案
         */
        startLabel: {
            type: String,
            default: $t("获取验证码"),
        },
        /**
         * 发送中文案，最终文案 数字+秒+后+发送
         */
        waitLabel: {
            type: String,
            default: $t("重新发送")
        },
        /**
         * 发送完成后
         */
        endLabel: {
            type: String,
            default: $t("重新获取")
        },
        /**
         * 点击按钮前钩子
         */
        hook: {
            type: Function,
            default: null
        },
        /**
         * 倒计时时长
         */
        countdown: {
            type: Number,
            default: 60
        },
    },
    emits: ["click"],
    data() {
        return {
            tip: this.startLabel, //获取验证码提示文案
            disableBtn: false, //是否锁定获取验证码按钮
            time: this.countdown,
            timer: 0, //定时器
        };
    },
    beforeUnmount() {
        clearInterval(this.timer);
    },
    methods: {
        //点击按钮
        handleClickButton() {
            if (this.hook && this.hook()) {
                this.changeState();
            } else if (!this.hook) {
                this.changeState();
            }
        },
        //处理倒计时
        changeState() {
            const speed = process.env.NODE_ENV === "development" ? 100 : 1000;
            clearInterval(this.timer); //清除上次的定时器
            this.disableBtn = true;
            this.$emit("click");
            this.tip = `${this.time}秒后${this.endLabel}`
            this.timer = window.setInterval(() => {
                this.time -= 1;
                if (this.time === 0) {
                    this.tip = this.endLabel;
                    this.disableBtn = false;
                    clearInterval(this.timer);
                    this.time = this.countdown;
                } else {
                    this.tip = `${this.time}秒后${this.endLabel}`
                }
            }, speed);
        }
        //=====================================其他操作=====================================//

    }
})
</script>

<style lang="scss">

</style>
