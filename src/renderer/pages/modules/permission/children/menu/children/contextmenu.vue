/*
    创建者：shuxiaokai
    创建时间：2020-01-11 18:36
    模块名称：节点右键菜单
    备注：
*/
<template>
    <div class="g-ctx-wrap" :style="{left: left + 'px', top: top + 'px'}">
        <div v-show="operations.includes('add')" class="item-list" @click="handleClickItem('menu')">新增菜单</div>
        <div v-show="operations.includes('delete')" class="item-list" @click="handleClickItem('delete')">删除</div>                    
    </div>
</template>

<script>
export default {
    props: {
        operations: {
            type: Array,
            default() {
                return []
            }
        },
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
                case "menu":
                    this.$emit("menu")
                    break;
                case "delete":
                    this.$emit("delete")
                    break;
                default:
                    break;
            } 
        },
    }
};
</script>



<style lang="scss">
    .g-ctx-wrap {
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
                background: rgba(0,0,0,0.04);
            }
        }
    }
</style>
