/*
    创建者：shuxiaokai
    创建时间：2021-03-22 11:12
    模块名称：
    备注：
*/
<template>
    <s-fieldset title="将当前项目指定文档导出到其他项目" class="fork">
        <!-- 描述信息 -->
        <!-- <div>
            <span>当前选择文档数：</span>
            <span v-if="allCheckedNodes.length > 0">{{ allCheckedNodes.length }}</span>
            <span v-else class="orange">未选择</span>
            <el-divider direction="vertical"></el-divider>
            <span>当前选择挂载点：</span>
            <span v-if="!mountedNode" class="orange">未选择</span>
            <span v-else>{{ mountedNode.name }}</span>
        </div>
        <el-divider></el-divider> -->
        <!-- 选择区域 -->
        <div v-flex1="80" class="fork-wrap">
            <div class="left">
                <div class="mb-2 f-base">第一步：选择需要导出的文档</div>
                <el-tree
                        ref="docTree"
                        :data="sourceTreeData"
                        node-key="_id"
                        draggable
                        :allow-drop="() => false"
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
            <div class="right">
                <div>
                    <div class="mb-2 f-base">第二步：选择需要挂载的文件夹</div>
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
                            @node-drag-start="handleTargetDragStart"
                            @node-drop="handleTargetDrop"
                            :expand-on-click-node="true"
                            empty-text="请在上方选择项目挂载"
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
    </s-fieldset>
</template>

<script>
export default {
    data() {
        return {
            //===================================枚举参数====================================//
            projectEnum: [], //---------项目枚举信息
            //===================================业务参数====================================//
            targetTreeData: [], //-----其他项目导航菜单信息
            isDragSource: false, //------是拖拽源树
            //===================================其他参数====================================//
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
    created() {
        this.getProjectEnum();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
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
            console.log(JSON.parse(JSON.stringify(dragNode.data)))
            // console.log(dragNode.data._id2 || dragNode.data._id, dropNode.data, type);
            const { _isSource } = dragNode.data;
            if (_isSource) { //从源树拖拽到目标树
                if (type === "inner") { //拖放至内部则选择dropNode
                    const targetMountedId = dropNode.data._id;
                    const sourceDocIds = [];
                    this.$helper.forEachForest([dragNode.data], (data) => {
                        sourceDocIds.push(data._id);
                    });
                    const params = {
                        sourceRootId: dragNode.data._id, //源节点根id
                        sourceDocIds, //需要挂载的节点ids
                        sourceProjectId: this.$route.query.id, //源项目id
                        targetProjectId: this.projectId, //目标项目id
                        targetMountedId, //目标挂载节点id
                    };
                    console.log(targetMountedId, params, dragNode.data)
                }
            } else { //目标树内自己拖拽，调用排序而不是新增
                console.log("目标树内自己拖拽")
                //this.sortTargetTree(dragNode, dropNode, type);
            }

            dragNode.data._isSource = false;
            // if (type === "inner") { //拖放至内部则选择dropNode
            //     const pid = dropNode.data._id;
            // }
            // const pData = this.$helper.findParentNodeById(this.targetTreeData, node.data._id, { id: "_id" });
            // params.pid = pData ? pData._id : "";
            // if (type === "inner") {
            //     params.sort = Date.now();
            // } else {
            //     const nextSibling = this.$helper.findNextSiblingById(this.sourceTreeData, node.data._id, { id: "_id" }) || {};
            //     const previousSibling = this.$helper.findPreviousSiblingById(this.sourceTreeData, node.data._id, { id: "_id" }) || {};
            //     const previousSiblingSort = previousSibling.sort || 0;
            //     const nextSiblingSort = nextSibling.sort || Date.now();
            //     params.sort = (nextSiblingSort + previousSiblingSort) / 2;
            //     node.data.sort = (nextSiblingSort + previousSiblingSort) / 2;
            // }
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
        //=====================================其他操作=====================================//

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
