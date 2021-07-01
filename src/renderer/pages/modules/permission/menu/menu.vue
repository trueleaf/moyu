/*
    创建者：shuxiaokai
    创建时间：2021-06-30 22:46
    模块名称：菜单维护
    备注：
*/
<template>
    <s-left-right>
        <template #left>
            <s-loading :loading="loading">
                <s-card title="菜单列表" class="menu-tree">
                    <template #operation>
                        <el-button size="mini" type="text" @click="handleOpenAddDialog">新增</el-button>
                    </template>
                    <el-tree
                        ref="tree"
                        :data="treeData"
                        node-key="id"
                        :draggable="true"
                        empty-text="暂无数据"
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
                                <div>
                                    <img :src="require('@/assets/imgs/apidoc/file.png')" width="14" height="14" class="mr-2" />
                                    <span>{{ data.name }}</span>
                                </div>
                                <el-dropdown
                                    ref="dropdown"
                                    class="ml-auto mr-2"
                                    trigger="click"
                                    @command="handleSelectDropdown"
                                    @click.stop="() =>{}"
                                >
                                    <span class="el-icon-more"></span>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item :command="{ type: 'addMenu', data, }">新增菜单</el-dropdown-item>
                                            <el-dropdown-item :command="{ type: 'delete', data, }">删除</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                        </template>
                    </el-tree>
                </s-card>
            </s-loading>
        </template>
        <template #right>
            aaa
        </template>
    </s-left-right>
    <s-add-menu-dialog v-if="addMenuDialogVisible" v-model="addMenuDialogVisible" :pid="parentId" @success="getData"></s-add-menu-dialog>
</template>

<script lang="ts">
import { defineComponent, VNode } from "vue"
import { Response, ResClientMenu } from "@@/global"
import addMenuDialog from "./add/add.vue"

export default defineComponent({
    components: {
        "s-add-menu-dialog": addMenuDialog,
    },
    data() {
        return {
            //=====================================树形组件====================================//
            treeData: [] as ResClientMenu[],
            mouseContext: null as VNode | null, //鼠标右键实例
            parentId: "", //当前操作元素父元素id
            currentActiveNode: null, //当前被选中的元素
            defaultExpandKeys: [] as string[], //默认展开组件
            //=====================================其他参数====================================//
            loading: false, //菜单加载
            addMenuDialogVisible: false,
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
        //初始化事件
        removeContextmenu() {
            if (this.mouseContext) {
                // document.body.removeChild(this.mouseContext.$el);
                this.mouseContext = null;
            }
        },
        //获取树形菜单结构
        getData() {
            this.loading = true;
            this.axios.get<Response<ResClientMenu[]>, Response<ResClientMenu[]>>("/api/security/client_menu_tree").then((res) => {
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
        //下拉选择操作类型
        handleSelectDropdown(command: { type: "newMenu" | "delete", data: ResClientMenu }) {
            switch (command.type) {
            case "newMenu":
                this.handleOpenAddDialog();
                this.parentId = command.data._id;
                break;
            case "delete":
                this.deleteCurrentNode(command.data);
                break;
            default:
                break;
            }
        },
        //删除节点
        deleteCurrentNode(data: ResClientMenu) {
            const cpData = JSON.parse(JSON.stringify(data));
            const ids = [cpData._id];
            this.$helper.forEachForest(cpData.children, (val) => {
                ids.push(val._id);
            })
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = {
                    ids,
                };
                this.axios.delete("/api/security/client_menu", { data: params }).then(() => {
                    this.getData();
                    this.currentActiveNode = null;
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
        handleNodeDropSuccess() {
            console.log(22)
        },
        //点击节点
        handleNodeClick(data: string) {
            console.log(data)
            // this.currentActiveNode = data;
            // this.defaultExpandKeys.push(data._id);
        },
        //contextmenu
        handleContextmenu() {
            console.log(3)
        },
        //清除鼠标右键dom节点信息
        clearContextNode() {
            // if (this.mouseContext) {
            //     document.body.removeChild(this.mouseContext.$el);
            //     this.mouseContext = null;
            // }
        },

        handleOpenAddDialog() {
            this.parentId = "";
            this.addMenuDialogVisible = true;
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
    }
}
</style>
