/*
    创建者：shuxiaokai
    创建时间：2020-01-11 18:36
    模块名称：节点右键菜单
    备注：
*/
<template>
    <div class="ctx-wrap" :style="{left: left + 'px', top: top + 'px'}">
        <div v-show="operations.includes('file')" class="item-list" @click="handleClickItem('file')">新建文档</div>
        <div v-show="operations.includes('folder')" class="item-list" @click="handleClickItem('folder')">新建文件夹</div>
        <div v-show="operations.includes('template')" class="item-list" @click="handleClickItem('template')">以模板新建</div>
        <div v-show="operations.includes('rename')" class="item-list" @click="handleClickItem('rename')">重命名</div>
        <div v-show="operations.includes('copy')" class="item-list" @click="handleClickItem('copy')">复制接口</div>
        <div v-show="operations.includes('delete')" class="item-list" @click="handleClickItem('delete')">删除</div>
        <div v-show="operations.includes('deleteMany')" class="item-list" @click="handleClickItem('deleteMany')">批量删除</div>
    </div>
</template>

<script>
export default {
    props: {
        operations: {
            type: Array,
            default() {
                return ["file", "folder"];
            },
        },
        left: {
            type: Number,
            default: 0,
        },
        top: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {};
    },
    created() {

    },
    methods: {
        handleClickItem(type) {
            /*eslint-disable indent*/
            switch (type) {
                case "file":
                    this.$emit("file")
                    break;
                case "folder":
                    this.$emit("folder")
                    break;
                case "template":
                    this.$emit("template")
                    break;
                case "rename":
                    this.$emit("rename")
                    break;
                case "delete":
                    this.$emit("delete")
                    break;
                case "copy":
                    this.$emit("copy")
                    break;
                case "deleteMany":
                    this.$emit("deleteMany")
                    break;
                default:
                    break;
            }
        },
    },
};
</script>

<style lang="scss">
    .ctx-wrap {
        position: fixed;
        background: $white;
        border-radius: $border-radius-sm;
        box-shadow: $box-shadow-sm;
        z-index: $zIndex-contextmenu;
        animation: ctx-fade .2s;
        @keyframes ctx-fade {
            from {
                transform: scale(0.8);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        .item-list {
            line-height: 2em;
            padding: .3em 2em;
            cursor: pointer;
            &:hover {
                background: $gray-200;
                color: $theme-color;
            }
        }
    }
</style>
