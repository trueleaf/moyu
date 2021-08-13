/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:00
    模块名称：
    备注：
*/
<template>
    <s-resize-x :min="280" :max="450" :width="300" name="banner" class="banner" tabindex="1">
        <s-tool @fresh="getBannerData"></s-tool>
        <s-loading ref="bannerRef" :loading="loading" class="tree-wrap" @contextmenu="handleWrapContextmenu">
            <el-tree
                ref="docTree"
                :class="{ 'show-more': showMoreNodeInfo }"
                :data="bannerData"
                :default-expanded-keys="defaultExpandedKeys"
                node-key="_id"
                empty-text="点击工具栏按钮新增文档或者鼠标右键新增"
                :draggable="enableDrag"
                :allow-drop="handleCheckNodeCouldDrop"
                @node-drop="handleNodeDropSuccess"
                @node-contextmenu="handleShowContextmenu"
            >
                <template #default="scope">
                    <div
                        class="custom-tree-node"
                        :class="{ 
                            'select-node': selectNodes.find(v => v._id === scope.data._id),
                            'cut-node': cutNodes.find(v => v._id === scope.data._id),
                        }"
                        tabindex="0"
                        @keydown.stop="handleNodeKeydown($event)"
                        @keyup.stop="handleNodeKeyUp"
                        @mouseenter.stop="handleNodeHover"
                        @click="handleClickNode($event, scope.data)"
                        @dblclick="handleDbclickNode(scope.data)"
                    >
                        <!-- file渲染 -->
                        <template v-if="!scope.data.isFolder">
                            <template v-for="(req) in projectInfo.rules.requestMethods">
                                <span v-if="scope.data.method === req.value.toLowerCase()" :key="req.name" class="file-icon" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <div v-if="editNode?._id !== scope.data._id" class="node-label-wrap">
                                <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                                <s-emphasize v-show="showMoreNodeInfo" class="node-bottom" :title="scope.data.url" :value="scope.data.url"></s-emphasize>
                            </div>
                            <input 
                                v-else 
                                :value="scope.data.name"
                                placeholder="不能为空"
                                type="text" 
                                class="rename-ipt"
                                :class="{error: scope.data.name.trim() === ''}"
                                @blur="handleChangeNodeName($event, scope.data)"
                                @input="handleWatchNodeInput($event)"
                                @keydown.stop.enter="handleChangeNodeName($event, scope.data)"
                            >
                            <div 
                                class="more"
                                @click.stop="handleShowContextmenu($event, scope.data)"
                            >
                                <i class="more-op el-icon-more" title="更多操作"></i>
                            </div>
                        </template>
                        <!-- 文件夹渲染 -->
                        <template v-if="scope.data.isFolder">
                            <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                            <!-- <img :src="require('@/assets/imgs/apidoc/folder.png')" class="folder-icon" /> -->
                            <div v-if="editNode?._id !== scope.data._id" class="node-label-wrap">
                                <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                                <div v-show="showMoreNodeInfo" class="node-bottom">{{ scope.data.url }}</div>
                            </div>
                            <input 
                                v-else 
                                :value="scope.data.name"
                                placeholder="不能为空"
                                type="text" 
                                class="rename-ipt"
                                :class="{error: scope.data.name.trim() === ''}"
                                @blur="handleChangeNodeName($event, scope.data)"
                                @input="handleWatchNodeInput($event)"
                                @keydown.stop.enter="handleChangeNodeName($event, scope.data)"
                            >
                            <div 
                                class="more"
                                @click.stop="handleShowContextmenu($event, scope.data)"
                            >
                                <i class="more-op el-icon-more" title="更多操作"></i>
                            </div>
                        </template>
                    </div>
                </template>
            </el-tree>
        </s-loading>
        <!-- 鼠标右键 -->
        <teleport to="body">
            <!-- 单个节点操作 -->
            <s-contextmenu v-if="showContextmenu && selectNodes.length <= 1" :left="contextmenuLeft" :top="contextmenuTop">
                <s-contextmenu-item v-show="!currentOperationalNode || currentOperationalNode?.isFolder" label="新建文档" @click="handleOpenAddFileDialog"></s-contextmenu-item>
                <s-contextmenu-item v-show="!currentOperationalNode || currentOperationalNode?.isFolder" label="新建文件夹" @click="handleOpenAddFolderDialog"></s-contextmenu-item>
                <!-- <s-contextmenu-item v-show="!currentOperationalNode || currentOperationalNode?.isFolder" label="以模板新建"></s-contextmenu-item> -->
                <s-contextmenu-item v-show="currentOperationalNode && currentOperationalNode.isFolder" type="divider"></s-contextmenu-item>
                <s-contextmenu-item v-show="currentOperationalNode" label="剪切" hot-key="Ctrl + X" @click="handleCutNode"></s-contextmenu-item>
                <s-contextmenu-item v-show="currentOperationalNode" label="复制" hot-key="Ctrl + C" @click="handleCopyNode"></s-contextmenu-item>
                <s-contextmenu-item v-show="currentOperationalNode && !currentOperationalNode.isFolder" label="生成副本" hot-key="Ctrl + V" @click="handleForkNode"></s-contextmenu-item>
                <s-contextmenu-item v-show="!currentOperationalNode || currentOperationalNode?.isFolder" label="粘贴" hot-key="Ctrl + V" :disabled="!pasteValue" @click="handlePasteNode"></s-contextmenu-item>
                <s-contextmenu-item v-show="currentOperationalNode" type="divider"></s-contextmenu-item>
                <s-contextmenu-item v-show="currentOperationalNode" label="重命名" hot-key="F2" @click="handleRenameNode"></s-contextmenu-item>
                <s-contextmenu-item v-show="currentOperationalNode" label="删除" hot-key="Delete" @click="handleDeleteNodes"></s-contextmenu-item>
            </s-contextmenu>
            <!-- 多个节点操作 -->
            <s-contextmenu v-if="showContextmenu && selectNodes.length > 1" :left="contextmenuLeft" :top="contextmenuTop">
                <s-contextmenu-item label="批量剪切" hot-key="Ctrl + X" @click="handleCutNode"></s-contextmenu-item>
                <s-contextmenu-item label="批量复制" hot-key="Ctrl + C" @click="handleCopyNode"></s-contextmenu-item>
                <s-contextmenu-item label="批量删除" hot-key="Delete" @click="handleDeleteNodes"></s-contextmenu-item>
            </s-contextmenu>
        </teleport>
    </s-resize-x>
    <s-add-file-dialog v-if="addFileDialogVisible" v-model="addFileDialogVisible" :pid="currentOperationalNode?._id" @success="handleAddFileAndFolderCb"></s-add-file-dialog>
    <s-add-folder-dialog v-if="addFolderDialogVisible" v-model="addFolderDialogVisible" :pid="currentOperationalNode?._id" @success="handleAddFileAndFolderCb"></s-add-folder-dialog>
</template>

<script lang="ts">
import { clipboard } from "electron"
import { defineComponent, computed, ref, Ref, onMounted, onUnmounted } from "vue"
import addFileDialog from "../dialog/add-file.vue"
import addFolderDialog from "../dialog/add-folder.vue"
import { ElMessage } from "element-plus"
import { useStore } from "@/store/index"
import type { ApidocBanner } from "@@/global"
import { useBannerData } from "./composables/banner-data"
import { deleteNode, addFileAndFolderCb, pasteNodes, forkNode, dragNode, renameNode } from "./composables/curd-node"
import { router } from "@/router/index"
import tool from "./tool/tool.vue"

type TreeNode = {
    data: ApidocBanner,
    nextSibling?: TreeNode
}

export default defineComponent({
    components: {
        "s-tool": tool,
        "s-add-file-dialog": addFileDialog,
        "s-add-folder-dialog": addFolderDialog,
    },
    setup() {
        /*
        |--------------------------------------------------------------------------
        | 变量、函数等内容声明
        | 获取banner数据
        | 获取项目基本信息
        |--------------------------------------------------------------------------
        */
        const store = useStore();
        const projectId = router.currentRoute.value.query.id;
        const pasteValue: Ref<ApidocBanner[] | null> = ref(null); //需要粘贴的数据
        const selectNodes: Ref<ApidocBanner[]> = ref([]); //当前选中节点
        const defaultExpandedKeys: Ref<string[]> = ref([]); //默认展开节点
        const editNode: Ref<ApidocBanner | null> = ref(null); //正在编辑的节点
        const showMoreNodeInfo = ref(false);  //banner是否显示更多内容
        const enableDrag = ref(true); //是否允许拖拽
       
        const { loading, bannerData, getBannerData } = useBannerData();
        const projectInfo = computed(() => {
            return store.state["apidoc/baseInfo"];
        });
        /*
        |--------------------------------------------------------------------------
        | 鼠标移动到banner节点，显示更多操作。
        | 鼠标右键显示更多操作
        | 鼠标左键选中节点
        | 判断显示是否允许粘贴
        | banner鼠标右键
        |--------------------------------------------------------------------------
        */
        const currentOperationalNode: Ref<ApidocBanner | null> = ref(null); //点击工具栏按钮或者空白处右键这个值为null
        const showContextmenu = ref(false); //是否显示contextmenu
        const contextmenuLeft = ref(0); //contextmenu left值
        const contextmenuTop = ref(0); //contextmenu top值

        const handleShowContextmenu = (e: MouseEvent, data: ApidocBanner) => {
            if (selectNodes.value.length < 2) { //处理单个节点
                selectNodes.value = [data];
            }
            const copyData = clipboard.readBuffer("moyu-apidoc-node").toString();
            pasteValue.value = copyData ? JSON.parse(copyData) : null;
            showContextmenu.value = true;
            contextmenuLeft.value = e.clientX;
            contextmenuTop.value = e.clientY;
            currentOperationalNode.value = data;
        }
        const handleWrapContextmenu = (e: MouseEvent) => {
            selectNodes.value = [];
            const copyData = clipboard.readBuffer("moyu-apidoc-node").toString();
            pasteValue.value = copyData ? JSON.parse(copyData) : null;
            currentOperationalNode.value = null;
            showContextmenu.value = true;
            contextmenuLeft.value = e.clientX;
            contextmenuTop.value = e.clientY;
        }
        /*
        |--------------------------------------------------------------------------
        | 鼠标右键或则点击更多按钮，对节点的 新增、修改、删除、复制、粘贴、拷贝、批量操作
        |--------------------------------------------------------------------------
        */
        const addFileDialogVisible = ref(false); //新增接口弹窗
        const addFolderDialogVisible = ref(false); //新增文件夹弹窗
        const pressCtrl = ref(false); //是否按住ctrl建委
        const handleNodeKeyUp = () => {
            pressCtrl.value = false;
        }
        //点击节点，如果按住ctrl则可以多选
        const handleClickNode = (e: MouseEvent, data: ApidocBanner) => {
            showContextmenu.value = false;
            currentOperationalNode.value = data;
            if (pressCtrl.value) {
                e.stopPropagation(); //如果按住ctrl键则阻止冒泡，防止点击文件夹展开
                const delIndex = selectNodes.value.findIndex((val) => val._id === data._id);
                if (delIndex !== -1) {
                    selectNodes.value.splice(delIndex, 1);
                } else {
                    selectNodes.value.push(data);
                }
            } else {
                selectNodes.value = [data];
                if (!data.isFolder) {
                    store.commit("apidoc/tabs/addTab", {
                        _id: data._id,
                        projectId,
                        tabType: "doc",
                        label: data.name,
                        saved: true,
                        fixed: false,
                        selected: true,
                    })
                }
            }
        }
        //双击节点固定这个节点
        const handleDbclickNode = (data: ApidocBanner) => {
            store.commit("apidoc/tabs/fixedTab", {
                _id: data._id,
                projectId,
            })
        }

        const handleNodeHover = (e: MouseEvent) => {
            if (!editNode.value) { //防止focus导致输入框失焦
                (e.currentTarget as HTMLElement).focus(); //使其能够触发keydown事件
            }
        }
        //打开新增文件弹窗
        const handleOpenAddFileDialog = () => {
            const childFileNodeNum = currentOperationalNode.value?.children.filter((v) => !v.isFolder).length || 0;
            if (!currentOperationalNode.value) { //在根节点操作,不作限制
                addFileDialogVisible.value = true;
            } else if (childFileNodeNum > projectInfo.value.rules.fileInFolderLimit) {
                ElMessage.warning(`单个文件夹里面文档个数不超过${childFileNodeNum}个`);
            } else {
                addFileDialogVisible.value = true;
            }
        }
        //打开新增文件夹弹窗
        const handleOpenAddFolderDialog = () => {
            addFolderDialogVisible.value = true;
        };
        //添加文件夹或文档成功回调函数
        const handleAddFileAndFolderCb = (data: ApidocBanner) => {
            addFileAndFolderCb.call(this, currentOperationalNode, data);
            defaultExpandedKeys.value.push(data._id);
        };
        //删除节点
        const handleDeleteNodes = () => {
            deleteNode.call(this, selectNodes.value);
        }
        //复制节点
        const handleCopyNode = () => {
            cutNodes.value = [];
            const buffer = Buffer.from(JSON.stringify(selectNodes.value), "utf8")
            clipboard.writeBuffer("moyu-apidoc-node", buffer)
        }
        //针对文件生成一份拷贝
        const handleForkNode = () => {
            forkNode.call(this, currentOperationalNode.value as ApidocBanner);
        }
        //剪切节点
        const cutNodes: Ref<ApidocBanner[]> = ref([]);
        const handleCutNode = () => {
            cutNodes.value = JSON.parse(JSON.stringify(selectNodes.value));
            const buffer = Buffer.from(JSON.stringify(selectNodes.value), "utf8")
            clipboard.writeBuffer("moyu-apidoc-node", buffer)
        }
        //粘贴节点
        const handlePasteNode = () => {
            if (currentOperationalNode.value && !currentOperationalNode.value.isFolder){ //只允许根元素或者文件夹粘贴
                return
            }
            const copyData = clipboard.readBuffer("moyu-apidoc-node").toString();
            pasteValue.value = copyData ? JSON.parse(copyData) : null;
            pasteNodes.call(this, currentOperationalNode, pasteValue.value as ApidocBanner[]).then(() => {
                if (cutNodes.value.length > 0) { //剪切节点
                    deleteNode.call(this, cutNodes.value, true);
                    cutNodes.value = [];
                } 
                if (currentOperationalNode.value) {
                    defaultExpandedKeys.value = [currentOperationalNode.value._id];
                }
            })
        }
        //判断是否允许拖拽节点
        const handleCheckNodeCouldDrop = (draggingNode: TreeNode, dropNode: TreeNode, type: "inner" | "prev") => {
            if (!draggingNode.data.isFolder && dropNode.nextSibling?.data.isFolder) { //不允许文件后面是文件夹
                return false;
            }
            if (!draggingNode.data.isFolder && dropNode.data.isFolder && type !== "inner") { //不允许文件在文件夹前面
                return type !== "prev";
            }
            if (draggingNode.data.isFolder && !dropNode.data.isFolder) {
                return false;
            }
            if (!dropNode.data.isFolder) {
                return type !== "inner";
            }
            return true;
        }
        //拖拽节点
        const handleNodeDropSuccess = (draggingNode: TreeNode, dropNode: TreeNode, type: "before" | "after" | "inner") => {
            dragNode.call(this, draggingNode.data, dropNode.data, type);
            if (type === "inner") {
                defaultExpandedKeys.value = [dropNode.data._id];
            }
        };
        //重命名节点
        const handleRenameNode = () => {
            editNode.value = currentOperationalNode.value;
            setTimeout(() => {
                (document.querySelector(".rename-ipt") as HTMLElement).focus();
                enableDrag.value = false;
            })
        }
        const handleChangeNodeName = (e: FocusEvent | KeyboardEvent, data: ApidocBanner) => {
            renameNode.call(this, e, data);
            editNode.value = null;
            enableDrag.value = true;
        }
        const handleWatchNodeInput = (e: Event) => {
            const iptValue = (e.target as HTMLInputElement).value;
            if (iptValue.trim() === "") {
                (e.target as HTMLInputElement).classList.add("error");
            } else {
                (e.target as HTMLInputElement).classList.remove("error");
            }
        }
        
        /*
        |--------------------------------------------------------------------------
        | 其他操作
        |--------------------------------------------------------------------------
        | 1. 清空事件绑定
        | 2. 处理全局点击某些弹窗隐藏
        | 3. 快捷键处理
        |
        */
        //处理节点上面键盘事件
        const handleNodeKeydown = (e: KeyboardEvent) => {
            if (e.code === "ControlLeft" || e.code === "ControlRight") {
                pressCtrl.value = true;
            }
            if (e.code === "F2") {
                handleRenameNode()
            } else if (e.ctrlKey && (e.key === "D" || e.key === "d")) {
                handleDeleteNodes();
            } else if (e.ctrlKey && (e.key === "C" || e.key === "c")) {
                handleCopyNode();
            } else if (e.ctrlKey && (e.key === "V" || e.key === "v")) {
                handlePasteNode();
            } else if (e.ctrlKey && (e.key === "X" || e.key === "x")) {
                handleCutNode();
            }
        }
        const handleGlobalClick = () => {
            showContextmenu.value = false;         
            selectNodes.value = [];
        }
        onMounted(() => {
            document.documentElement.addEventListener("click", handleGlobalClick);
        })
        onUnmounted(() => {
            document.documentElement.removeEventListener("click", handleGlobalClick);
        })

        return {
            projectInfo,
            bannerData,
            loading,
            editNode,
            showMoreNodeInfo,
            enableDrag,
            selectNodes,
            cutNodes,
            pasteValue,
            showContextmenu,
            contextmenuLeft,
            contextmenuTop,
            currentOperationalNode,
            addFileDialogVisible,
            addFolderDialogVisible,
            defaultExpandedKeys,
            getBannerData,
            handleClickNode,
            handleShowContextmenu,
            handleOpenAddFileDialog,
            handleOpenAddFolderDialog,
            handleAddFileAndFolderCb,
            handleDeleteNodes,
            handleCopyNode,
            handlePasteNode,
            handleWrapContextmenu,
            handleNodeKeydown,
            handleNodeKeyUp,
            handleNodeHover,
            handleCutNode,
            handleForkNode,
            handleCheckNodeCouldDrop,
            handleNodeDropSuccess,
            handleRenameNode,
            handleChangeNodeName,
            handleWatchNodeInput,
            handleDbclickNode,
        };
    },
})
</script>

<style lang="scss">
.banner {
    flex: 0 0 auto;
    height: 100%;
    border-right: 1px solid $gray-400;
    display: flex;
    flex-direction: column;
    position: relative;
    //树形组件包裹框
    .tree-wrap {
        height: calc(100vh - #{size(150)});
        overflow-y: auto;
    }
    //拖拽指示器样式
    .el-tree-node.is-drop-inner {
        background: mix($theme-color, $white, 70%);
        .custom-tree-node.select-node {
            background-color: mix($theme-color, $white, 70%);
        }
    }
    .el-tree__drop-indicator {
        height: size(3);
    }
    // 自定义节点
    .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        overflow: hidden;
        min-height: size(30);
        &:hover {
            .more {
                display: block;
            }
        }
        .file-icon {
            font-size: fz(14);
            margin-right: size(5);
        }
        .folder-icon {
            color: $yellow;
            flex: 0 0 auto;
            width: size(16);
            height: size(16);
            margin-right: size(5);
        }
        .node-label-wrap {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
            .node-top {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .node-bottom {
                color: $gray-500;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        //重命名输入框
        .rename-ipt {
            flex: 0 0 75%;
            height: size(22);
            border: 1px solid $theme-color;
            font-size: 1em;
            margin-left: -1px;
            &.error {
                border: 2px solid $red;
            }
        }
        .more {
            display: none;
            flex: 0 0 auto;
            margin-left: auto;
            padding: size(5) size(10);
        }
        &.select-node {
            background-color: lighten($theme-color, 30%);
        }
        &.cut-node {
            color: $gray-500;
            .file-icon {
                color: $gray-500!important;
            }
            .folder-icon {
                color: $gray-300!important;
            }
        }
    }
    // 禁用动画提高性能
    .collapse-transition {
        transition: none;
    }
    // 节点展示更多信息
    .show-more {
        .el-tree-node__content {
            align-items: flex-start;
            &>.el-tree-node__expand-icon {
                padding-top: size(4);
            }
        }
        .custom-tree-node {
            align-items: flex-start;
        }
        .file-icon {
            margin-top: size(2);
        }
    }
    .el-tree-node__content {
        height: auto;
        display: flex;
        align-items: center;
    }
    .el-tree-node__content>.el-tree-node__expand-icon {
        transition: none; //去除所有动画
        padding-top: 0;
        padding-bottom: 0;
        margin-top: -1px;
    }
}
.banner-popover {
    .op-item {
        @include contextmenu-item;
    }
}
</style>
