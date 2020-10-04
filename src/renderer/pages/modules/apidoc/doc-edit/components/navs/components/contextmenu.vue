/*
    创建者：shuxiaokai
    创建时间：2020-07-03 16:44
    模块名称：
    备注：xxxx
*/
<template>
    <div class="ctx-wrap" :style="{left: left + 'px', top: top + 'px'}">
        <div class="item-list" @click="handleClickItem('closeRight')">关闭右侧</div>
        <div class="item-list" @click="handleClickItem('closeLeft')">关闭左侧</div>
        <div class="item-list" @click="handleClickItem('closeCurrent')">关闭标签</div>
        <div class="item-list" @click="handleClickItem('closeOther')">关闭其他</div>
    </div>
</template>

<script>
export default {
    props: {
        left: {
            type: Number,
            default: 0
        },
        top: {
            type: Number,
            default: 0
        },
    },
    data() {
        return {
            
        };
    },
    created() {

    },
    methods: {
        handleClickItem(type) {
            /*eslint-disable indent*/
            switch (type) {
                case "closeRight":
                    this.$emit("closeRight")
                    break;
                case "closeLeft":
                    this.$emit("closeLeft")
                    break;
                case "closeCurrent":
                    this.$emit("closeCurrent")
                    break;
                case "closeOther":
                    this.$emit("closeOther")
                    break;
                default:
                    break;
            } 
        },
    }
};
</script>



<style lang="scss">
    .ctx-wrap {
        position: fixed;
        background: $white;
        border-radius: $border-radius-sm;
        box-shadow: $box-shadow-sm;
        z-index: 20;
        .item-list {
            line-height: 2em;
            padding: .3em 2em;
            cursor: pointer;
            &:hover {
                background: $gray-300;
            }
        }
    }
</style>
