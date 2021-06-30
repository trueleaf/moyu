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
                        @node-expand="nodeExpand"
                        @node-collapse="nodeCollapse"
                        @current-change="handleNodeChange"
                        @node-click="handleNodeClick"
                        @node-contextmenu="handleContextmenu"
                    >
                        <template #default="{ data }">
                            <div class="custom-tree-node">
                                <span>{{ data.name }}</span>
                            </div>
                        </template>
                    </el-tree>
                </s-card>
            </s-loading>
        </template>
        <template #right>
            aaa
        </template>
        <s-dialog v-model="addMenuDialogVisible" title="新增菜单" width="40%">
            <s-form ref="form" :edit-data="formInfo">
                <s-form-item label="菜单名称" prop="name" one-line required></s-form-item>
                <s-form-item label="路径" prop="path" one-line required></s-form-item>
            </s-form>
            <template #footer>
                <div>
                    <el-button :loading="loading2" size="mini" type="primary" @click="handleAddMenu">确定</el-button>
                    <el-button size="mini" type="warning" @click="addMenuDialogVisible = false">取消</el-button>
                </div>
            </template>
        </s-dialog>
    </s-left-right>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { Response, ResClientMenu } from "@@/global"

export default defineComponent({
    data() {
        return {
            //=====================================树形组件====================================//
            treeData: [] as ResClientMenu[],
            mouseContext: null, //鼠标右键实例
            parentId: "", //当前操作元素父元素id
            // currentActiveNode: null, //当前被选中的元素
            defaultExpandKeys: [] as string[], //默认展开组件
            //=====================================添加菜单====================================//
            formInfo: {},
            //=====================================其他参数====================================//
            loading: false, //菜单加载
            loading2: false, //新增菜单添加按钮
            loading3: false, //修改菜单按钮
            addMenuDialogVisible: false,
        };
    },
    mounted() {
        this.getData();
    },
    methods: {
        handleNodeDropSuccess() {
            console.log(22)
        },
        //点击节点
        handleNodeClick(data: string) {
            console.log(data)
            // this.currentActiveNode = data;
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
        handleOpenAddDialog() {
            this.parentId = "";
            this.formInfo = {};
            this.addMenuDialogVisible = true;
        },
        handleAddMenu() {
            console.log(222)
        },
    },
})
</script>

<style lang="scss">
.menu-tree {
    .custom-tree-node {
        @include custom-tree-node;
    }
}
</style>
