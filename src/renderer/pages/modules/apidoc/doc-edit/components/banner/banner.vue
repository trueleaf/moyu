/*
    创建者：shuxiaokai
    创建时间：2020-06-24 20:33
    模块名称：文档管理banner导航页面
    备注：xxxx
*/
<template>
    <div ref="banner" class="banner" tabindex="1" :style="{'user-select': isDragging ? 'none' : 'auto'}" @click="handleClickBanner">
        <!-- 工具栏 -->
        <div class="tool">
            <h2 class="gray-700 f-lg text-center text-ellipsis" :title="$route.query.name">{{ $route.query.name }}</h2>
            <el-input v-model="queryData" class="doc-search" placeholder="文档名称,文档url,创建者" clearable @input="handleSearchTree"></el-input>
            <div class="tool-icon d-flex j-between mt-1 px-1">
                <el-tooltip class="item" effect="dark" content="新增文件夹" :open-delay="300">
                    <svg class="svg-icon" aria-hidden="true" @click="handleOpenAddFolderDialog();docParentId = '';">
                        <use xlink:href="#iconxinzengwenjian"></use>
                    </svg>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="新增文件" :open-delay="300">
                    <svg class="svg-icon" aria-hidden="true" @click="handleOpenAddFileDialog();docParentId = '';">
                        <use xlink:href="#iconwenjian"></use>
                    </svg>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="导出文档" :open-delay="300">
                    <svg class="svg-icon" aria-hidden="true" @click="handleOpenExportPage">
                        <use xlink:href="#icondaochu1"></use>
                    </svg>
                </el-tooltip>
                <!-- <el-tooltip class="item" effect="dark" content="导入文档" :open-delay="300">
                    <svg class="svg-icon" aria-hidden="true" @click="dialogVisible3 = true">
                        <use xlink:href="#icondaoru"></use>
                    </svg>
                </el-tooltip> -->
                <el-tooltip class="item" effect="dark" content="在线链接" :open-delay="300">
                    <svg class="svg-icon" aria-hidden="true" @click="handleOpenOnlineLink">
                        <use xlink:href="#iconlink"></use>
                    </svg>
                </el-tooltip>
                <svg class="item svg-icon" aria-hidden="true" @click="freshBanner">
                    <use xlink:href="#iconshuaxin"></use>
                </svg>
                <el-dropdown ref="dropdown" trigger="click" class="mr-1">
                    <i class="more-op el-icon-more" title="更多操作"></i>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="handleViewDoc">
                            <div class="dropdown-item">
                                <span>预览文档</span>
                                <span class="gray-500">Ctrl+P</span>
                            </div>
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="handleOpenImportPage">
                            <div class="dropdown-item">
                                <span>导入文档</span>
                                <span class="gray-500">Ctrl+I</span>
                            </div>
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="handleOpenHistoryPage">
                            <div class="dropdown-item">
                                <span>历史记录</span>
                                <span class="gray-500">Ctrl+H</span>
                            </div>
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="handleOpenConfigPage">
                            <div class="dropdown-item">
                                <span>全局设置</span>
                                <span class="gray-500">Ctrl+,</span>
                            </div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <div class="filter"></div>
        <!-- 树形文档导航 -->
        <s-loading :loading="loading" class="doc-nav">
            <el-tree
                    ref="docTree"
                    class="flex0"
                    :data="navTreeData"
                    node-key="_id"
                    empty-text="点击按钮新增文档"
                    :default-expanded-keys="defaultExpandedKeys"
                    :expand-on-click-node="true"
                    :draggable="enableDrag"
                    :allow-drop="handleCheckNodeCouldDrop"
                    :filter-node-method="filterNode"
                    @node-contextmenu="handleContextmenu"
                    @node-drop="handleNodeDropSuccess"
                    @node-expand="clearContextmenu"
                    @node-collapse="clearContextmenu"
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
                            <s-label-value v-if="!scope.data.isFolder" label="url：" label-width="auto" :value="scope.data.url.path" class="mb-0"></s-label-value>
                        </div>
                        <div
                                class="custom-tree-node"
                                :class="{'selected': multiSelectNode.find((val) => val.data._id === scope.data._id), 'active': currentSelectDoc && currentSelectDoc._id === scope.data._id}"
                                tabindex="0"
                                slot="reference"
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
                                    :keyword="queryData">
                                </s-emphasize>
                                <!-- <div v-if="renameNodeId !== scope.data._id" :title="scope.data.name" class="node-name ml-1">{{ scope.data.name }}</div> -->
                                <input v-else v-model="scope.data.name" placeholder="不能为空" type="text" class="rename-ipt f-sm ml-1" @blur="handleChangeNodeName(scope.data)" @keydown.stop.enter="handleChangeNodeName(scope.data)">
                                <el-dropdown
                                        v-show="hoverNodeId === scope.data._id"
                                        class="node-more"
                                        trigger="click"
                                        @command="(command) => { handleSelectDropdown(command, scope.data, scope.node) }"
                                        @click.native.stop="() =>{}"
                                >
                                    <span class="el-icon-more"></span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item v-if="scope.data.isFolder" command="addFile">新建文档</el-dropdown-item>
                                        <el-dropdown-item v-if="scope.data.isFolder" command="addByTemplate">以模板新建</el-dropdown-item>
                                        <el-dropdown-item v-if="!scope.data.isFolder" command="copy">复制接口</el-dropdown-item>
                                        <el-dropdown-item command="rename">重命名</el-dropdown-item>
                                        <el-dropdown-item command="delete">删除</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                            <!-- 文件夹渲染 -->
                            <template v-if="scope.data.isFolder">
                                <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px"/>
                                <span v-if="renameNodeId !== scope.data._id" :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                                <input v-else v-model="scope.data.name" placeholder="不能为空" type="text" class="rename-ipt f-sm ml-1" @blur="handleChangeNodeName(scope.data)" @keydown.stop.enter="handleChangeNodeName(scope.data)">
                                <el-dropdown
                                        v-show="hoverNodeId === scope.data._id"
                                        class="node-more"
                                        trigger="click"
                                        @command="(command) => { handleSelectDropdown(command, scope.data, scope.node) }"
                                        @click.native.stop="() =>{}"
                                >
                                    <span class="el-icon-more"></span>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item v-if="scope.data.isFolder" command="addFile">新建文档</el-dropdown-item>
                                        <el-dropdown-item v-if="scope.data.isFolder" command="addFolder">新建文件夹</el-dropdown-item>
                                        <el-dropdown-item v-if="scope.data.isFolder" command="addByTemplate">以模板新建</el-dropdown-item>
                                        <el-dropdown-item command="rename">重命名</el-dropdown-item>
                                        <el-dropdown-item command="delete">删除</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </template>
                        </div>
                    </el-popover>
                </template>
            </el-tree>
            <div ref="bannerContext" class="context flex1"></div>
        </s-loading>
        <div ref="bar" class="bar" :class="{active: isDragging}" @mousedown="handleResizeMousedown"></div>
        <!-- 弹窗 -->
        <s-add-folder-dialog v-if="dialogVisible" :visible.sync="dialogVisible" :pid="docParentId" @success="handleAddFileAndFolderCb"></s-add-folder-dialog>
        <s-add-file-dialog v-if="dialogVisible2" :visible.sync="dialogVisible2" :pid="docParentId" @success="handleAddFileAndFolderCb"></s-add-file-dialog>
        <s-template-dialog :visible.sync="dialogVisible5"></s-template-dialog>
    </div>
</template>

<script>
import Vue from "vue";
import { forEachForest, debounce } from "@/lib/index";
import addFolderDialog from "../../dialog/add-folder.vue";
import addFileDialog from "../../dialog/add-file.vue";
import templateDialog from "./dialog/template.vue";
import contextmenu from "./components/contextmenu.vue";

export default {
    name: "SDocEditBanner",
    components: {
        "s-add-folder-dialog": addFolderDialog,
        "s-add-file-dialog": addFileDialog,
        "s-template-dialog": templateDialog,
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
                } else {
                    this.defaultExpandedKeys = [];
                }
            },
            deep: true,
        },
    },
    data() {
        return {
            //=====================================文档增删改查====================================//
            queryData: "", //------------------文档过滤条件
            docParentId: "", //----------------文档父id
            contextmenu: null, //--------------右键弹窗
            renameNodeId: "", //---------------正在重命名的节点
            pressCtrl: false, //---------------是否按住ctrl键
            multiSelectNode: [], //------------按住ctrl+鼠标左键多选节点
            enableDrag: true, //---------------是否允许文档被拖拽
            defaultExpandedKeys: [], //--------默认展开的文档key值
            currentSelectBannerNode: null, //--当前选中banner节点
            //=====================================拖拽参数====================================//
            minWidth: 280, //------------------最小宽度
            maxWidth: 400, //------------------最大宽度
            mousedownLeft: 0, //---------------鼠标点击距离
            bannerWidth: 0, //-----------------banner宽度
            isDragging: false, //--------------是否正在拖拽
            isRename: false, //----------------正在重命名
            //=====================================其他参数====================================//
            hoverNodeId: "", //----------------控制导航节点更多选项显示
            dialogVisible: false, //-----------新增文件夹弹窗
            dialogVisible2: false, //----------新增文件弹窗
            dialogVisible3: false, //----------导入第三方文档弹窗
            dialogVisible4: false, //----------查看历史记录
            dialogVisible5: false, //----------以模板新建
            dialogVisible7: false, //----------生产在线链接
            popoverVisible: false, //----------banner详情弹出框
            loading: false, //-----------------左侧树形导航加载
        };
    },
    mounted() {
        this.init();
        this.$event.one("apidoc/importDocSuccess", () => {
            this.getDocBanner();
            this.$store.dispatch("apidoc/getHostEnum", {
                projectId: this.$route.query.id,
            });
        })
    },
    methods: {
        //=====================================初始化相关====================================//
        init() {
            this.getDocBanner();
            document.documentElement.addEventListener("click", () => {
                this.clearContextmenu();
                this.multiSelectNode = [];
                this.currentSelectBannerNode = null;
                this.clearPopover();
                this.pressCtrl = false;
            });
            //右键菜单
            this.$refs.bannerContext.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                this.clearContextmenu(); //清除contextmenu
                const ContextmenuConstructor = Vue.extend(contextmenu);
                const x = e.clientX; //当前点击位置
                const y = e.clientY; //当前点击位置
                const operations = ["file", "folder"]
                this.contextmenu = new ContextmenuConstructor({
                    propsData: {
                        operations,
                        left: x,
                        top: y,
                    },
                }).$mount();
                document.body.appendChild(this.contextmenu.$el);
                this.contextmenu.$on("file", () => {
                    this.handleOpenAddFileDialog();
                })
                this.contextmenu.$on("folder", () => {
                    this.handleOpenAddFolderDialog();
                })
            })
            //拖拽相关
            document.documentElement.addEventListener("mouseup", () => {
                this.isDragging = false;
                document.documentElement.removeEventListener("mousemove", this.handleResizeMousemove);
            })
            const bannerWidth = localStorage.getItem("apidoc/bannerWidth") || 300;
            const { banner, bar } = this.$refs;
            bar.style.left = `${bannerWidth}px`;
            banner.style.width = `${bannerWidth}px`;
        },
        //=====================================操作栏操作====================================//
        //刷新banner
        freshBanner() {
            if (!this.loading) {
                this.getDocBanner();
            }
        },
        //获取banner数据
        getDocBanner() {
            this.loading = true;
            this.$store.dispatch("apidoc/getDocBanner", { projectId: this.$route.query.id }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //打开在线链接tab
        handleOpenOnlineLink() {
            this.handleAddTab("生成在线链接", "onlineLink");
        },
        //打开导出tab
        handleOpenExportPage() {
            this.handleAddTab("文档导出", "exportDoc");
        },
        //打开导入tab
        handleOpenImportPage() {
            this.handleAddTab("文档导入", "importDoc");
        },
        //打开配置界面
        handleOpenConfigPage() {
            this.handleAddTab("文档全局配置", "config");
        },
        //打开历史记录界面
        handleOpenHistoryPage() {
            this.handleAddTab("历史记录", "history");
        },
        //打开新的tab
        handleAddTab(name, tabType) {
            this.$store.commit("apidoc/changeCurrentTab", {
                _id: tabType,
                projectId: this.$route.query.id,
                name,
                changed: false,
                tabType,
            });
            if (this.tabs && this.tabs.find((tab) => tab.tabType === tabType)) { //存在则返回不处理
                return;
            }
            this.$store.commit("apidoc/addTab", {
                _id: tabType,
                projectId: this.$route.query.id,
                name,
                changed: false,
                tabType,
            });
        },
        //=====================================导航操作==================================//
        //文档下拉框选择 重命名，删除，新增...
        handleSelectDropdown(command, data, node) {
            /*eslint-disable indent*/
            switch (command) {
                case "addFile":
                    this.docParentId = data._id;
                    if (node && node.childNodes.length >= this.docRules.fileInFolderLimit) {
                        this.$message.warning(`单个文件夹里面文档个数不超过${this.docRules.fileInFolderLimit}个`);
                    } else {
                        this.handleOpenAddFileDialog();
                    }
                    break;
                case "addFolder":
                    this.docParentId = data._id;
                    this.handleOpenAddFolderDialog();
                    break;
                case "rename":
                    this.$set(data, "_name", data.name); //文档名称备份,防止修改名称用户名称填空导致异常
                    this.renameNodeId = data._id;
                    this.$nextTick(() => {
                        document.querySelector(".rename-ipt").focus();
                        this.enableDrag = false;
                        this.isRename = true;
                    });
                    break;
                case "delete":
                    this.handleDeleteItem(data, node);
                    break;
                case "addByTemplate":
                    this.addByTemplate(data);
                    break;
                case "copy":
                    if (node && node.parent && node.parent.childNodes && node.parent.childNodes.length >= this.docRules.fileInFolderLimit) {
                        this.$message.warning(`单个文件夹里面文档个数不超过${this.docRules.fileInFolderLimit}个`);
                    } else {
                        this.copyDoc(data, node);
                    }
                    break;
                default:
                    break;
            }
        },
        //创建鼠标右键dom元素
        handleContextmenu(e, data, node) {
            e.stopPropagation();
            this.clearContextmenu(); //清除contextmenu
            const ContextmenuConstructor = Vue.extend(contextmenu);
            const x = e.clientX; //当前点击位置
            const y = e.clientY; //当前点击位置
            let operations = [];
            if (this.multiSelectNode.length > 0) {
                operations = ["deleteMany"];
            } else {
                operations = data.isFolder ? ["file", "folder", "template", "rename", "delete"] : ["rename", "delete", "copy"];
            }
            this.contextmenu = new ContextmenuConstructor({
                propsData: {
                    operations,
                    left: x,
                    top: y,
                },
            }).$mount();
            document.body.appendChild(this.contextmenu.$el);
            this.contextmenu.$on("file", () => {
                this.docParentId = data._id;
                if (node && node.childNodes.length >= this.docRules.fileInFolderLimit) {
                    this.$message.warning(`单个文件夹里面文档个数不超过${this.docRules.fileInFolderLimit}个`);
                } else {
                    this.handleOpenAddFileDialog();
                }
            })
            this.contextmenu.$on("folder", () => {
                this.docParentId = data._id;
                this.handleOpenAddFolderDialog();
            })
            this.contextmenu.$on("rename", () => {
                this.$set(data, "_name", data.name); //文档名称备份,防止修改名称用户名称填空导致异常
                this.renameNodeId = data._id;
                this.$nextTick(() => {
                    document.querySelector(".rename-ipt").focus();
                    this.enableDrag = false;
                    this.isRename = true;
                })
            })
            this.contextmenu.$on("delete", () => {
                this.handleDeleteItem(data, node);
            })
            this.contextmenu.$on("deleteMany", () => {
                this.handleDeleteManyItem();
            })
            this.contextmenu.$on("template", () => {
                this.addByTemplate(data);
            })
            this.contextmenu.$on("copy", () => {
                if (node && node.parent && node.parent.childNodes && node.parent.childNodes.length >= this.docRules.fileInFolderLimit) {
                    this.$message.warning(`单个文件夹里面文档个数不超过${this.docRules.fileInFolderLimit}个`);
                } else {
                    this.copyDoc(data, node);
                }
            });
        },
        //鼠标移动到当前node上面
        handleHoverNode(e, scope) {
            if (!this.isRename) { //防止focus导致输入框失焦
                e.currentTarget.focus(); //实其能够触发keydown事件
            }
            this.hoverNodeId = scope.data._id
        },
        //处理节点上面keydown快捷方式(例如f2重命名)
        handleKeydown(e, data) {
            if (e.code === "F2") {
                this.$set(data, "_name", data.name); //文档名称备份,防止修改名称用户名称填空导致异常
                this.renameNodeId = data._id;
                this.$nextTick(() => {
                    document.querySelector(".rename-ipt").focus();
                    this.enableDrag = false;
                    this.isRename = true; //重命名
                })
            } else if (e.code === "ControlLeft" || e.code === "ControlRight") {
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
        //判断是否允许拖拽
        handleCheckNodeCouldDrop(draggingNode, dropNode, type) {
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
        //拖拽成功时候触发
        handleNodeDropSuccess(node, dropNode, type) {
            const params = {
                _id: node.data._id, //当前节点id
                pid: "", //父元素
                sort: 0, //当前节点排序效果
                projectId: this.$route.query.id,
                dropInfo: {
                    nodeName: node.data.name,
                    nodeId: node.data._id,
                    dropNodeName: dropNode.data.name,
                    dropNodeId: dropNode.data._id,
                    dropType: type,
                },
            };
            const pData = this.$helper.findParentNodeById(this.navTreeData, node.data._id, { id: "_id" });
            params.pid = pData ? pData._id : "";
            if (type === "inner") {
                params.sort = Date.now();
            } else {
                const nextSibling = this.$helper.findNextSiblingById(this.navTreeData, node.data._id, { id: "_id" }) || {};
                const previousSibling = this.$helper.findPreviousSiblingById(this.navTreeData, node.data._id, { id: "_id" }) || {};
                const previousSiblingSort = previousSibling.sort || 0;
                const nextSiblingSort = nextSibling.sort || Date.now();
                params.sort = (nextSiblingSort + previousSiblingSort) / 2;
                node.data.sort = (nextSiblingSort + previousSiblingSort) / 2;
            }
            this.axios.put("/api/project/change_doc_pos", params).then(() => {}).catch((err) => {
                this.$errorThrow(err, this);
            });
        },
        //点击节点
        handleNodeClick(data, node) {
            this.currentSelectBannerNode = data;
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
            this.clearContextmenu();
            this.multiSelectNode = [];
        },
        //拷贝节点
        copyDoc(data, node) {
            const params = {
                _id: data._id,
                projectId: this.$route.query.id,
            };
            this.axios.post("/api/project/copy_doc", params).then((res) => {
                const pNode = node.parent;
                if (pNode.level === 0) { //在根元素下面插入
                    pNode.data.push(res.data);
                } else { //在某个元素下面插入
                    const insertIndex = pNode.data.children.findIndex((val) => val._id === data._id);
                    pNode.data.children.splice(insertIndex + 1, 0, res.data);
                }
                if (!res.data.isFolder) { //文件夹不做处理
                    res.data.tabType = "doc";
                    this.$store.commit("apidoc/addTab", {
                        _id: res.data._id,
                        name: res.data.name,
                        changed: res.data.changed,
                        tail: res.data.method,
                        tabType: "doc",
                        projectId: this.$route.query.id,
                    });
                    this.$store.commit("apidoc/changeCurrentTab", {
                        _id: res.data._id,
                        name: res.data.name,
                        changed: res.data.changed,
                        tail: res.data.method,
                        tabType: "doc",
                        projectId: this.$route.query.id,
                    });
                }
            }).catch((err) => {
                this.$errorThrow(err, this);
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
        //删除某一项
        handleDeleteItem(data, node) {
            const deleteIds = [];
            deleteIds.push(data._id); //删除自己
            if (data.isFolder) { //删除所有子元素
                forEachForest(data.children, (item) => {
                    deleteIds.push(item._id);
                });
            }
            this.$confirm(`此操作将永久删除 ${data.name} 节点, 是否继续?`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.axios.delete("/api/project/doc", { data: { projectId: this.$route.query.id, ids: deleteIds } }).then(() => {
                    const pNode = node.parent;
                    if (pNode && pNode.level !== 0) {
                        const nodeIndex = pNode.data.children.findIndex((val) => val._id === data._id);
                        pNode.data.children.splice(nodeIndex, 1)
                    } else {
                        const nodeIndex = this.navTreeData.findIndex((val) => val._id === data._id);
                        this.navTreeData.splice(nodeIndex, 1);
                    }
                    this.handleDeleteTabsById(deleteIds);
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
        //批量删除
        handleDeleteManyItem() {
            const deleteIds = [];
            const selectNodeCopy = this.multiSelectNode; //点击节点会清空选中数据
            this.multiSelectNode.forEach((val) => {
                deleteIds.push(val.data._id);
                if (val.data.isFolder) { //删除所有子元素
                    forEachForest(val.data.children || [], (item) => {
                        deleteIds.push(item._id);
                    });
                }
            });
            this.$confirm(`确认删除选中的${deleteIds.length}个节点, 是否继续?`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.axios.delete("/api/project/doc", { data: { projectId: this.$route.query.id, ids: deleteIds } }).then(() => {
                    selectNodeCopy.forEach((delNode) => {
                        const pNode = delNode.parent;
                        if (pNode && pNode.level !== 0) { //非根元素
                            const nodeIndex = pNode.data.children.findIndex((val) => val._id === delNode.data._id);
                            pNode.data.children.splice(nodeIndex, 1)
                        } else { //根元素
                            const nodeIndex = this.navTreeData.findIndex((val) => val._id === delNode.data._id);
                            this.navTreeData.splice(nodeIndex, 1);
                        }
                        this.handleDeleteTabsById(deleteIds);
                    })
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
        //根据id删除tab
        handleDeleteTabsById(deleteIds) {
            this.$store.commit("apidoc/deleteTabById", {
                projectId: this.$route.query.id,
                deleteIds,
            });
            if (!this.tabs.find((val) => val._id === this.currentSelectDoc._id)) { //关闭左侧后若在tabs里面无法找到选中节点，则取第一个节点为选中节点
                this.$store.commit("apidoc/changeCurrentTab", {
                    _id: this.tabs[this.tabs.length - 1]._id,
                    projectId: this.$route.query.id,
                    name: this.tabs[this.tabs.length - 1].name,
                    changed: this.tabs[this.tabs.length - 1].changed,
                    tail: this.tabs[this.tabs.length - 1].tail,
                    tabType: this.tabs[this.tabs.length - 1].tabType,
                });
            }
        },
        //重命名某个节点
        handleChangeNodeName(data) {
            this.renameNodeId = "";
            this.isRename = false;
            this.enableDrag = true; //改名以后允许节点拖拽
            if (data.name.trim() === "") {
                data.name = data._name;
                return;
            }
            if (data.name === data._name) {
                return;
            }
            const params = {
                _id: data._id,
                projectId: this.$route.query.id,
                name: data.name,
            };
            this.axios.put("/api/project/change_doc_info", params).then(() => {
                this.$store.commit("apidoc/changeTabInfoById", {
                    _id: data._id,
                    projectId: this.$route.query.id,
                    name: data.name,
                });
                if (this.currentSelectDoc._id === data._id) {
                    this.$store.commit("apidoc/changeCurrentTabInfo", {
                        projectId: this.$route.query.id,
                        name: data.name,
                    });
                }
            }).catch((err) => {
                data.name = data._name; //修改出错后回复文档名称
                this.$errorThrow(err, this);
            });
            this.renameNodeId = "";
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
        //以模板新增
        addByTemplate() {
            this.dialogVisible5 = true;
        },

        //=====================================其他操作=====================================//
        //点击banner区域
        handleClickBanner() {
            this.currentSelectBannerNode = "root";
        },
        //处理鼠标按下事件
        handleResizeMousedown(e) {
            this.mousedownLeft = e.clientX;
            this.bannerWidth = this.$refs.banner.getBoundingClientRect().width;
            this.isDragging = true;
            document.documentElement.addEventListener("mousemove", this.handleResizeMousemove);
        },
        //处理鼠标移动事件
        handleResizeMousemove(e) {
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
.banner {
    width: size(300);
    height: 100%;
    border-right: 1px solid $gray-400;
    display: flex;
    flex-direction: column;
    position: relative;
    .collapse-transition {
        transition: none;
    }
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
        display: flex;
        flex-direction: column;
        .custom-tree-node {
            @include custom-tree-node;
        }
    }
}
//下拉菜单
.dropdown-item {
    width: size(150);
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>
