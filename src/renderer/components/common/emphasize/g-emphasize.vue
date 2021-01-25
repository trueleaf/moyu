/*
    创建者：shuxiaokai
    创建时间：2019-11-05 15:53
    模块名称：强调显示文本
    备注：xxxx
*/
<template>
    <span>
        <span>{{ leftStr }}</span>
        <span :style="{color: activeColor}">{{ emphasizeStr }}</span>
        <span>{{ rightStr }}</span>
    </span>
</template>

<script>
export default {
    props: {
        value: {
            type: String,
            default: "",
        },
        keyword: {
            type: String,
            default: "",
        },
        activeColor: {
            type: String,
            default: "#f60",
        },
    },
    data() {
        return {
            leftStr: "",
            emphasizeStr: "",
            rightStr: "",
        };
    },
    watch: {
        keyword: {
            handler() {
                this.spliceStr();
            },
            immediate: true,
        },
        value: {
            handler() {
                this.spliceStr();
            },
            immediate: true,
        },
    },
    methods: {
        spliceStr() {
            const index = this.value.toLowerCase().indexOf(this.keyword); //匹配位置
            const offset = this.keyword.length; //偏移位置
            if (index === -1 || this.keyword.trim() === "") {
                this.leftStr = this.value;
                this.emphasizeStr = "";
                this.rightStr = "";
                return;
            }
            const strArr = this.value.split("");
            this.leftStr = strArr.slice(0, index).join("");
            this.emphasizeStr = strArr.slice(index, index + offset).join("");
            this.rightStr = strArr.slice(index + offset).join("");
        },
    },
};
</script>

<style lang="scss">

</style>
