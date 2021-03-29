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
            <h2 class="gray-700 f-lg text-center text-ellipsis" :title="$route.query.name">{{ $route.query.name }}</h2>
            <el-input v-model="queryData" class="doc-search" placeholder="支持文档名称，文档url搜索" clearable @input="handleSearchTree"></el-input>
            <div class="tool-icon d-flex j-between mt-1 px-1">
                <el-tooltip class="item" effect="dark" content="导出文档" :open-delay="300">
                    <svg class="svg-icon" aria-hidden="true" @click="handleOpenExport">
                        <use xlink:href="#icondaochu1"></use>
                    </svg>
                </el-tooltip>
                <svg class="item svg-icon" aria-hidden="true" @click="freshBanner">
                    <use xlink:href="#iconshuaxin"></use>
                </svg>
                <el-popover placement="right-end"  width="800" trigger="click">
                    <el-tooltip slot="reference" class="item" effect="dark" content="添加过滤条件" :open-delay="300">
                        <svg class="svg-icon" aria-hidden="true" @click="dialogVisible3 = true">
                            <use xlink:href="#iconguolv"></use>
                        </svg>
                    </el-tooltip>
                    <s-fieldset title="过滤条件" class="banner-search">
                        <!-- 操作人员 -->
                        <div class="op-item">
                            <div>操作人员：</div>
                            <el-checkbox-group v-model="formInfo.operators">
                                <el-checkbox v-for="(item, index) in memberEnum" :key="index" :label="item"></el-checkbox>
                                <el-button type="text" @click="handleClearOperator">清空</el-button>
                            </el-checkbox-group>
                        </div>
                        <!-- 日期范围 -->
                        <div class="op-item">
                            <div class="flex0">
                                <span>日期范围&nbsp;</span>
                                <span>：</span>
                            </div>
                            <el-radio-group v-model="dateRange">
                                <el-radio label="1d">今天</el-radio>
                                <el-radio label="2d">近两天</el-radio>
                                <el-radio label="3d">近三天</el-radio>
                                <el-radio label="自定义">自定义</el-radio>
                                <el-date-picker
                                    v-if="dateRange === '自定义'"
                                    v-model="customDateRange"
                                    type="datetimerange"
                                    range-separator="至"
                                    value-format="timestamp"
                                    start-placeholder="开始日期"
                                    size="mini"
                                    class="mr-1"
                                    end-placeholder="结束日期">
                                </el-date-picker>
                                <el-button type="text" @click="handleClearDate">清空</el-button>
                            </el-radio-group>
                        </div>
                        <!-- 最近多少条数据 -->
                        <div class="op-item">
                            <div class="flex0">
                                <span>最近多少条&nbsp;</span>
                                <span>：</span>
                            </div>
                            <el-radio-group v-model="recentNum">
                                <el-radio :label="2">2条</el-radio>
                                <el-radio :label="5">5条</el-radio>
                                <el-radio :label="10">10条</el-radio>
                                <el-radio :label="15">15条</el-radio>
                                <el-button type="text" @click="handleClearRecentNum">清空</el-button>
                            </el-radio-group>
                        </div>
                    </s-fieldset>
                </el-popover>
            </div>
        </div>
        <!-- 树形文档导航 -->
        <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="doc-nav">
            <!-- <div class="filter px-1">
                <span>过滤条件</span>
            </div> -->
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
                            <s-emphasize
                                v-if="renameNodeId !== scope.data._id"
                                class="node-name ml-1"
                                :title="scope.data.name"
                                :value="scope.data.name"
                                :keyword="queryData">
                            </s-emphasize>
                        </template>
                        <!-- 文件夹渲染 -->
                        <template v-if="scope.data.isFolder">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px"/>
                            <span v-if="renameNodeId !== scope.data._id" :title="scope.data.name" class="node-name">{{ scope.data.name }}</span>
                            <input v-else v-model="scope.data.name" placeholder="不能为空" type="text" class="rename-ipt f-sm ml-1" @blur="handleChangeNodeName(scope.data)" @keydown.enter="handleChangeNodeName(scope.data)">
                        </template>
                    </div>
                </template>
            </el-tree>
        </div>
        <div ref="bar" class="bar" @mousedown="handleResizeMousedown"></div>
    </div>
</template>

<script>
import { debounce } from "@/lib/index";

export default {
    name: "SDocEditBanner",
    computed: {
        navTreeData() { //-------树形导航数据
            const { banner } = this.$store.state.apidoc;
            let plainData = [];
            const rawData = [];
            this.$helper.forEachForest(banner, (node) => {
                const cpNode = JSON.parse(JSON.stringify(node))
                delete cpNode.children;
                plainData.push(cpNode);
                rawData.push(cpNode);
            });
            plainData = plainData.filter((node) => {
                const { creator, updatedAt } = node;
                const { startTime, endTime } = this.formInfo;
                const updatedTimestamp = new Date(updatedAt).valueOf();
                if (this.formInfo.operators.length > 0) {
                    return this.formInfo.operators.indexOf(creator) !== -1;
                }
                if (startTime && endTime) {
                    return updatedTimestamp >= startTime && updatedTimestamp <= endTime;
                }
                return true;
            });
            if (this.recentNum) {
                plainData.sort((a, b) => {
                    const aTime = new Date(a.updatedAt).valueOf();
                    const bTime = new Date(b.updatedAt).valueOf();
                    return bTime - aTime;
                });
                plainData = plainData.slice(0, this.recentNum)
            }
            for (let i = 0; i < plainData.length; i += 1) {
                const node = plainData[i];
                if (node.pid) { //存在pid但是无法找到父节点
                    const parentNode = plainData.find((val) => val._id === node.pid);
                    if (!parentNode) {
                        const matchedParentNode = rawData.find((val) => val._id === node.pid);
                        plainData.push(matchedParentNode);
                    }
                }
            }
            plainData.sort((a, b) => {
                if (a.isFolder && !b.isFolder) {
                    return -1;
                }
                if (!a.isFolder && b.isFolder) {
                    return 1;
                }
                if (a.isFolder && b.isFolder) {
                    return a.sort - b.sort;
                }
                return a.sort - b.sort;
            });
            const result = [];
            for (let i = 0; i < plainData.length; i += 1) {
                const docInfo = plainData[i];
                if (!docInfo.pid) { //根元素
                    docInfo.children = [];
                    result.push(docInfo);
                }
                const id = docInfo._id;
                for (let j = 0; j < plainData.length; j += 1) {
                    if (id === plainData[j].pid) { //项目中新增的数据使用标准id
                        if (docInfo.children == null) {
                            docInfo.children = [];
                        }
                        docInfo.children.push(plainData[j]);
                    }
                }
            }
            return result;
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
        dateRange(val) {
            let startTime = new Date(new Date().setHours(0, 0, 0, 0)).valueOf();
            let endTime = null;
            switch (val) {
            case "1d":
                endTime = Date.now();
                break;
            case "2d":
                endTime = Date.now();
                startTime = endTime - 86400000;
                break;
            case "3d":
                endTime = Date.now();
                startTime = endTime - 3 * 86400000;
                break;
            case "7d":
                endTime = Date.now();
                startTime = endTime - 7 * 86400000;
                break;
            case "yesterday":
                endTime = startTime;
                startTime -= 86400000;
                break;
            default: //自定义
                startTime = null;
                endTime = null;
                this.customDateRange = [];
                break;
            }
            this.formInfo.startTime = startTime;
            this.formInfo.endTime = endTime;
        },
        customDateRange(val) {
            if (!val || val.length === 0) {
                this.formInfo.startTime = null;
                this.formInfo.endTime = null;
            } else {
                this.formInfo.startTime = val[0];
                this.formInfo.endTime = val[1];
            }
        },
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
            //=====================================文档过滤====================================//
            formInfo: {
                startTime: null, //--起始日期
                endTime: null, //----结束日期
                operators: [], //----操作者信息
            },
            memberEnum: [],
            dateRange: "", //--------日期范围
            customDateRange: [], //--自定义日期范围
            recentNum: null, //------显示最近多少条
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
    mounted() {
        this.init();
        this.getOperatorEnum();
    },
    methods: {
        //=====================================初始化相关====================================//
        init() {
            this.getDocBanner();
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
        //获取操作人员枚举信息
        getOperatorEnum() {
            const params = {
                projectId: this.$route.query.id,
            };
            this.axios.get("/api/docs/docs_history_operator_enum", { params }).then((res) => {
                this.memberEnum = res.data;
            }).catch((err) => {
                console.error(err);
            });
        },
        //=====================================操作栏操作====================================//
        //刷新banner
        freshBanner() {
            if (!this.loading) {
                this.getDocBanner();
                this.getOperatorEnum();
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
        //打开导出tab
        handleOpenExport() {
            const id = this.$helper.uuid();
            if (this.tabs && this.tabs.find((tab) => tab.tabType === "exportDoc")) { //存在则返回不处理
                return;
            }
            this.$store.commit("apidoc/addTab", {
                _id: id,
                name: "文档导出",
                changed: false,
                tail: "",
                tabType: "exportDoc",
                projectId: this.$route.query.id,
            });
            this.$store.commit("apidoc/changeCurrentTab", {
                _id: id,
                name: "文档导出",
                changed: false,
                tail: "",
                tabType: "exportDoc",
                projectId: this.$route.query.id,
            });
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
        //=====================================过滤操作====================================//
        //清空操作人员信息
        handleClearOperator() {
            this.formInfo.operators = [];
        },
        //清空日期范围
        handleClearDate() {
            this.dateRange = null; //startTime和endTime会在watch中发送改变
        },
        //清空最近条数
        handleClearRecentNum() {
            this.recentNum = null;
        },
        //全部清空
        clearAll() {
            this.handleClearOperator();
            this.handleClearDate();
            this.handleClearRecentNum();
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
    height: 100%;
    border-right: 1px solid $gray-400;
    display: flex;
    flex-direction: column;
    position: relative;
    &>.bar {
        position: absolute;
        height: 100%;
        width: size(10);
        background: transparent;
        left: size(300);
        z-index: $zIndex-banner-bar;
        box-sizing: content-box;
        margin-left: size(-5);
        cursor: ew-resize;
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
// 搜索
.banner-search {
    flex: 0 0 auto;
    .el-checkbox, .el-radio {
        margin-right: size(15);
    }
    .op-item {
        min-height: size(50);
        display: flex;
        align-items: center;
        &:not(:last-of-type) {
            border-bottom: 1px dashed $gray-300;
        }
        .el-button--text {
            padding-top: size(5);
            padding-bottom: size(5);
        }
    }
}
</style>
