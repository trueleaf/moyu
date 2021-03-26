/*
    创建者：shuxiaokai
    创建时间：2021-03-22 11:12
    模块名称：
    备注：
*/
<template>
    <s-fieldset title="将当前项目指定文档导出到其他项目" class="fork">
        <div>
            <span class="el-icon-info mr-1"></span>
            <span>从左侧拖拽文档到右侧，右侧也可以进行简单的拖拽</span>
        </div>
        <el-divider></el-divider>
        <!-- 选择区域 -->
        <div v-flex1="80" class="fork-wrap">
            <div class="left">
                <el-tree
                        ref="docTree"
                        :data="sourceTreeData"
                        node-key="_id"
                        draggable
                        :allow-drop="() => false"
                        @node-drag-over="handleSourceNodeDragOver"
                        @node-drag-start="handleSourceDragstart"
                        @node-drag-end="handleSourceDragend"
                        :expand-on-click-node="true"
                >
                    <template slot-scope="scope">
                        <div
                                class="custom-tree-node"
                                tabindex="0"
                                slot="reference"
                        >
                            <!-- file渲染 -->
                            <template v-if="!scope.data.isFolder">
                                <template v-for="(req) in validRequestMethods">
                                    <span v-if="scope.data.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toLowerCase() }}</span>
                                </template>
                                <span class="node-name ml-1">{{ scope.data.name }}</span>
                            </template>
                            <!-- 文件夹渲染 -->
                            <template v-if="scope.data.isFolder">
                                <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px"/>
                                <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                            </template>
                        </div>
                    </template>
                </el-tree>
            </div>
            <div ref="target" class="right">
                <div>
                    <el-radio-group v-model="projectId" size="mini" @change="handleChangeProject">
                        <el-radio v-for="(item, index) in projectEnum" :key="index" :label="item._id">{{ item.projectName }}</el-radio>
                    </el-radio-group>
                    <s-loading :loading="loading" class="project-nav mt-2">
                        <el-tree
                            ref="mountedTree"
                            :data="targetTreeData"
                            node-key="_id"
                            draggable
                            :allow-drop="checkTargetCouldDrop"
                            @node-contextmenu="handleContextmenu"
                            @node-drag-over="handleTargetNodeDragOver"
                            @node-drag-start="handleTargetDragStart"
                            @node-drop="handleTargetDrop"
                            @node-expand="clearContextmenu"
                            @node-collapse="clearContextmenu"
                            :expand-on-click-node="true"
                            empty-text="暂无文档，请在项目中添加至少一个文档"
                        >
                            <template slot-scope="scope">
                                <div
                                        class="custom-tree-node"
                                        tabindex="1"
                                        slot="reference"
                                >
                                    <!-- 文件夹渲染 -->
                                    <template v-if="scope.data.isFolder">
                                        <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px"/>
                                        <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                                    </template>
                                    <!-- file渲染 -->
                                    <template v-if="!scope.data.isFolder">
                                        <template v-for="(req) in validRequestMethods">
                                            <span v-if="scope.data.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toLowerCase() }}</span>
                                        </template>
                                        <span class="node-name ml-1">{{ scope.data.name }}</span>
                                    </template>
                                </div>
                            </template>
                        </el-tree>
                    </s-loading>
                </div>
            </div>
        </div>
        <s-add-folder-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :projectId="projectId" :pid="targetAddFolderMountedId" @success="handleAddFileAndFolderCb"></s-add-folder-dialog>
    </s-fieldset>
</template>

<script>
import Vue from "vue";
import addFolderDialog from "@/pages/modules/apidoc/doc-edit/dialog/add-folder.vue";
import contextmenu from "./contextmenu.vue";

export default {
    components: {
        "s-add-folder-dialog": addFolderDialog,
    },
    data() {
        return {
            //===================================枚举参数====================================//
            projectEnum: [], //----------项目枚举信息
            //===================================业务参数====================================//
            targetTreeData: [], //-------其他项目导航菜单信息
            isDragSource: false, //------是拖拽源树
            isInSource: false, //--------是否在源树中，如果在则取消拖拽到目标树事件
            targetAddFolderMountedId: null, //目标节点新建文件夹挂载点
            defaultExpandedKeys: [], //--默认展开数据
            //===================================其他参数====================================//
            dialogVisible: false, //-----新建文件夹弹窗
            contextmenu: null, //--------右键弹窗
            projectId: "", //------------项目id
            loading: false, //-----------项目导航加载
        };
    },
    computed: {
        sourceTreeData() { //-------树形导航数据
            const copyData = JSON.parse(JSON.stringify(this.$store.state.apidoc.banner));
            this.$helper.forEachForest(copyData, (data) => {
                this.$set(data, "_isSource", true);
            });
            return copyData;
        },
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
        currentSelectDoc() { //--当前选中的文档
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
    },
    mounted() {
        this.getProjectEnum();
        this.init();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //初始化
        init() {
            document.documentElement.addEventListener("click", () => {
                this.clearContextmenu();
            });
            this.$refs.target.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                this.targetAddFolderMountedId = null;
                this.clearContextmenu(); //清除contextmenu
                const ContextmenuConstructor = Vue.extend(contextmenu);
                const x = e.clientX; //当前点击位置
                const y = e.clientY; //当前点击位置
                const operations = ["folder"];
                this.contextmenu = new ContextmenuConstructor({
                    propsData: {
                        operations,
                        left: x,
                        top: y,
                    },
                }).$mount();
                document.body.appendChild(this.contextmenu.$el);
                this.contextmenu.$on("folder", () => {
                    this.dialogVisible = true;
                })
            })
        },
        //获取项目枚举
        getProjectEnum() {
            this.axios.get("/api/project/project_enum").then((res) => {
                this.projectEnum = res.data.filter((val) => val._id !== this.$route.query.id); //过滤掉当前项目
                if (this.projectEnum.length > 0) {
                    this.projectId = this.projectEnum[0]._id;
                    this.handleChangeProject(this.projectEnum[0]._id);
                }
            }).catch((err) => {
                console.error(err);
            });
        },
        //=====================================互相拖拽====================================//
        //当前节点拖拽开始,开启target树的拖拽开始
        handleSourceDragstart(node, event) {
            this.$refs.mountedTree.$emit("tree-node-drag-start", event, { node });
        },
        //在源树上面拖拽代表取消拖拽
        handleSourceNodeDragOver() {
            this.isInSource = true;
        },
        //在目标树上拖拽
        handleTargetNodeDragOver() {
            this.isInSource = false;
        },
        // 参考：https://blog.csdn.net/qq_41694291/article/details/108631887
        //当前节点拖拽结束
        handleSourceDragend(draggingNode, dropNode, position, event) {
            // 插入一个空节点用于占位
            const emptyData = {
                _id: Math.random(),
            };
            this.$refs.docTree.insertBefore(emptyData, draggingNode);
            this.$refs.mountedTree.$emit("tree-node-drag-end", event);
            this.$nextTick(() => {
                if (this.$refs.docTree.getNode(draggingNode.data)) { //没有在挂载点完成拖拽
                    this.$refs.docTree.remove(emptyData);
                } else { //在挂载点完成拖拽
                    const data = JSON.parse(JSON.stringify(draggingNode.data));
                    data._id2 = data._id2 || data._id;
                    data._id = this.$helper.uuid();
                    data._isSource = true; //当前节点还原为source
                    this.$refs.docTree.insertAfter(data, this.$refs.docTree.getNode(emptyData));
                    this.$refs.docTree.remove(emptyData);
                }
            })
        },
        //挂载点判断是否允许drop
        checkTargetCouldDrop(draggingNode, dropNode, type) {
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
        },
        //挂载点开始拖拽,非手动触发事件
        handleTargetDragStart() {
        },
        //挂载点拖拽成功
        handleTargetDrop(dragNode, dropNode, type) {
            if (this.isInSource) { //拖拽到目标节点又拖拽回源节点代表取消
                this.$refs.mountedTree.remove(dragNode.data);
                return;
            }
            let targetNodeSort = Date.now();
            const { _isSource } = dragNode.data;
            if (_isSource) { //从源树拖拽到目标树
                let targetMountedId = null;
                const dropNodeId = dropNode.data._id2 || dropNode.data._id;
                const dragNodeId = dragNode.data._id2 || dragNode.data._id;
                if (type === "inner") { //拖放至内部则选择dropNode
                    targetMountedId = dropNodeId;
                } else {
                    const dropNodeParentNode = this.$helper.findParentNodeById(this.targetTreeData, dropNodeId, { id: "_id" });
                    const nextSibling = this.$helper.findNextSiblingById(this.targetTreeData, dragNodeId, { id: "_id" }) || {};
                    const previousSibling = this.$helper.findPreviousSiblingById(this.targetTreeData, dragNodeId, { id: "_id" }) || {};
                    const previousSiblingSort = previousSibling.sort || 0;
                    const nextSiblingSort = nextSibling.sort || Date.now();
                    targetNodeSort = (nextSiblingSort + previousSiblingSort) / 2;
                    dropNode.data.sort = (nextSiblingSort + previousSiblingSort) / 2;
                    if (dropNodeParentNode) { //非根节点
                        targetMountedId = dropNodeParentNode._id;
                    }
                }
                const selectedDocIds = [];
                this.$helper.forEachForest([dragNode.data], (data) => {
                    selectedDocIds.push(data._id2 || data._id);
                });
                const params = {
                    sourceRootId: dragNode.data._id2 || dragNode.data._id, //源节点根id
                    selectedDocIds, //需要挂载的节点ids
                    sourceProjectId: this.$route.query.id, //源项目id
                    targetProjectId: this.projectId, //目标项目id
                    targetMountedId, //目标挂载节点id
                    targetNodeSort,
                };
                this.axios.post("/api/project/export/fork", params).then(() => {
                    this.$message.success("导入成功");
                }).catch((err) => {
                    console.error(err);
                });
            } else { //目标树内自己拖拽，调用排序而不是新增
                // console.log("目标树内自己拖拽")
                this.sortTargetTree(dragNode, dropNode, type);
            }
            dragNode.data._isSource = false;
        },
        //排序目标树
        sortTargetTree(node, dropNode, type) {
            const params = {
                _id: node.data._id, //当前节点id
                pid: "", //父元素
                sort: 0, //当前节点排序效果
                projectId: this.projectId,
                dropInfo: {
                    nodeName: node.data.name,
                    nodeId: node.data._id,
                    dropNodeName: dropNode.data.name,
                    dropNodeId: dropNode.data._id,
                    dropType: type,
                },
            };
            const pData = this.$helper.findParentNodeById(this.targetTreeData, node.data._id, { id: "_id" });
            params.pid = pData ? pData._id : "";
            if (type === "inner") {
                params.sort = Date.now();
            } else {
                const nextSibling = this.$helper.findNextSiblingById(this.targetTreeData, node.data._id, { id: "_id" }) || {};
                const previousSibling = this.$helper.findPreviousSiblingById(this.targetTreeData, node.data._id, { id: "_id" }) || {};
                const previousSiblingSort = previousSibling.sort || 0;
                const nextSiblingSort = nextSibling.sort || Date.now();
                params.sort = (nextSiblingSort + previousSiblingSort) / 2;
                node.data.sort = (nextSiblingSort + previousSiblingSort) / 2;
            }
            this.axios.put("/api/project/change_doc_pos", params).then(() => {}).catch((err) => {
                this.$errorThrow(err, this);
            });
        },
        //=====================================组件间交互====================================//
        //改变项目信息重新获取项目导航数据
        handleChangeProject(projectId) {
            this.mountedNode = null; //切换项目挂载节点清空
            this.loading = true;
            const params = {
                projectId,
            };
            this.axios.get("/api/project/doc_tree_folder_node", { params }).then((res) => {
                this.targetTreeData = res.data;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================右键删除文档====================================//
        //创建鼠标右键dom元素
        handleContextmenu(e, data, node) {
            e.stopPropagation();
            this.clearContextmenu(); //清除contextmenu
            // console.log(contextmenu)
            const ContextmenuConstructor = Vue.extend(contextmenu);
            const x = e.clientX; //当前点击位置
            const y = e.clientY; //当前点击位置
            const operations = ["delete", "folder"];
            this.contextmenu = new ContextmenuConstructor({
                propsData: {
                    operations,
                    left: x,
                    top: y,
                },
            }).$mount();
            document.body.appendChild(this.contextmenu.$el);
            this.contextmenu.$on("folder", () => {
                this.targetAddFolderMountedId = data._id;
                this.dialogVisible = true;
            })
            this.contextmenu.$on("delete", () => {
                this.handleDeleteItem(data, node);
            })
        },
        //删除某一项
        handleDeleteItem(data, node) {
            const deleteIds = [];
            deleteIds.push(data._id); //删除自己
            if (data.isFolder) { //删除所有子元素
                this.$helper.forEachForest(data.children, (item) => {
                    deleteIds.push(item._id);
                });
            }
            this.$confirm(`此操作将永久删除 ${data.name} 节点, 是否继续?`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.axios.delete("/api/project/doc", { data: { projectId: this.projectId, ids: deleteIds } }).then(() => {
                    const pNode = node.parent;
                    if (pNode && pNode.level !== 0) {
                        const nodeIndex = pNode.data.children.findIndex((val) => val._id === data._id);
                        pNode.data.children.splice(nodeIndex, 1)
                    } else {
                        const nodeIndex = this.targetTreeData.findIndex((val) => val._id === data._id);
                        this.targetTreeData.splice(nodeIndex, 1);
                    }
                }).catch((err) => {
                    this.$errorThrow(err, this);
                });
            }).catch((err) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        //添加文件夹或文档成功回调函数
        handleAddFileAndFolderCb(data) {
            const pNode = this.$helper.findNodeById(this.targetTreeData, this.targetAddFolderMountedId, { id: "_id" });
            if (!pNode) { //插入到根元素
                if (data.type === "folder") { //如果是文件夹则放在第一位
                    let folderIndex = -1;
                    for (let i = 0, len = this.targetTreeData.length; i < len; i += 1) {
                        if (!this.targetTreeData[i].isFolder) {
                            this.targetTreeData.splice(i, 0, data);
                            folderIndex = i;
                            break;
                        }
                    }
                    if (folderIndex === -1) { //不存在文件则直接添加到末尾
                        this.targetTreeData.push(data);
                    }
                } else { //如果是文本
                    this.targetTreeData.push(data);
                }
            } else { //插入到文件夹里面
                if (!pNode.children) {
                    this.$set(pNode, "children", []);
                }
                if (data.type === "folder") { //如果是文件夹则放在第一位
                    this.defaultExpandedKeys.push(data._id);
                    let folderIndex = -1;
                    for (let i = 0, len = pNode.children.length; i < len; i += 1) {
                        if (!pNode.children[i].isFolder) {
                            pNode.children.splice(i, 0, data);
                            folderIndex = i;
                            break;
                        }
                    }
                    if (folderIndex === -1) { //不存在文件则直接添加到末尾
                        pNode.children.push(data);
                    }
                } else {
                    pNode.children.push(data);
                }
            }
        },
        //=====================================其他操作=====================================//
        //清除contextmenu
        clearContextmenu() {
            if (this.contextmenu) {
                document.body.removeChild(this.contextmenu.$el);
                this.contextmenu = null;
            }
        },

    },
};
</script>

<style lang="scss">
.fork {
    .el-divider--horizontal {
        margin: size(10) 0;
    }
    .fork-wrap {
        display: flex;
        .left {
            flex: 0 0 50%;
            border-right: 1px solid $gray-300;
            .custom-tree-node {
                @include custom-tree-node;
            }
        }
        .right {
            flex: 1;
            padding: 0 size(15);
            .custom-tree-node {
                @include custom-tree-node;
            }
        }
    }
}

</style>
