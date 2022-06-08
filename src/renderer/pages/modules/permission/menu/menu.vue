/*
    创建者：shuxiaokai
    创建时间：2021-06-30 22:46
    模块名称：菜单维护
    备注：
*/
<template>
    <s-left-right :left-width="500">
        <template #left>
            <s-loading :loading="loading">
                <s-card :title="$t('菜单列表')" class="menu-tree">
                    <template #operation>
                        <el-button link type="primary" text @click="handleOpenAddDialog()">{{ $t("新增") }}</el-button>
                        <el-button link type="primary" text @click="getData">{{ $t("刷新") }}</el-button>
                    </template>
                    <el-tree
                        ref="tree"
                        :data="treeData"
                        node-key="id"
                        :draggable="true"
                        :empty-text="$t('暂无数据')"
                        :expand-on-click-node="false"
                        :default-expanded-keys="defaultExpandKeys"
                        @node-drop="handleNodeDropSuccess"
                        @node-expand="clearContextNode"
                        @node-collapse="clearContextNode"
                        @current-change="clearContextNode"
                        @node-click="handleNodeClick"
                        @node-contextmenu="handleContextmenu"
                    >
                        <template #default="{ data }">
                            <div class="tree-node">
                                <div class="label">
                                    <img :src="require('@/assets/imgs/apidoc/file.png')" width="14" height="14" class="mr-2" />
                                    <span>{{ data.name }}</span>
                                </div>
                                <div class="ml-auto mr-2">
                                    <el-button link type="primary" text @click.stop="handleOpenAddDialog(data)">{{ $t("新增子菜单") }}</el-button>
                                    <el-divider direction="vertical"></el-divider>
                                    <el-button link type="primary" text @click.stop="handleOpenEditDialog(data)">{{ $t("编辑") }}</el-button>
                                    <el-divider direction="vertical"></el-divider>
                                    <el-button link type="primary" text @click.stop="handleDeleteCurrentNode(data)">{{ $t("删除") }}</el-button>
                                </div>
                            </div>
                        </template>
                    </el-tree>
                </s-card>
            </s-loading>
        </template>
        <template #right>
            <ul>
                <li>{{ $t("支持鼠标右键新增和编辑菜单") }}</li>
                <li>{{ $t("菜单可以进行拖拽排序") }}</li>
            </ul>
        </template>
    </s-left-right>
    <teleport to="body">
        <div v-if="currentCtxNode" ref="contextmenu" class="contextmenu" :style="{left: ctxLeft + 'px', top: ctxTop + 'px'}">
            <div class="item-list" @click="handleOpenAddDialog(currentCtxNode)">{{ $t("新增子菜单") }}</div>
            <div class="item-list" @click="handleOpenEditDialog(currentCtxNode)">{{ $t("编辑") }}</div>
            <div class="item-list" @click="handleDeleteCurrentNode(currentCtxNode)">{{ $t("删除") }}</div>
        </div>
    </teleport>
    <s-add-menu-dialog v-if="addMenuDialogVisible" v-model="addMenuDialogVisible" :pid="parentId" @success="handleAddSuccess"></s-add-menu-dialog>
    <s-edit-menu-dialog v-if="editMenuDialogVisible" v-model="editMenuDialogVisible" :data="currentEditNode" @success="getData"></s-edit-menu-dialog>
</template>

<script lang="ts">
import type { Response, PermissionClientMenu } from "@@/global"
import { defineComponent } from "vue"
import Node from "element-plus/lib/components/tree/src/model/node"
import addMenuDialog from "./add/add.vue"
import editMenuDialog from "./edit/edit.vue"

type TreeNode = Node & {
    data: PermissionClientMenu,
}

export default defineComponent({
    components: {
        "s-add-menu-dialog": addMenuDialog,
        "s-edit-menu-dialog": editMenuDialog,
    },
    data() {
        return {
            //=====================================树形组件====================================//
            treeData: [] as PermissionClientMenu[], //-----------------菜单数据
            defaultExpandKeys: [] as string[], //---------------默认展开组件
            currentEditNode: null as PermissionClientMenu | null, //---当前编辑的节点
            //=====================================鼠标右键====================================//
            ctxLeft: 0, //--------------------------------------鼠标右键left值
            ctxTop: 0, //---------------------------------------鼠标右键top值
            currentCtxNode: null as PermissionClientMenu | null, //----当前鼠标右键节点信息
            //=====================================其他参数====================================//
            parentId: "", //------------------------------------父元素id
            addMenuDialogVisible: false, //---------------------新增菜单弹窗
            editMenuDialogVisible: false, //--------------------编辑菜单弹窗
            loading: false, //----------------------------------菜单加载
        };
    },
    mounted() {
        this.getData();
        document.body.addEventListener("click", this.removeContextmenu);
    },
    beforeUnmount() {
        document.body.removeEventListener("click", this.removeContextmenu);
    },
    methods: {
        //=====================================数据获取====================================//
        //获取树形菜单结构
        getData() {
            this.loading = true;
            this.axios.get<Response<PermissionClientMenu[]>, Response<PermissionClientMenu[]>>("/api/security/client_menu_tree").then((res) => {
                this.$helper.forEachForest(res.data, (val) => {
                    val.id = val._id;
                })
                this.treeData = res.data;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================节点增删改查====================================//
        //打开修改弹窗
        handleOpenEditDialog(data: PermissionClientMenu | null) {
            if (data === null) {
                this.$message.warning(this.$t("参数值不能为null"));
                return
            }
            this.editMenuDialogVisible = true;
            this.currentEditNode = data;
        },
        //打开新增弹窗
        handleOpenAddDialog(data?: PermissionClientMenu | null) {
            this.parentId = data ? data._id : "";
            this.addMenuDialogVisible = true;
        },
        //删除节点
        handleDeleteCurrentNode(data: PermissionClientMenu | null) {
            if (data === null) {
                this.$message.warning(this.$t("参数值不能为null"));
                return
            }
            const cpData = JSON.parse(JSON.stringify(data));
            const ids = [cpData._id];
            this.$helper.forEachForest(cpData.children || [], (val) => {
                ids.push(val._id);
            })
            this.$confirm(this.$t("此操作将永久删除此条记录, 是否继续?"), this.$t("提示"), {
                confirmButtonText: this.$t("确定"),
                cancelButtonText: this.$t("取消"),
                type: "warning",
            }).then(() => {
                const params = {
                    ids,
                };
                this.axios.delete("/api/security/client_menu", { data: params }).then(() => {
                    this.getData();
                    // this.currentEditNode = null;
                }).catch((err) => {
                    console.error(err);
                });
            }).catch((err: Error | string) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                console.error(err);
            });
        },
        //=====================================节点操作====================================//
        //拖拽成功
        handleNodeDropSuccess(node: TreeNode, dropNode: TreeNode, type: "inner" | "before" | "after") {
            const params = {
                _id: node.data._id, //当前节点id
                pid: "", //父元素
                sort: 0, //当前节点排序效果
            };
            const nodeIsSameLevel = node.level === dropNode.level;
            let pNode = null;
            if ((!nodeIsSameLevel) || (nodeIsSameLevel && type === "inner")) { //将节点放入子节点中
                pNode = this.$helper.findParentById(this.treeData, node.data._id);
                params.pid = pNode ? pNode._id : "";
                while (pNode != null) {
                    pNode = this.$helper.findParentById(this.treeData, pNode._id);
                }
            } else if (nodeIsSameLevel && type !== "inner") {
                params.pid = node.data.pid || "";
                pNode = this.$helper.findParentById(this.treeData, node.data._id);
                while (pNode != null) {
                    pNode = this.$helper.findParentById(this.treeData, pNode._id);
                }
            }
            if (type === "after") { //说明这个节点是第一个节点
                params.sort = dropNode.data.sort - 1;
            } else if (type === "before") {
                params.sort = dropNode.data.sort + 1;
            } else if (type === "inner") {
                params.sort = Date.now();
            }
            this.axios.put("/api/security/client_menu_position", params).catch((err) => {
                console.error(err);
            });
        },
        //点击节点
        handleNodeClick(data: string) {
            console.log(data)
            // this.currentEditNode = data;
            // this.defaultExpandKeys.push(data._id);
        },
        //处理contextmenu事件
        handleContextmenu(e: MouseEvent, treeData: PermissionClientMenu) {
            this.ctxLeft = e.clientX;
            this.ctxTop = e.clientY;
            this.currentCtxNode = treeData;
        },
        //清除鼠标右键dom节点信息
        clearContextNode() {
            this.currentCtxNode = null;
        },
        //=========================================================================//
        handleAddSuccess(id: string) {
            this.defaultExpandKeys.push(id); //展开刚刚新增的元素
            this.getData();
        },
        //移除contextmenu
        removeContextmenu() {
            this.currentCtxNode = null;
        },
    },
})
</script>

<style lang="scss">
.menu-tree {
    min-height: 70vh;
    .el-tree-node__content {
        height: size(30);
    }
    .tree-node {
        width: 100%;
        height: size(30);
        display: flex;
        align-items: center;
        overflow: hidden;
        .label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
.contextmenu {
    min-width: size(240);
    @include contextmenu;
}
</style>
