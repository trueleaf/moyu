/*
    创建者：shuxiaokai
    创建时间：2020-05-25 12:26
    模块名称：菜单管理
    备注：xxxx
*/
<template>
    <div class="g-menu">
        <s-left-right>
            <s-card slot="left" v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" title="菜单列表" class="tree" @contextmenu.native="handleContextmenuBlankTree">
                <el-button slot="operation" size="mini" type="text" @click="handleOpenAddDialog">新增</el-button>
                <el-tree
                        ref="docTree"
                        :data="treeData"
                        node-key="id"
                        :draggable="true"
                        empty-text="暂无数据"
                        :expand-on-click-node="false"
                        :render-content="renderContent"
                        :highlight-current="true"
                        :default-expanded-keys="defaultExpandKeys"
                        @node-drop="handleNodeDropSuccess"
                        @node-expand="nodeExpand"
                        @node-collapse="nodeCollapse"
                        @current-change="handleNodeChange"
                        @node-click="handleNodeClick"
                        @node-contextmenu="handleContextmenu"
                >
                </el-tree>
            </s-card>
            <s-card slot="right" title="修改菜单">
                <s-form v-if="currentActiveNode" ref="form2" showRules :editData="currentActiveNode">
                    <s-form-item label="名称" vModel="name" required oneLine></s-form-item>
                    <s-form-item label="路径" vModel="path" required oneLine></s-form-item>
                    <s-form-item type="submit">
                        <el-button :loading="loading3" type="primary" size="mini" @click="handleEditMenu">确认修改</el-button>
                    </s-form-item>
                </s-form>
            </s-card>
        </s-left-right>
        <s-dialog title="新增菜单" :isShow.sync="isShow" width="40%">
            <s-form v-if="isShow" ref="form" showTip :editData="formInfo">
                <s-form-item label="菜单名称" vModel="name" oneLine required></s-form-item>
                <s-form-item label="路径" vModel="path" oneLine required></s-form-item>
            </s-form>
            <div slot="footer">
                <el-button :loading="loading2" size="mini" type="primary" @click="handleAddMenu">确定</el-button>
                <el-button size="mini" type="warning" @click="isShow = false">取消</el-button>
            </div>
        </s-dialog>
    </div>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import Vue from "vue";
import { recursion, findParentNode } from "@/lib/index";
import contextmenu from "./children/contextmenu.vue";

export default {
    data() {
        return {
            //=====================================树形组件====================================//
            treeData: [],
            mouseContext: null, //鼠标右键实例
            parentId: "", //当前操作元素父元素id
            currentActiveNode: null, //当前被选中的元素
            defaultExpandKeys: [], //默认展开组件
            //=====================================添加菜单====================================//
            formInfo: {},
            //=====================================其他参数====================================//
            loading: false, //菜单加载
            loading2: false, //新增菜单添加按钮
            loading3: false, //修改菜单按钮
            isShow: false, //是否显示菜单弹窗
        };
    },
    created() {
        this.getData();
        document.body.addEventListener("click", () => {
            if (this.mouseContext) {
                document.body.removeChild(this.mouseContext.$el);
                this.mouseContext = null;
            }
        });
    },
    methods: {
        //=====================================数据获取====================================//
        //获取树形菜单结构
        getData() {
            this.loading = true;
            this.axios.get("/api/security/client_menu_tree").then((res) => {
                recursion({
                    data: res.data,
                    before: (val) => {
                        val.id = val._id;
                    },
                    condition: (val) => val.children && val.children.length > 0,
                    next: (val) => val.children,
                });
                this.treeData = res.data;
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================树形组件渲染====================================//
        //渲染树形组件
        renderContent(h, { data }) {
            // eslint-disable-next-line max-len
            const iconBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACRElEQVRYR+2XQWtTQRDH//NMqkmgeRS1qR6MFws1hx48iZD6CYyg4EkRquitfgFTv4B60SJCq3dBPQoe0oOgeDBBqUI9RKRqUJtXq01e0vdG5tm0NSTZ102iRBx4PNjZnf3t7MzuDmFNLsy8jsNx0gROAWTW2nX+DOQNF8dvnk9kVeOp1uHi7VcTIFxjIEfMlrQbRIH+SHDQIARUhkS/UnHMcsVdg2eLXDqqgtgE8DIDouTUeMJrKxbZtMl+ASDuZ3Lpk5lbxOzcIkbj/cjmvwFQQzQFKBTtFBPf9zv5ZoAzyb2wVlbx8HlBCdEU4GOxNElEaV2A+K4Qsu+WPQhmXjKYxhptR1cBBF4F0XUAgfhk2ZjOLDiVqvO93hN/BKAVREcBns5beJT7gmg44GVCvRQsG28+/IABPLkxnjgi+o4CiMG7swvIfy61jN1YNPg1fXJ4Z1cAVFlz5d5bDJl9S5dPHPAOrI574N8DkBSSfS1XXdXiGuqTIwMYGxlY1215C0pVF8/mvbtJS+RElK8mWwbQmrXFoP8AvecByYJbj99rh8LwnghOHR5qLwhVR2srOjMShBneeNH13hZo+77JwN70wF+NAZlc7gJdkYfJsUO728sCSUXdy2jQ3I5Q0GgPQHf1jcb5DkKdwsQPqG8AKc3KKGeJaJ8fw377CECoj3JXTx8crXuS/SpOwcgyYaM4DQdifotTFcRq1d2xbDsxMC5NnUtc/w1AynNynElmThFRVGVMRy8lGhE9KG2LTNw5u99b5E8iCxg/2kxzLAAAAABJRU5ErkJggg==";
            const navTitleDom = this.getRenderNavTitleDom(data);
            const navMoreDom = this.getRenderNavMoreDom(data);
            return (
                <div class={["custom-tree-node"]} on-mouseover={(e) => { e.target.classList.add("active"); }} on-mouseleave={(e) => { e.target.classList.remove("active"); }}>
                    <img src={iconBase64} width="16px" height="16px"/>
                    { navTitleDom }
                    { navMoreDom }
                </div>
            );
        },
        //渲染导航title文字或者编辑时候的输入框
        getRenderNavTitleDom(data) {
            const isActiveTitle = this.currentFileTab && this.currentFileTab.id === data._id;
            return (<span class={["node-name", "text-ellipsis", "ml-1", isActiveTitle ? "bg-active" : ""]} title={data.name}>{data.name}</span>);
        },
        //渲染导航文字末尾更多选项
        getRenderNavMoreDom(data) {
            return (
                <el-dropdown class="node-more ml-auto mr-2" trigger="hover" nativeOnClick={ (e) => { e.stopPropagation(); } } on-command={(command) => { this.handleSelectDropdown(command, data); }}>
                    <span class="el-icon-more"></span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="newMenu">新增菜单</el-dropdown-item>
                        <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            );
        },
        //=====================================树形组件操作相关====================================//
        //拖拽节点
        handleNodeDropSuccess(node, dropNode, type) {
            const params = {
                _id: node.data._id, //当前节点id
                pid: "", //父元素
                sort: 0, //当前节点排序效果
            };
            let pNode = null;
            if ((node.level !== dropNode.level) || (node.level === dropNode.level && type === "inner")) { //将节点放入子节点中
                pNode = findParentNode(node.data._id, this.treeData);
                params.pid = pNode ? pNode.id : "";
                while (pNode != null) {
                    pNode = findParentNode(pNode._id, this.treeData);
                }
            } else if (node.level === dropNode.level && type !== "inner") {
                params.pid = node.data.pid || "";
                pNode = findParentNode(node.data._id, this.treeData);
                while (pNode != null) {
                    pNode = findParentNode(pNode._id, this.treeData);
                }
            }
            if (type === "after") { //说明这个节点是第一个节点
                params.sort = dropNode.data.sort - 1;
            } else if (type === "before") {
                params.sort = dropNode.data.sort + 1;
            } else if (type === "inner") {
                params.sort = Date.now();
            }
            this.axios.put("/api/security/client_menu_position", params).then(() => {}).catch((err) => {
                this.$errorThrow(err, this);
            });
        },
        //点击节点
        handleNodeClick(data) {
            this.currentActiveNode = data;
            // this.defaultExpandKeys.push(data._id);
        },
        //节点改变的时候
        handleNodeChange() {
            this.clearContextNode();
        },
        //节点打开
        nodeExpand() {
            this.clearContextNode();
        },
        //节点收缩
        nodeCollapse() {
            this.clearContextNode();
        },
        //树形节点上面右键
        handleContextmenu(e, data) {
            e.stopPropagation();
            const ContextmenuConstructor = Vue.extend(contextmenu);
            const x = e.clientX; //当前点击位置
            const y = e.clientY; //当前点击位置
            if (this.mouseContext) {
                document.body.removeChild(this.mouseContext.$el);
                this.mouseContext = null;
            }
            this.mouseContext = new ContextmenuConstructor({
                propsData: {
                    operations: ["add", "delete"],
                    left: x,
                    top: y,
                },
            }).$mount();
            document.body.appendChild(this.mouseContext.$el);
            this.mouseContext.$on("menu", () => {
                this.isShow = true;
                this.parentId = data._id;
            });
            this.mouseContext.$on("delete", () => {
                this.deleteCurrentNode(data);
            });
        },
        //点击空白处弹出新增根节点
        handleContextmenuBlankTree(e) {
            e.stopPropagation();
            e.preventDefault();
            // this.currentActiveNode = {};
            const ContextmenuConstructor = Vue.extend(contextmenu);
            const x = e.clientX; //当前点击位置
            const y = e.clientY; //当前点击位置
            if (this.mouseContext) {
                document.body.removeChild(this.mouseContext.$el);
                this.mouseContext = null;
            }
            this.mouseContext = new ContextmenuConstructor({
                propsData: {
                    operations: ["add"],
                    left: x,
                    top: y,
                },
            }).$mount();
            document.body.appendChild(this.mouseContext.$el);
            this.mouseContext.$on("menu", () => {
                this.isShow = true;
                this.parentId = "";
            });
        },
        //清除鼠标右键dom节点信息
        clearContextNode() {
            if (this.mouseContext) {
                document.body.removeChild(this.mouseContext.$el);
                this.mouseContext = null;
            }
        },
        //下拉框选择 重命名，删除，新增...
        handleSelectDropdown(command, data) {
            /*eslint-disable indent*/
            switch (command) {
                case "newMenu":
                    this.handleOpenAddDialog();
                    this.parentId = data._id;
                    break;
                case "delete":
                    this.deleteCurrentNode(data);
                    break;
                default:
                    break;
            }
        },
        //删除节点
        deleteCurrentNode(data) {
            const cpData = JSON.parse(JSON.stringify(data));
            const ids = [cpData._id];
            recursion({
                data: cpData.children || [],
                before: (val) => {
                    ids.push(val._id);
                },
                condition: (val) => val.children && val.children.length > 0,
                next: (val) => val.children || [],
            });
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
                    this.$errorThrow(err, this);
                });
            }).catch((err) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        //=====================================前后端交互====================================//
        handleAddMenu() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading2 = true;
                    const params = {
                        ...this.formInfo,
                        pid: this.parentId,
                    };
                    this.axios.post("/api/security/client_menu", params).then((res) => {
                        this.getData();
                        this.isShow = false;
                        this.defaultExpandKeys.push(res.data._id);
                    }).catch((err) => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading2 = false;
                    });
                } else {
                    this.$nextTick(() => {
                        const input = document.querySelector(".el-form-item.is-error input");
                        if (input) {
                            input.focus();
                        }
                    });
                    this.loading2 = false;
                }
            });
        },
        handleEditMenu() {
            this.$refs.form2.validate((valid) => {
                if (valid) {
                    this.loading3 = true;
                    this.axios.put("/api/security/client_menu", this.currentActiveNode).then(() => {
                        this.$message.success("修改成功");
                    }).catch((err) => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading3 = false;
                    });
                } else {
                    this.$nextTick(() => {
                        const input = document.querySelector(".el-form-item.is-error input");
                        if (input) {
                            input.focus();
                        }
                    });
                }
            });
        },
        //=====================================其他操作====================================//
        handleOpenAddDialog() {
            this.parentId = "";
            this.formInfo = {};
            this.isShow = true;
        },
    },
};
</script>

<style lang="scss">
    .g-menu {
        display: flex;
        .tree {
            height: size(500);
            flex: 0 0 size(400);
            display: flex;
            flex-direction: column;
            .el-tree-node__content {
                height: 35px;
            }
            .custom-tree-node {
                display: flex;
                align-items: center;
                height: 30px;
                width: 100%;
                .node-name {
                    display: inline-block;
                    max-width: 180px;
                }
                .bg-active {
                    background: $theme-color;
                    color: #fff;
                }
                .new-input {
                    margin-left: 10px;
                }
            }
            .el-dropdown {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
        .edit {
            margin-left: size(20);
        }
    }
</style>
