/*
    创建者：shuxiaokai
    创建时间：2021-07-27 21:24
    模块名称：banner菜单顶部搜索和操作区域
    备注：
*/
<template>
    <div class="tool">
        <h2 v-if="projectName" class="gray-700 f-lg text-center text-ellipsis" :title="projectName">{{ projectName }}</h2>
        <h2 v-else class="gray-700 f-lg text-center text-ellipsis" :title="projectName">/</h2>
        <el-input v-model="queryData" class="doc-search" placeholder="文档名称、文档url、创建者" clearable @input="handleFilterBanner"></el-input>
        <!-- 工具栏 -->
        <div class="tool-icon mt-1">
            <!-- 固定的工具栏操作 -->
            <s-draggable v-model="pinOperations" animation="150" item-key="name" class="operation" group="operation">
                <template #item="{ element }">
                    <div :title="element.name">
                        <svg class="svg-icon" aria-hidden="true" @click="handleEmit(element.op)">
                            <use :xlink:href="element.icon"></use>
                        </svg>
                    </div>
                </template>
            </s-draggable>
            <!-- 全部工具栏操作 -->
            <el-popover v-model:visible="visible" popper-class="tool-panel" transition="none" placement="right" :width="320" trigger="manual">
                <template #reference>
                    <div class="more" @click.stop="visible = true">
                        <i class="more-op el-icon-more" title="更多操作"></i>
                    </div>
                </template>
                <div class="border-bottom-gray-300 py-2 px-2">快捷操作</div>
                <div class="toolbar-close" @click="visible = false">
                    <i class="el-icon-close"></i>
                </div>
                <s-draggable v-model="operations" animation="150" item-key="name" group="operation2">
                    <template #item="{ element }">
                        <div class="dropdown-item">
                            <svg class="svg-icon mr-2" aria-hidden="true" @click="handleEmit(element.op)">
                                <use :xlink:href="element.icon"></use>
                            </svg>
                            <div class="label">{{ element.name }}</div>
                            <div class="shortcut">
                                <span v-for="(item, index) in element.shortcut" :key="item">
                                    <span>{{ item }}</span>
                                    <span v-if="index !== element.shortcut.length - 1">+</span>
                                </span>
                            </div>
                            <div class="pin iconfont iconpin" :class="{ active: element.pin }" @click="togglePin(element)"></div>
                        </div>
                    </template>
                </s-draggable>
            </el-popover>
        </div>
    </div>
    <s-add-file-dialog v-if="addFileDialogVisible" v-model="addFileDialogVisible" @success="handleAddFileAndFolderCb"></s-add-file-dialog>
    <s-add-folder-dialog v-if="addFolderDialogVisible" v-model="addFolderDialogVisible" @success="handleAddFileAndFolderCb"></s-add-folder-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue"
import draggable from "vuedraggable"
import addFileDialog from "../../dialog/add-file/add-file.vue"
import addFolderDialog from "../../dialog/add-folder/add-folder.vue"
import operations from "./operations"
import type { ApidocBanner, ApidocOperations } from "@@/global"
import { addFileAndFolderCb } from "../composables/curd-node"

type Operation = {
    /**
     * 操作名称
     */
    name: string,
    /**
     * 图标
     */
    icon: string,
    /**
     * 操作标识
     */
    op: string,
    /**
     * 快捷键
     */
    shortcut: string[],
    /**
     * 是否固定操作栏
     */
    pin: boolean,
};

export default defineComponent({
    components: {
        "s-draggable": draggable,
        "s-add-file-dialog": addFileDialog,
        "s-add-folder-dialog": addFolderDialog,
    },
    emits: ["fresh"],
    setup() {
        //添加文件夹或文档成功回调函数
        const handleAddFileAndFolderCb = (data: ApidocBanner) => {
            addFileAndFolderCb.call(this, ref(null), data)
        };
        return {
            handleAddFileAndFolderCb,
        };
    },
    data() {
        return {
            operations: [] as Operation[], //----------所有操作
            pinOperations: [] as Operation[], //-------固定工具栏操作
            queryData: "", //--------------------------过滤条件
            visible: false, //-------------------------是否显示更多操作
            addFileDialogVisible: false,
            addFolderDialogVisible: false,
        };
    },
    computed: {
        /**
         * 项目名称
         */
        projectName(): string {
            return this.$store.state["apidoc/baseInfo"].projectName;
        },
    },
    watch: {
        /**
         * 缓存所有操作
         */
        operations: {
            handler(v) {
                localStorage.setItem("apidoc/toolbarOperations", JSON.stringify(v))
            },
            deep: true,
        },
        /**
         * 缓存工具栏操作
         */
        pinOperations: {
            handler(v) {
                localStorage.setItem("apidoc/PinToolbarOperations", JSON.stringify(v))
            },
            deep: true,
        },
    },
    mounted() {
        document.documentElement.addEventListener("click", this.handleHideMoreOperation);
        this.initCacheOperation();
    },
    unmounted() {
        document.documentElement.removeEventListener("click", this.handleHideMoreOperation);
    },
    methods: {
        //初始化操作栏缓存
        initCacheOperation() {
            const localToolbarOperations = localStorage.getItem("apidoc/toolbarOperations");
            const localPinToolbarOperations = localStorage.getItem("apidoc/PinToolbarOperations");
            if (localToolbarOperations) {
                this.operations = JSON.parse(localToolbarOperations);
            } else {
                this.operations = operations;
            }
            if (localPinToolbarOperations) {
                this.pinOperations = JSON.parse(localPinToolbarOperations);
            } else {
                this.pinOperations = this.operations.filter((v) => v.pin);
            }
        },
        handleFilterBanner() {
            console.log(333)
        },
        //切换固定操作
        togglePin(element: Operation) {
            element.pin = !element.pin;
            this.pinOperations = this.operations.filter((v) => v.pin);
        },
        //操作
        handleEmit(op: ApidocOperations) {
            switch (op) {
            case "addRootFolder": //新建文件夹
                this.addFolderDialogVisible = true;
                break;
            case "addRootFile": //新建文件
                this.addFileDialogVisible = true;
                break;
            case "freshBanner": //刷新页面
                this.$emit("fresh");
                break;
            default:
                break;
            }
        },
        //隐藏更多操作
        handleHideMoreOperation() {
            this.visible = false;
        },
    },
})
</script>

<style lang="scss">
.tool {
    position: relative;
    padding: 0 size(20);
    height: size(150);
    background: $gray-200;
    flex: 0 0 auto;
    // 搜索框样式
    .doc-search {
        border-radius: 20px;
        .el-input__inner {
            border-radius: 20px;
        }
    }
    // 快捷方式样式
    .tool-icon {
        position: relative;
        align-items: center;
        display: flex;
        .item {
            outline: none;
        }
        .operation {
            width: 85%;
            display: flex;
            justify-content: space-between;
        }
        .more {
            display: flex;
            justify-content: center;
            margin-left: auto;
            width: 10%;
            position: relative;
        }
        .svg-icon {
            width: size(25);
            height: size(25);
            padding: size(5);
            cursor: pointer;
            &:hover {
                background: $gray-400;
            }
        }
    }
    .more-op {
        width: size(25);
        height: size(25);
        line-height: size(25);
        text-align: center;
        cursor: pointer;
        &:hover {
            background: $gray-400;
        }
    }
}
.dropdown-item {
    height: size(40);
    width: 100%;
    padding: 0 size(10) 0 size(20);
    display: flex;
    align-items: center;
    cursor: default;
    .label {
        width: size(120);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .shortcut {
        width: size(100);
        color: $gray-500;
    }
    .svg-icon {
        width: size(25);
        height: size(25);
        padding: size(5);
        cursor: pointer;
    }
    .pin {
        cursor: pointer;
        color: $gray-400;
        &.active {
            color: $theme-color;
            &:hover {
                color: $theme-color;
            }
        }
    }
    &:hover {
        background: $gray-200;
    }
}
.toolbar-close {
    @include rt-close;
}
.el-popover.el-popper.tool-panel {
    padding: 0;
}
</style>
