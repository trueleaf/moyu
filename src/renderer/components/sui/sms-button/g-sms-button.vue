/*
    创建者：shuxiaokai
    创建时间：2020-05-19 11:42
    模块名称：短信验证码按钮，具备倒计时功能
    备注：xxxx
*/
<template>
    <el-button :disabled="disableBtn" @click="handleClick">{{ tip }}</el-button>
</template>

<script>
export default {
    props: {
        startLabel: {
            type: String,
            default: "获取验证码"
        },
        waitLabel: {
            type: String,
            default: "重新发送"
        },
        endLabel: {
            type: String,
            default: "重新获取"
        },
        hook: { //点击前钩子
            type: Function,
            default: null
        },        
        countdown: { //倒计时
            type: Number,
            default: 60
        },
    },
    data() {
        return {
            tip: this.startLabel, //获取验证码提示文案
            disableBtn: false, //是否锁定获取验证码按钮
            time: this.countdown,
            timer: null, //定时器
        };
    },
    created() {
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        handleClick() {
            if (this.hook && this.hook()) {
                this.changeState();                
            } else if (!this.hook) {
                this.changeState(); 
            }
        },
        //处理倒计时
        changeState() {
            const speed = process.env.NODE_ENV === "development" ? 100 : 1000;
            console.log(this.ENVIROMENT)
            clearInterval(this.timer); //清除上次的定时器
            this.disableBtn = true;
            this.$emit("click");  
            this.tip = `${this.time}秒后${this.endLabel}`
            this.timer = setInterval(() => {
                this.time--;
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
};
</script>



<style lang="scss">

</style>
