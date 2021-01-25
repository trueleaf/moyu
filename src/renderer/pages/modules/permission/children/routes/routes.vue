/*
    创建者：shuxiaokai
    创建时间：2020-05-21 17:36
    模块名称：权限
    备注：xxxx
*/
<template>
    <div class="g-permission">
        <!-- 可选权限 -->
        <s-left-right left-width="50%">
            <!-- 前端路由 -->
            <div slot="left">
                <el-divider content-position="left">前端路由</el-divider>
                <s-card-list v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" height="400px" @search="handleFilterClientRoute">
                    <div slot="top" class="group">
                        <div class="mb-2">
                            <el-checkbox-group v-model="clientSelectType">
                                <el-checkbox v-for="(item, index) in clientTypeArr" :key="index" :label="item.groupName"></el-checkbox>
                                <el-checkbox label="">_缺省</el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <div class="d-flex a-center">
                            <div class="flex0 mr-2">
                                <span>已选择</span>&nbsp;
                                <span class="orange">{{ selectClientRoutes.length }}</span>
                            </div>
                            <el-input v-model="clientTypeName" size="mini" placeholder="输入分类名称" maxlength="100" clearable></el-input>
                            <el-button :disabled="selectClientRoutes.length === 0" type="success" size="mini" title="至少选中一个才可以修改" @click="handleEditClientRouteType">批量修改分类</el-button>
                            <el-button type="success" size="mini" @click="isShow3 = true">新增前端路由</el-button>
                        </div>
                    </div>
                    <template v-if="_clientRoutes.length > 0">
                        <s-card-list-item v-for="(item, index) in _clientRoutes" :key="index" :title="item.name" :class="{active: item.__active}" @click.native.stop="handleSelectClientRoute(item)">
                            <span slot="title">
                                <span :title="item.name">{{ item.name }}</span>
                                <span :title="item.path" class="ml-1 gray-500">({{ item.path }})</span>
                            </span>
                            <el-button slot="tail" type="text" @click.stop="handleOpenClientEditDialog(item)">修改</el-button>
                            <el-button slot="tail" type="text" @click.stop="handleDeleteClientRoute(item)">删除</el-button>
                        </s-card-list-item>
                    </template>
                    <s-empty v-else></s-empty>
                </s-card-list>
            </div>
            <!-- 后端路由 -->
            <div slot="right">
                <el-divider content-position="left">后端路由</el-divider>
                <s-card-list v-loading="loading2" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" height="400px" @search="handleFilterServerRoute">
                    <div slot="top" class="group">
                        <div class="mb-2">
                            <el-checkbox-group v-model="serverSelectType">
                                <el-checkbox v-for="(item, index) in serverTypeArr" :key="index" :label="item.groupName"></el-checkbox>
                                <el-checkbox label="">_缺省</el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <div class="d-flex a-center">
                            <div class="flex0 mr-2">
                                <span>已选择</span>&nbsp;
                                <span class="orange">{{ selectServerRoutes.length }}</span>
                            </div>
                            <el-input v-model="serverTypeName" size="mini" placeholder="输入分类名称" maxlength="100" clearable></el-input>
                            <el-button :disabled="selectServerRoutes.length === 0" type="success" size="mini" title="至少选中一个才可以修改" @click="handleEditServerRouteType">批量修改分类</el-button>
                            <el-button type="success" size="mini" @click="isShow4 = true">新增后端路由</el-button>
                        </div>
                    </div>
                    <template v-if="_serverRoutes.length > 0">
                        <s-card-list-item v-for="(item, index) in _serverRoutes" :key="index" :title="item.name" :class="{active: item.__active}" @click.native.stop="handleSelectServerRoute(item)">
                            <span slot="title">
                                <span v-if="item.method === 'get'" :title="item.method" class="d-inline-block w-50px green">{{ item.method }}&nbsp;&nbsp;</span>
                                <span v-if="item.method === 'post'" :title="item.method" class="d-inline-block w-50px warning">{{ item.method }}&nbsp;&nbsp;</span>
                                <span v-if="item.method === 'put'" :title="item.method" class="d-inline-block w-50px blue">{{ item.method }}&nbsp;&nbsp;</span>
                                <span v-if="item.method === 'delete'" :title="item.method" class="d-inline-block w-50px red">del&nbsp;&nbsp;</span>
                                <span :title="item.name">{{ item.name }}</span>
                                <span :title="item.path" class="ml-1 gray-500">({{ item.path }})</span>
                            </span>
                            <el-button slot="tail" type="text" @click.stop="handleOpenServerEditDialog(item)">修改</el-button>
                            <el-button slot="tail" type="text" @click.stop="handleDeleteServerRoute(item)">删除</el-button>
                        </s-card-list-item>
                    </template>
                    <s-empty v-else></s-empty>
                </s-card-list>
            </div>
        </s-left-right>
        <!-- 修改前端路由 -->
        <s-edit-client-route-dialog :is-show.sync="isShow" :form-info="formInfo" @success="getClientRoutes"></s-edit-client-route-dialog>
        <!-- 新增前端路由 -->
        <s-add-client-route-dialog :is-show.sync="isShow3" @success="getClientRoutes"></s-add-client-route-dialog>
        <!-- 新增后端路由 -->
        <s-add-server-route-dialog :is-show.sync="isShow4" @success="getServerRoutes"></s-add-server-route-dialog>
        <!-- 修改后端路由 -->
        <s-edit-server-route-dialog :is-show.sync="isShow2" :form-info="formInfo2" @success="getServerRoutes"></s-edit-server-route-dialog>
    </div>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import { unique } from "@/lib";
import addClientRouteDialog from "./dialog/add-client.vue";
import editClientRouteDialog from "./dialog/edit-client.vue";
import addServerRouteDialog from "./dialog/add-server.vue";
import editServerRouteDialog from "./dialog/edit-server.vue";

export default {
    components: {
        "s-add-client-route-dialog": addClientRouteDialog,
        "s-edit-client-route-dialog": editClientRouteDialog,
        "s-add-server-route-dialog": addServerRouteDialog,
        "s-edit-server-route-dialog": editServerRouteDialog,
    },
    data() {
        return {
            //=================================前端路由信息========================================//
            clientRouteName: "", //前端路由名称(搜索)
            clientRoutes: [], //前端路由数组
            clientSelectType: [], //前端路由类型
            clientTypeArr: [], //前端路由分组信息
            formInfo: { _id: "" }, //修改前端路由数据
            clientTypeName: "", //前端分类名称(用于批量修改)
            //=====================================后端路由信息====================================//
            serverRouteName: "", //服务端路由名称(搜索)
            serverRoutes: [], //服务端路由数组
            serverSelectType: [], //服务端路由类型
            serverTypeArr: [], //服务端路由分组信息
            formInfo2: { _id: "" }, //修改服务端数据信息
            serverTypeName: "", //服务端分类名称(用于批量修改)
            //=====================================其他参数====================================//
            isShow: false, //是否展示前端路由修改弹窗
            isShow2: false, //是否展示后端路由修改弹窗
            isShow3: false, //新增前端路由
            isShow4: false, //新增后端路由
            loading: false, //请求前端路由
            loading2: false, //请求后端路由
        };
    },
    computed: {
        _clientRoutes() {
            return this.clientRoutes.filter((val) => {
                const matchedName = val.name.includes(this.clientRouteName);
                return matchedName && (this.clientSelectType.length === 0 || (this.clientSelectType.length > 0 && this.clientSelectType.includes(val.groupName)));
            });
        },
        _serverRoutes() {
            return this.serverRoutes.filter((val) => {
                const matchedName = val.name.includes(this.serverRouteName);
                return matchedName && (this.serverSelectType.length === 0 || (this.serverSelectType.length > 0 && this.serverSelectType.includes(val.groupName)));
            });
        },
        selectServerRoutes() { //已经选中得服务端路由
            return this.serverRoutes.filter((val) => val.__active);
        },
        selectClientRoutes() { //已经选中得前端路由
            return this.clientRoutes.filter((val) => val.__active);
        },
    },
    created() {
        this.getClientRoutes(); //获取前端路由
        this.getServerRoutes(); //获取后端路由
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取前端路由信息
        getClientRoutes() {
            this.loading = true;
            this.axios.get("/api/security/client_routes").then((res) => {
                this.clientRoutes = res.data;
                this.clientTypeArr = unique(res.data, "groupName");
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //获取后端路由信息
        getServerRoutes() {
            this.loading2 = true;
            this.axios.get("/api/security/server_routes").then((res) => {
                this.serverRoutes = res.data;
                this.serverTypeArr = unique(res.data, "groupName");
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading2 = false;
            });
        },
        //=====================================前端路由====================================//
        //选择前端路由
        handleSelectClientRoute(item) {
            if (!item.__active) {
                this.$set(item, "__active", true);
            } else {
                item.__active = !item.__active;
            }
        },
        //搜索前端路由
        handleFilterClientRoute(name) {
            this.clientRouteName = name;
        },
        //打开修改前端路由组件
        handleOpenClientEditDialog(item) {
            this.isShow = true;
            this.formInfo = JSON.parse(JSON.stringify(item));
        },
        //删除前端路由组件
        handleDeleteClientRoute(item) {
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = { ids: [item._id] };
                this.axios.delete("/api/security/client_routes", { data: params }).then(() => {
                    this.getClientRoutes();
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
        //批量修改前端路由分类
        handleEditClientRouteType() {
            const params = {
                ids: this.selectClientRoutes.map((val) => val._id),
                groupName: this.clientTypeName,
            };
            this.axios.put("/api/security/client_routes_type", params).then(() => {}).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.clientTypeName = "";
                this.clientRoutes.forEach((val) => {
                    val.__active = false;
                });
                this.getClientRoutes();
            });
        },
        //=====================================后端路由====================================//
        //选择后端路由
        handleSelectServerRoute(item) {
            if (!item.__active) {
                this.$set(item, "__active", true);
            } else {
                item.__active = !item.__active;
            }
        },
        //搜索后端路由
        handleFilterServerRoute(name) {
            this.serverRouteName = name;
        },
        //打开修改后端路由组件
        handleOpenServerEditDialog(item) {
            this.isShow2 = true;
            this.formInfo2 = JSON.parse(JSON.stringify(item));
        },
        //删除后端路由组件
        handleDeleteServerRoute(item) {
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = { ids: [item._id] };
                this.axios.delete("/api/security/server_routes", { data: params }).then(() => {
                    this.getServerRoutes();
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
        //批量修改分类
        handleEditServerRouteType() {
            const params = {
                ids: this.selectServerRoutes.map((val) => val._id),
                groupName: this.serverTypeName,
            };
            this.axios.put("/api/security/server_routes_type", params).then(() => {}).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.serverTypeName = "";
                this.serverRoutes.forEach((val) => {
                    val.__active = false;
                });
                this.getServerRoutes();
            });
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.g-permission {
    .group {
        padding: size(10) size(10);
        border-bottom: 1px solid $gray-300;
        .el-checkbox {
            margin-bottom: size(10);
        }
    }
}
</style>
