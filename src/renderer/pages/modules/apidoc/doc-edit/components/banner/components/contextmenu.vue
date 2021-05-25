/*
    创建者：shuxiaokai
    创建时间：2020-01-11 18:36
    模块名称：节点右键菜单
    备注：
*/
<template>
    <div ref="contextmenu" class="ctx-wrap" :style="{left: left + 'px', top: top + 'px'}">
        <div v-show="operations.includes('file')" class="item-list" @click.stop="handleClickItem('file')">新建文档</div>
        <div v-show="operations.includes('folder')" class="item-list" @click.stop="handleClickItem('folder')">新建文件夹</div>
        <div v-show="operations.includes('template')" class="item-list" @click.stop="handleClickItem('template')">以模板新建</div>
        <div v-show="operations.includes('copyFolder')" class="divider"></div>
        <div v-show="operations.includes('copyFolder')" class="item-list" @click.stop="handleClickItem('copyFolder')">
            <span>复制文件夹</span>
            <span class="hot-key">Ctrl + C</span>
        </div>
        <div v-show="operations.includes('paste')" class="item-list" :class="{disabled: disabledOperations.includes('paste')}" @click.stop="handleClickItem('paste')">
            <span>粘贴</span>
            <span class="hot-key">Ctrl + V</span>
        </div>
        <div v-show="operations.includes('copy') && operations.includes('paste')" class="divider"></div>
        <div v-show="operations.includes('copy')" class="item-list" @click.stop="handleClickItem('copy')">
            <span>复制接口</span>
            <span class="hot-key">Ctrl + C</span>
        </div>
        <div v-show="operations.includes('fork')" class="item-list" @click.stop="handleClickItem('fork')">
            <span>生成副本</span>
            <span class="hot-key">Ctrl + V</span>
        </div>
        <div v-show="operations.includes('rename')" class="divider"></div>
        <div v-show="operations.includes('rename')" class="item-list" @click.stop="handleClickItem('rename')">
            <span>重命名</span>
            <span class="hot-key">F2</span>
        </div>
        <div v-show="operations.includes('delete')" class="item-list" @click.stop="handleClickItem('delete')">
            <span>删除</span>
            <span class="hot-key">Ctrl + D</span>
        </div>
        <div v-show="operations.includes('deleteMany')" class="item-list" @click.stop="handleClickItem('deleteMany')">批量删除</div>
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
        disabledOperations: {
            type: Array,
            default() {
                return [];
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
            if (this.disabledOperations.includes(type)) {
                return
            }
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
                case "fork":
                    this.$emit("fork")
                    break;
                case "paste":
                    this.$emit("paste")
                    break;
                case "copyFolder":
                    this.$emit("copyFolder")
                    break;
                case "deleteMany":
                    this.$emit("deleteMany")
                    break;
                default:
                    break;
            }
             this.$emit("close")
        },
    },
};
</script>

<style lang="scss">
    .ctx-wrap {
        min-width: size(240);
        @include contextmenu;
    }
</style>
