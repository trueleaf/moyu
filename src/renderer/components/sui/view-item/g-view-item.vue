/*
    创建者：shuxiaokai
    创建时间：2020-03-01 20:43
    模块名称：数据预览展示
    备注：xxxx
*/
<template>
    <el-col :xs="24" :sm="24" :md="md" :lg="lg" :xl="xl">
        <div class="s-view-item">
            <div class="f-base">{{ realLabel }}</div>
            <slot />
        </div>
    </el-col>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            default: ""
        },
        oneLine: {
            type: Boolean,
            default: false
        },
        halfLine: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {

        };
    },
    computed: {
        realLabel() { //处理label值
            if (this.label.endsWith("：")) {
                return this.label;
            } else if (this.label.endsWith(":")) {
                return this.label.replace(":", "：")
            } else {
                return this.label + "："
            }
        },
        md() { //处理oneline和halfLine
            if (this.oneLine) {
                return 24;
            } else if (this.halfLine) {
                return 12;
            } else {
                return 12;
            }
        },
        lg() { //处理oneline和halfLine
            if (this.oneLine) {
                return 24;
            } else if (this.halfLine) {
                return 12;
            } else {
                return 6;
            }
        },
        xl() { //处理oneline和halfLine
            if (this.oneLine) {
                return 24;
            } else if (this.halfLine) {
                return 12;
            } else {
                return 6;
            }
        },
    },
    created() {

    },
    methods: {

    }
};
</script>



<style lang="scss">
    .s-view-item {
        display: flex;
        align-items: center;
        margin-bottom: size(10);
    }
</style>
