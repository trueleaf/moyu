/*
    创建者：shuxiaokai
    创建时间：2021-06-28 21:04
    模块名称：
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" title="新增角色" @close="handleClose">
        <s-fieldset title="基本信息">
            <s-form ref="form" :form-info="formInfo">
                <s-form-item label="角色名称" prop="roleName" required one-line></s-form-item>
                <s-form-item label="备注" prop="remark" required one-line></s-form-item>
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
                                <!-- <el-checkbox
                                    v-model="item.selected"
                                    :indeterminate="!!formInfo.clientRoutes.find((val) => item.find(i => i._id === val)) && !item.every((val) => formInfo.clientRoutes.find(i => i === val._id ))"
                                    label="全选"
                                    @change="handleSelectAllClientRoutes(item)"
                                >
                                </el-checkbox> -->
                                <el-checkbox-group v-model="formInfo.clientRoutes" @change="handleCheckSelectAllClientRoutes(item)">
                                    <el-checkbox v-for="(item2, index) in item.values" :key="index" :label="item2._id">{{ item2.name }}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </div>
                    </s-card>
                </el-tab-pane>
                <!-- 后端路由 -->
                <!-- <el-tab-pane name="serverRoute" label="后端路由">
                    <s-card class="wrap">
                        <div v-for="(item, title) in serverRoutes" :key="title">
                            <el-divider content-position="left">{{ title }}</el-divider>
                            <div class="pl-5">
                                <el-checkbox
                                    v-model="item.__select"
                                    :indeterminate="!!formInfo.serverRoutes.find((val) => item.find(i => i._id === val)) && !item.every((val) => formInfo.serverRoutes.find(i => i === val._id ))"
                                    label="全选"
                                    @change="handleSelectAllServerRoutes(item)"
                                >
                                </el-checkbox>
                                <el-checkbox-group v-model="formInfo.serverRoutes" @change="handleCheckSelectAllServerRoutes(item)">
                                    <el-checkbox v-for="(item2, index) in item" :key="index" :label="item2._id">{{ item2.name }}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </div>
                    </s-card>
                </el-tab-pane> -->
                <!-- 前端菜单 -->
                <!-- <el-tab-pane name="clientMenu" label="前端菜单">
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
                </el-tab-pane> -->
            </el-tabs>
        </s-fieldset>
        <template #footer>
            <!-- <el-button :loading="loading" size="mini" type="primary" @click="handleSaveRole">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button> -->
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { ClientRoute, Response } from "@@/global"

type RouteInfo = {
    selected: boolean,
    values: ClientRoute[]
}
type ClientGroupRoutes = {
    [propName: string]: RouteInfo
}

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue", "success"],
    data() {
        return {
            //=========================================================================//
            formInfo: {
                clientBanner: [], //菜单ids
                clientRoutes: [], //已选前端路由
                serverRoutes: [], //已选后端路由
            },
            clientRoutes: {} as ClientGroupRoutes, //前端路由列表
            serverRoutes: {}, //后端路由列表
            clientMenu: [], //前端菜单
            //=========================================================================//
            activeName: "clientRoute",
            loading: false,
        };
    },
    created() {
        this.getClientRoutes(); //获取前端路由
        // this.getServerRoutes(); //获取后端路由
        // this.getClientMenu(); //获取前端菜单
    },
    methods: {
        //获取树形菜单结构
        getClientMenu() {
            this.loading = true;
            this.axios.get("/api/security/client_menu_tree").then((res) => {
                this.$helper.forEachForest(res.data, (data) => {
                    data.id = data._id;
                });
                this.clientMenu = res.data;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //获取前端路由信息
        getClientRoutes() {
            this.loading = true;
            this.axios.get<Response<ClientRoute[]>, Response<ClientRoute[]>>("/api/security/client_routes").then((res) => {
                res.data.forEach((val) => {
                    if (!this.clientRoutes[val.groupName || "__default"]) {
                        this.clientRoutes[val.groupName || "__default"] = {
                            selected: false,
                            values: [],
                        };
                    }
                    this.clientRoutes[val.groupName || "__default"].values.push({
                        ...val,
                    });
                });
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //获取后端路由信息
        getServerRoutes() {
            console.log(2)
            // this.loading3 = true;
            // this.axios.get("/api/security/server_routes").then((res) => {
            //     const { data } = res;
            //     data.forEach((val) => {
            //         if (!this.serverRoutes[val.groupName || "__default"]) {
            //             this.$set(this.serverRoutes, val.groupName || "__default", []);
            //         }
            //         this.serverRoutes[val.groupName || "__default"].push({
            //             ...val,
            //         });
            //     });
            // }).catch((err) => {
            //     console.error(err);
            // }).finally(() => {
            //     this.loading3 = false;
            // });
        },
        //选择全部路由
        handleSelectAllClientRoutes(item: RouteInfo) {
            console.log(item)
        },
        //
        handleCheckSelectAllClientRoutes(item: RouteInfo) {
            const isSelectAll = item.values.every((val) => this.formInfo.clientRoutes.find((v) => v === val._id));
            item.selected = isSelectAll
        },
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
    },
})
</script>

<style lang="scss">

</style>
