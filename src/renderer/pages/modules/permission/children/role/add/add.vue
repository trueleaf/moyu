/*
    创建者：shuxiaokai
    创建时间：2020-05-24 19:44
    模块名称：角色分配
    备注：xxxx
*/
<template>
    <s-dialog class="g-role" title="新增角色" :isShow="isShow" @close="handleClose">
        <div>
            <s-fieldset title="基本信息">
                <s-form ref="form" :formInfo="formInfo">
                    <s-form-item label="角色名称" vModel="roleName" required oneLine></s-form-item>
                    <s-form-item label="备注" vModel="remark" required oneLine></s-form-item>
                </s-form>
            </s-fieldset>
            <s-fieldset title="权限选择">
                <el-tabs v-model="activeName">
                    <!-- 前端路由 -->
                    <el-tab-pane name="clientRoute" label="前端路由">
                        <s-card class="wrap">
                            <div v-for="(item, title) in clientRoutes" :key="title">
                                <el-divider content-position="left">{{ title }}</el-divider>
                                <div class="pl-5">
                                    <el-checkbox
                                            v-model="item.__select"
                                            :indeterminate="!!formInfo.clientRoutes.find((val) => item.find(i => i._id === val)) && !item.every((val) => formInfo.clientRoutes.find(i => i === val._id ))"
                                            label="全选"
                                            @change="handleSelectAllClientRoutes(item)">
                                    </el-checkbox>
                                    <el-checkbox-group v-model="formInfo.clientRoutes" @change="handleCheckSelectAllClientRoutes(item)">
                                        <el-checkbox v-for="(item2, index) in item" :key="index" :label="item2._id">{{ item2.name }}</el-checkbox>
                                    </el-checkbox-group>
                                </div>
                            </div>
                        </s-card>
                    </el-tab-pane>
                    <!-- 后端路由 -->
                    <el-tab-pane name="serverRoute" label="后端路由">
                        <s-card class="wrap">
                            <div v-for="(item, title) in serverRoutes" :key="title">
                                <el-divider content-position="left">{{ title }}</el-divider>
                                <div class="pl-5">
                                    <el-checkbox
                                            v-model="item.__select"
                                            :indeterminate="!!formInfo.serverRoutes.find((val) => item.find(i => i._id === val)) && !item.every((val) => formInfo.serverRoutes.find(i => i === val._id ))"
                                            label="全选"
                                            @change="handleSelectAllServerRoutes(item)">
                                    </el-checkbox>
                                    <el-checkbox-group v-model="formInfo.serverRoutes" @change="handleCheckSelectAllServerRoutes(item)">
                                        <el-checkbox v-for="(item2, index) in item" :key="index" :label="item2._id">{{ item2.name }}</el-checkbox>
                                    </el-checkbox-group>
                                </div>
                            </div>
                        </s-card>
                    </el-tab-pane>
                    <!-- 前端菜单 -->
                    <el-tab-pane name="clientMenu" label="前端菜单">
                        <div class="wrap">
                            <el-tree
                                    ref="docTree"
                                    class="tree"
                                    :data="clientMenu"
                                    show-checkbox
                                    node-key="_id"
                                    :draggable="false"
                                    empty-text="暂无数据"
                                    :expand-on-click-node="false"
                                    :render-content="renderContent"
                                    :highlight-current="true"
                                    @check-change="handleSelectClientMenu"
                            >
                            </el-tree>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </s-fieldset>
        </div>
        <div slot="footer">
            <el-button :loading="loading" size="mini" type="primary" @click="handleSaveRole">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>

</template>

<script>
/* eslint-disable no-underscore-dangle */
import { recursion } from "@/lib/index";

export default {
    props: {
        isShow: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            //=========================================================================//
            activeName: "clientRoute",
            clientRoutes: {}, //前端路由列表
            serverRoutes: {}, //后端路由列表
            clientMenu: [], //前端菜单
            formInfo: {
                clientBanner: [], //菜单ids
                clientRoutes: [], //已选前端路由
                serverRoutes: [], //已选后端路由
            },
            //=========================================================================//
            loading: false,
        };
    },
    created() {
        this.getClientRoutes(); //获取前端路由
        this.getServerRoutes(); //获取后端路由
        this.getClientMenu(); //获取前端菜单
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取树形菜单结构
        getClientMenu() {
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
                this.clientMenu = res.data;
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //获取前端路由信息
        getClientRoutes() {
            this.loading = true;
            this.axios.get("/api/security/client_routes").then((res) => {
                const { data } = res;
                data.forEach((val) => {
                    if (!this.clientRoutes[val.groupName || "__default"]) {
                        this.$set(this.clientRoutes, val.groupName || "__default", []);
                    }
                    this.clientRoutes[val.groupName || "__default"].push({
                        ...val,
                    });
                });
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //获取后端路由信息
        getServerRoutes() {
            this.loading3 = true;
            this.axios.get("/api/security/server_routes").then((res) => {
                const { data } = res;
                data.forEach((val) => {
                    if (!this.serverRoutes[val.groupName || "__default"]) {
                        this.$set(this.serverRoutes, val.groupName || "__default", []);
                    }
                    this.serverRoutes[val.groupName || "__default"].push({
                        ...val,
                    });
                });
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading3 = false;
            });
        },
        //=====================================前后端交互====================================//
        //保存角色
        handleSaveRole() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const params = {
                        ...this.formInfo,
                    };
                    this.loading = true;
                    this.axios.post("/api/security/role", params).then(() => {
                        this.$emit("success");
                        this.handleClose();
                    }).catch((err) => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading = false;
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
        //=====================================组件间交互====================================//
        //全选前端路由
        handleSelectAllClientRoutes(routes) {
            if (routes.__select === true) {
                routes.forEach((route) => {
                    if (!this.formInfo.clientRoutes.find((val) => val === route._id)) {
                        this.formInfo.clientRoutes.push(route._id);
                    }
                });
            } else {
                routes.forEach((route) => {
                    const index = this.formInfo.clientRoutes.findIndex((val) => val === route._id);
                    this.formInfo.clientRoutes.splice(index, 1);
                });
            }
        },
        //全选后端路由
        handleSelectAllServerRoutes(routes) {
            if (routes.__select === true) {
                routes.forEach((route) => {
                    if (!this.formInfo.serverRoutes.find((val) => val === route._id)) {
                        this.formInfo.serverRoutes.push(route._id);
                    }
                });
            } else {
                routes.forEach((route) => {
                    const index = this.formInfo.serverRoutes.findIndex((val) => val === route._id);
                    this.formInfo.serverRoutes.splice(index, 1);
                });
            }
        },
        //判断是否全选
        handleCheckSelectAllClientRoutes(item) {
            const isSelectAll = item.every((val) => this.formInfo.clientRoutes.find((v) => v === val._id));
            this.$set(item, "__select", isSelectAll);
        },
        handleCheckSelectAllServerRoutes(item) {
            const isSelectAll = item.every((val) => this.formInfo.serverRoutes.find((v) => v === val._id));
            this.$set(item, "__select", isSelectAll);
        },
        //=====================================树形组建操作==================================//
        //渲染树形组件
        renderContent(h, { data }) {
            const navTitleDom = this.getRenderNavTitleDom(data);
            return (
                <div class={["custom-tree-node"]} on-mouseover={(e) => { e.target.classList.add("active"); }} on-mouseleave={(e) => { e.target.classList.remove("active"); }}>
                    { navTitleDom }
                </div>
            );
        },
        //渲染导航title文字或者编辑时候的输入框
        getRenderNavTitleDom(data) {
            const isActiveTitle = this.currentFileTab && this.currentFileTab.id === data._id;
            return (<span class={["node-name", "text-ellipsis", "ml-1", isActiveTitle ? "bg-active" : ""]} title={data.name}>{data.name}</span>);
        },
        //选择前端菜单
        handleSelectClientMenu() {
            const checkKeys = this.$refs.docTree.getCheckedKeys();
            const halfCheckKeys = this.$refs.docTree.getHalfCheckedKeys();
            this.formInfo.clientBanner = checkKeys.concat(halfCheckKeys);
        },
        //=====================================其他操作=====================================//
        handleClose() {
            this.$emit("update:isShow", false);
            this.$emit("close");
        },
    },
};
</script>

<style lang="scss">
.g-role {
    .tree {
        min-height: size(200);
        flex: 0 0 size(400);
        display: flex;
        flex-direction: column;
        .el-tree-node__content {
            height: 35px;
        }
        .el-checkbox {
            margin-bottom: 0;
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
        }
    }
    .el-checkbox {
        margin-bottom: size(10);
    }
    .wrap {
        min-height: size(300);
        height: 40vh;
        overflow-y: auto;
    }
    .el-dialog__body {
        padding-top: 0;
        padding-bottom: 0;
    }
}
</style>
