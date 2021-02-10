/*
    创建者：shuxiaokai
    创建时间：2020-06-24 20:33
    模块名称：文档管理banner导航页面
    备注：xxxx
*/
<template>
    <div class="banner">
        <!-- 工具栏 -->
        <div class="tool">
            <h2 class="gray-700 f-lg text-center text-ellipsis" :title="$route.query.name">{{ $route.query.name }}</h2>
            <el-input v-model="queryData" class="doc-search" placeholder="支持文档名称，文档url搜索" clearable @input="handleSearchTree"></el-input>
            <div class="tool-icon d-flex j-between mt-1 px-1">
                <el-tooltip class="item" effect="dark" content="导出文档" :open-delay="300">
                    <svg class="svg-icon" aria-hidden="true" @click="dialogVisible6 = true">
                        <use xlink:href="#icondaochu1"></use>
                    </svg>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="导入文档" :open-delay="300">
                    <svg class="svg-icon" aria-hidden="true" @click="dialogVisible3 = true">
                        <use xlink:href="#icondaoru"></use>
                    </svg>
                </el-tooltip>
                <svg class="item svg-icon" aria-hidden="true" @click="freshBanner">
                    <use xlink:href="#iconshuaxin"></use>
                </svg>
            </div>
        </div>
        <!-- 树形文档导航 -->
        <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="doc-nav">
            <el-tree
                    ref="docTree"
                    :data="navTreeData"
                    node-key="_id"
                    empty-text="点击按钮新增文档"
                    :default-expanded-keys="defaultExpandedKeys"
                    :expand-on-click-node="true"
                    :draggable="false"
                    :filter-node-method="filterNode"
                    @node-click="handleNodeClick"
            >
                <template slot-scope="scope">
                    <div
                            class="custom-tree-node"
                            :class="{'selected': multiSelectNode.find((val) => val.data._id === scope.data._id), 'active': currentSelectDoc && currentSelectDoc._id === scope.data._id}"
                            tabindex="1"
                            @click="handleClickNode($event, scope)"
                            @mouseover="hoverNodeId = scope.data._id"
                            @mouseout="hoverNodeId = ''"
                    >
                        <!-- file渲染 -->
                        <template v-if="!scope.data.isFolder">
                            <template v-for="(req) in validRequestMethods">
                                <span v-if="scope.data.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toLowerCase() }}</span>
                            </template>
                            <s-emphasize v-if="renameNodeId !== scope.data._id" :title="scope.data.name" :value="scope.data.name" :keyword="queryData" class="node-name text-ellipsis ml-1"></s-emphasize>
                        </template>
                        <!-- 文件夹渲染 -->
                        <template v-if="scope.data.isFolder">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px"/>
                            <span v-if="renameNodeId !== scope.data._id" :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                            <input v-else v-model="scope.data.name" placeholder="不能为空" type="text" class="rename-ipt f-sm ml-1" @blur="handleChangeNodeName(scope.data)" @keydown.enter="handleChangeNodeName(scope.data)">
                        </template>
                    </div>
                </template>
            </el-tree>
        </div>
        <!-- 弹窗 -->
        <s-export-dialog :visible.sync="dialogVisible6"></s-export-dialog>
    </div>
</template>

<script>
import { debounce } from "@/lib/index";
import exportDialog from "./dialog/export.vue";

export default {
    name: "SDocEditBanner",
    components: {
        "s-export-dialog": exportDialog,
    },
    computed: {
        navTreeData() { //-------树形导航数据
            return this.$store.state.apidoc.banner;
        },
        tabs() { //--------------全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
        currentSelectDoc() { //--当前选中的文档
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        docRules() { //---------文档规则
            return this.$store.state.apidocRules;
        },
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
    },
    watch: {
        currentSelectDoc: {
            handler(val) {
                if (val && val._id) {
                    this.defaultExpandedKeys.splice(0, 1, val._id);
                }
            },
            deep: true,
        },
    },
    data() {
        return {
            //=====================================文档增删改查====================================//
            queryData: "", //------------文档过滤条件
            docParentId: "", //----------文档父id
            contextmenu: null, //--------右键弹窗
            renameNodeId: "", //---------正在重命名的节点
            pressCtrl: false, //---------是否按住ctrl键
            multiSelectNode: [], //------按住ctrl+鼠标左键多选节点
            enableDrag: true, //---------是否允许文档被拖拽
            defaultExpandedKeys: [], //--默认展开的文档key值
            //=====================================其他参数====================================//
            hoverNodeId: "", //----------控制导航节点更多选项显示
            dialogVisible: false, //-----新增文件夹弹窗
            dialogVisible2: false, //----新增文件弹窗
            dialogVisible3: false, //----导入第三方文档弹窗
            dialogVisible4: false, //----查看历史记录
            dialogVisible5: false, //----以模板新建
            dialogVisible6: false, //----导出文档
            loading: false, //-----------左侧树形导航加载
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        //=====================================初始化相关====================================//
        init() {
            this.getDocBanner();
            document.documentElement.addEventListener("click", () => {
                this.multiSelectNode = [];
            });
        },
        //=====================================操作栏操作====================================//
        //刷新banner
        freshBanner() {
            if (!this.loading) {
                this.getDocBanner();
            }
        },
        getDocBanner() {
            this.loading = true;
            this.$store.dispatch("apidoc/getDocBanner", { projectId: this.$route.query.id }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================导航操作==================================//
        //点击节点
        handleClickNode(e, { node }) {
            if (this.pressCtrl) {
                e.stopPropagation();
                const delIndex = this.multiSelectNode.findIndex((val) => val._id === node.data._id);
                if (delIndex !== -1) {
                    this.multiSelectNode.splice(delIndex, 1);
                } else {
                    this.multiSelectNode.push(node);
                }
            }
        },
        //添加文件夹或文档成功回调函数
        handleAddFileAndFolderCb(data) {
            const pNode = this.$helper.findNodeById(this.navTreeData, this.docParentId, { id: "_id" });
            if (!pNode) { //插入到根元素
                if (data.type === "folder") { //如果是文件夹则放在第一位
                    let folderIndex = -1;
                    for (let i = 0, len = this.navTreeData.length; i < len; i += 1) {
                        if (!this.navTreeData[i].isFolder) {
                            this.navTreeData.splice(i, 0, data);
                            folderIndex = i;
                            break;
                        }
                    }
                    if (folderIndex === -1) { //不存在文件则直接添加到末尾
                        this.navTreeData.push(data);
                    }
                } else { //如果是文本
                    this.navTreeData.push(data);
                }
            } else { //插入到文件夹里面
                if (!pNode.children) {
                    this.$set(pNode, "children", []);
                }
                if (data.type === "folder") { //如果是文件夹则放在第一位
                    this.defaultExpandedKeys.push(data._id)
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
            if (data.type !== "folder") { //文件夹不做处理
                this.$store.commit("apidoc/addTab", {
                    _id: data._id,
                    name: data.name,
                    changed: data.changed,
                    tail: data.method,
                    tabType: "doc",
                    projectId: this.$route.query.id,
                });
                this.$store.commit("apidoc/changeCurrentTab", {
                    _id: data._id,
                    name: data.name,
                    changed: data.changed,
                    tail: data.method,
                    tabType: "doc",
                    projectId: this.$route.query.id,
                });
            }
        },
        //点击节点
        handleNodeClick(data, node) {
            if (!node.data.isFolder) { //文件夹不做处理
                this.$store.commit("apidoc/addTab", {
                    _id: node.data._id,
                    name: node.data.name,
                    changed: node.data.changed,
                    tail: node.data.method,
                    tabType: "doc",
                    projectId: this.$route.query.id,
                });
                this.$store.commit("apidoc/changeCurrentTab", {
                    _id: node.data._id,
                    name: node.data.name,
                    changed: node.data.changed,
                    tail: node.data.method,
                    tabType: "doc",
                    projectId: this.$route.query.id,
                });
            }
            this.multiSelectNode = [];
        },
        //=====================================前后端交互====================================//
        handleSearchTree() {
            this.search();
        },
        search: debounce(function foo() {
            this.searchResult = [];
            const params = {
                projectId: this.$route.query.id,
                url: this.queryData.trim(),
            };
            this.axios.get("/api/project/filter_doc", { params }).then((res) => {
                if (res.data.length === 0) {
                    this.defaultExpandedKeys = [];
                    this.searchResult = [];
                } else {
                    this.defaultExpandedKeys = Array.from(new Set(this.defaultExpandedKeys.concat(res.data.map((val) => val._id))));
                    this.searchResult = Array.from(new Set(this.searchResult.concat(res.data.map((val) => val))));
                }
                this.$refs.docTree.filter();
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        }),
        filterNode(value, data) {
            const matchName = !!this.searchResult.find((val) => val.name === data.label);
            const matchUrl = !!this.searchResult.find((val) => val._id === data._id);
            const matchAll = this.queryData.trim() === "";
            return matchName || matchUrl || matchAll;
        },
        //=====================================弹窗相关====================================//
        //打开文件新增弹窗
        handleOpenAddFolderDialog() {
            this.dialogVisible = true;
        },
        //打开文件新增弹窗
        handleOpenAddFileDialog() {
            this.dialogVisible2 = true;
        },
        //预览文档
        handleViewDoc() {
            this.$router.push({
                path: "/v1/apidoc/doc-view",
                query: {
                    id: this.$route.query.id,
                    name: this.$route.query.name,
                },
            });
        },
        //=====================================其他操作=====================================//
    },
};
</script>

<style lang="scss">
.banner {
    width: size(300);
    height: 100%;
    border-right: 1px solid $gray-400;
    display: flex;
    flex-direction: column;
    .el-tree-node__content {
        height: size(30);
    }
    .el-tree-node__content:hover {
        background: none;
    }
    .tool {
        position: relative;
        padding: 0 size(20);
        height: size(150);
        background: $gray-200;
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
    .doc-nav {
        height: calc(100vh - #{size(60)} - #{size(150)});
        overflow: auto;
        .custom-tree-node {
            display: flex;
            align-items: center;
            height: 30px;
            width: 100%;
            &:hover {
                background: mix($theme-color, $white, 25%);
            }
            &.active {
                background: mix($theme-color, $white, 25%);
            }
            //selected放在后面覆盖掉active样式
            &.selected {
                background: mix($theme-color, $white, 50%);
            }
            .label {
                display: inline-block;
                width: 25px;
            }
            .node-name {
                display: inline-block;
                max-width: 180px;
                border: 2px solid transparent;
            }
        }
    }

}
</style>
