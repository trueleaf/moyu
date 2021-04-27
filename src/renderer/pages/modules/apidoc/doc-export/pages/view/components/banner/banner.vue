/*
    创建者：shuxiaokai
    创建时间：2020-06-24 20:33
    模块名称：文档管理banner导航页面
    备注：xxxx
*/
<template>
    <div ref="banner" class="banner" :style="{'user-select': isDragging ? 'none' : 'auto'}">
        <!-- 工具栏 -->
        <div class="tool">
            <h2 class="gray-700 f-lg text-center text-ellipsis" :title="$route.query.projectName">{{ docBaseInfo.projectName }}</h2>
            <el-input v-model="queryData" class="doc-search" placeholder="支持文档名称，文档url搜索" clearable @input="handleSearchTree"></el-input>
            <div class="tool-icon d-flex j-between mt-1 px-1">
                <el-tooltip class="item" effect="dark" content="导入文档" :open-delay="300">
                    <svg class="svg-icon" aria-hidden="true" @click="dialogVisible3 = true">
                        <use xlink:href="#icondaoru"></use>
                    </svg>
                </el-tooltip>
                <!-- <svg class="item svg-icon" aria-hidden="true" @click="freshBanner">
                    <use xlink:href="#iconshuaxin"></use>
                </svg> -->
            </div>
        </div>
        <div ref="bar" class="bar" :class="{active: isDragging}" @mousedown="handleResizeMousedown"></div>
        <!-- 树形文档导航 -->
        <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="doc-nav">
            <el-tree
                ref="docTree"
                :data="navTreeData"
                node-key="_id"
                empty-text="暂无数据"
                :default-expanded-keys="defaultExpandedKeys"
                :expand-on-click-node="true"
                :draggable="false"
                :filter-node-method="filterNode"
                @node-click="handleNodeClick"
            >
                <template slot-scope="scope">
                    <el-popover
                        v-model="scope.data._ctrlPress"
                        class="w-100"
                        placement="right"
                        width="300"
                        trigger="manual"
                    >
                        <div class="d-flex flex-column">
                            <s-label-value label="id：" label-width="auto" :value="scope.data._id"></s-label-value>
                            <s-label-value label="创建者：" label-width="auto" :value="scope.data.creator"></s-label-value>
                            <s-label-value v-if="scope.data.url.path" label="url：" label-width="auto" :value="scope.data.url.path" class="mb-0"></s-label-value>
                        </div>
                        <div
                            slot="reference"
                            class="custom-tree-node"
                            :class="{'selected': multiSelectNode.find((val) => val.data._id === scope.data._id), 'active': currentSelectDoc && currentSelectDoc._id === scope.data._id}"
                            tabindex="0"
                            @keydown.stop="handleKeydown($event, scope.data)"
                            @keyup.stop="handleKeyUp($event, scope.data)"
                            @click="handleClickNode($event, scope)"
                            @mouseenter="handleHoverNode($event, scope)"
                            @mouseleave="hoverNodeId = ''"
                        >
                            <!-- file渲染 -->
                            <template v-if="!scope.data.isFolder">
                                <template v-for="(req) in validRequestMethods">
                                    <span v-if="scope.data.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toLowerCase() }}</span>
                                </template>
                                <s-emphasize
                                    v-if="renameNodeId !== scope.data._id"
                                    class="node-name ml-1"
                                    :title="scope.data.name"
                                    :value="scope.data.name"
                                    :keyword="queryData"
                                >
                                </s-emphasize>
                            </template>
                            <!-- 文件夹渲染 -->
                            <template v-if="scope.data.isFolder">
                                <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px" />
                                <span v-if="renameNodeId !== scope.data._id" :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                            </template>
                        </div>
                    </el-popover>
                </template>
            </el-tree>
        </div>
    </div>
</template>

<script>
export default {
    name: "SDocEditBanner",
    data() {
        return {
            docBaseInfo: {},
            navTreeData: [],
            //=====================================文档增删改查====================================//
            queryData: "", //------------文档过滤条件
            docParentId: "", //----------文档父id
            contextmenu: null, //--------右键弹窗
            renameNodeId: "", //---------正在重命名的节点
            pressCtrl: false, //---------是否按住ctrl键
            multiSelectNode: [], //------按住ctrl+鼠标左键多选节点
            enableDrag: true, //---------是否允许文档被拖拽
            defaultExpandedKeys: [], //--默认展开的文档key值
            //=====================================拖拽参数====================================//
            minWidth: 280, //------------最小宽度
            maxWidth: 400, //------------最大宽度
            mousedownLeft: 0, //---------鼠标点击距离
            bannerWidth: 0, //-----------banner宽度
            isDragging: false, //--------是否正在拖拽
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
    computed: {
        tabs() { //--------------全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
        currentSelectDoc() { //--当前选中的文档
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
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
    mounted() {
        this.init();
    },
    methods: {
        //=====================================初始化相关====================================//
        init() {
            this.getDocBanner();
            this.getDocInfo();
            const bannerWidth = localStorage.getItem("apidoc/bannerWidth") || 300;
            const { banner, bar } = this.$refs;
            bar.style.left = `${bannerWidth}px`;
            banner.style.width = `${bannerWidth}px`;
            document.documentElement.addEventListener("click", () => {
                this.multiSelectNode = [];
            });
            document.documentElement.addEventListener("mouseup", (e) => {
                e.stopPropagation();
                this.isDragging = false;
                document.documentElement.removeEventListener("mousemove", this.handleResizeMousemove);
            })
        },
        //=====================================操作栏操作====================================//
        //刷新banner
        freshBanner() {
            if (!this.loading) {
                this.getDocBanner();
            }
        },
        //获取文档导航
        getDocBanner() {
            const { docs } = window.SHARE_DATA;
            const result = [];
            const mapedData = docs.map((val) => ({
                ...val.item,
                ...val.info,
                _id: val._id,
                pid: val.pid,
                sort: val.sort,
                isFolder: val.isFolder,
                children: val.children,
            }))
            for (let i = 0; i < mapedData.length; i += 1) {
                const docInfo = mapedData[i];
                if (!docInfo.pid) { //根元素
                    docInfo.children = [];
                    result.push(docInfo);
                }
                const id = docInfo._id.toString();
                for (let j = 0; j < mapedData.length; j += 1) {
                    if (id === mapedData[j].pid) { //项目中新增的数据使用标准id
                        if (docInfo.children == null) {
                            docInfo.children = [];
                        }
                        docInfo.children.push(mapedData[j]);
                    }
                }
            }
            this.navTreeData = result;
        },
        //获取文档基本信息
        getDocInfo() {
            const { info } = window.SHARE_DATA;
            this.docBaseInfo = info;
        },
        //=====================================组件操作==================================//
        //鼠标移动到当前node上面
        handleHoverNode(e, scope) {
            if (!this.isRename) { //防止focus导致输入框失焦
                e.currentTarget.focus(); //实其能够触发keydown事件
            }
            this.hoverNodeId = scope.data._id
        },
        //处理节点上面keydown快捷方式(例如f2重命名)
        handleKeydown(e, data) {
            if (e.code === "ControlLeft" || e.code === "ControlRight") {
                this.clearPopover();
                this.$set(data, "_ctrlPress", true);
                this.pressCtrl = true;
            }
        },
        //清除popover效果
        clearPopover() {
            this.$helper.forEachForest(this.navTreeData, (data) => {
                this.$set(data, "_ctrlPress", false);
            });
        },
        //按键放开
        handleKeyUp() {
            this.clearPopover();
            this.pressCtrl = false;
        },
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
            this.searchResult = [];
            const originDocs = window.SHARE_DATA.docs;
            const filteredDocs = originDocs.filter((val) => {
                const isDoc = !val.isFolder;
                return isDoc && (val.info.name.match(this.queryData) || val.item.url.path.match(this.queryData))
            })
            if (filteredDocs.length === 0) {
                this.defaultExpandedKeys = [];
                this.searchResult = [];
            } else if (this.queryData.trim() === "") {
                this.defaultExpandedKeys = [];
                this.searchResult = [];
                this.defaultExpandedKeys.push(this.currentSelectDoc._id);
            } else {
                this.defaultExpandedKeys = Array.from(new Set(this.defaultExpandedKeys.concat(filteredDocs.map((val) => val._id))));
                this.searchResult = Array.from(new Set(this.searchResult.concat(filteredDocs.map((val) => val))));
            }
            this.$refs.docTree.filter();
        },
        filterNode(value, data) {
            const matchUrl = !!this.searchResult.find((val) => val._id === data._id);
            const matchAll = this.queryData.trim() === "";
            return matchUrl || matchAll;
        },
        //=====================================其他操作=====================================//
        //处理鼠标按下事件
        handleResizeMousedown(e) {
            this.mousedownLeft = e.clientX;
            this.bannerWidth = this.$refs.banner.getBoundingClientRect().width;
            this.isDragging = true;
            document.documentElement.addEventListener("mousemove", this.handleResizeMousemove);
        },
        //处理鼠标移动事件
        handleResizeMousemove(e) {
            e.stopPropagation();
            let moveLeft = 0;
            const { banner, bar } = this.$refs;
            moveLeft = e.clientX - this.mousedownLeft;
            const bannerWidth = moveLeft + this.bannerWidth;
            if (bannerWidth < this.minWidth || bannerWidth > this.maxWidth) {
                return;
            }
            localStorage.setItem("apidoc/bannerWidth", moveLeft + this.bannerWidth)
            bar.style.left = `${moveLeft + this.bannerWidth}px`;
            banner.style.width = `${moveLeft + this.bannerWidth}px`;
        },
    },
};
</script>

<style lang="scss">
.banner {
    width: size(300);
    min-height: 100vh;
    border-right: 1px solid $gray-400;
    display: flex;
    flex-direction: column;
    position: relative;
    &>.bar {
        @include bar;
    }
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
            @include custom-tree-node;
        }
    }

}
</style>
