/*
    创建者：shuxiaokai
    创建时间：2021-05-17 22:56
    模块名称：
    备注：
*/
<template>
    <div>
        <div class="d-flex a-center mb-3">
            <span>添加用户：</span>
            <s-remote-select v-model="remoteQueryName" :remote-methods="getRemoteUserByName" :loading="loading2" placeholder="输入用户名或真实姓名查找用户" class="w-300px">
                <s-remote-select-item v-for="(item, index) in remoteMembers" :key="index">
                    <div class="d-flex a-center j-between w-100 h-100" @click="handleSelectUser(item)">
                        <span>{{ item.loginName }}</span>
                        <span>{{ item.realName }}</span>
                    </div>
                </s-remote-select-item>
            </s-remote-select>
        </div>
        <!-- 表格展示 -->
        <s-loading :loading="loading">
            <el-table :data="selectedUserData" stripe border size="mini" max-height="300px">
                <el-table-column prop="loginName" label="用户名" align="center"></el-table-column>
                <el-table-column prop="realName" label="真实姓名" align="center"></el-table-column>
                <el-table-column label="角色(权限)" align="center">
                    <template slot-scope="scope">
                        <el-select :value="scope.row.permission" size="mini" @change="(val) => { handleChangePermission(val, scope) }">
                            <el-option label="只读" value="readOnly">
                                <template>
                                    <span>只读</span>
                                    <span class="gray-500">(仅查看项目)</span>
                                </template>
                            </el-option>
                            <el-option label="读写" value="readAndWrite">
                                <template>
                                    <span>读写</span>
                                    <span class="gray-500">(修改和编辑文档)</span>
                                </template>
                            </el-option>
                            <el-option label="管理员" value="admin">
                                <template>
                                    <span>管理员</span>
                                    <span class="gray-500">(添加新成员)</span>
                                </template>
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200px">
                    <template slot-scope="scope">
                        <el-button v-if="myLoginName === scope.row.loginName" type="text" size="mini" @click="handleLeaveGroup(scope)">退出</el-button>
                        <el-button v-else type="text" size="mini" @click="handleDeleteMember(scope)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </s-loading>
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            //=================================表单与表格参数================================//
            remoteMembers: [], //------远程用户列表
            selectedUserData: [], //-----已选中的用户
            remoteQueryName: "", //----用户名称
            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
            loading: false, //---------项目详情
            loading2: false, //--------查询用户列表
        };
    },
    computed: {
        myLoginName() {
            return this.$store.state.permission.userInfo.loginName;
        },
    },
    created() {
        this.getProjectInfo();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //获取项目基本信息
        getProjectInfo() {
            this.loading = true;
            this.axios.get("/api/project/project_info", { params: { _id: this.id } }).then((res) => {
                this.selectedUserData = res.data.members || [];
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //根据名称查询用户列表
        getRemoteUserByName(query) {
            this.loading2 = true;
            const params = {
                name: query,
            };
            this.axios.get("/api/security/userListByName", { params }).then((res) => {
                this.remoteMembers = res.data;
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading2 = false;
            });
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //新增成员
        handleSelectUser(item) {
            this.remoteMembers = [];
            this.remoteQueryName = "";
            const hasUser = this.selectedUserData.find((val) => val.userId === item.userId);
            if (hasUser) {
                this.$message.warning("用户已经存在，请勿重复添加");
                return;
            }
            const params = {
                loginName: item.loginName,
                realName: item.realName,
                permission: "readAndWrite",
                userId: item.userId,
                projectId: this.id,
            };
            this.axios.post("/api/project/add_user", params).then(() => {
                this.$set(item, "permission", "readAndWrite");
                this.selectedUserData.push(item);
            }).catch((err) => {
                this.$errorThrow(err, this);
            });
        },
        //删除成员
        handleDeleteMember(scope) {
            this.$confirm("确认删除当前成员吗?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = {
                    userId: scope.row.userId,
                    projectId: this.id,
                };
                this.axios.delete("/api/project/delete_user", { data: params }).then(() => {
                    this.selectedUserData.splice(scope.$index, 1);
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
        //离开团队
        handleLeaveGroup(scope) {
            const { userInfo } = this.$store.state.permission;
            const hasAdmin = this.selectedUserData.find((info) => {
                if (info.userId !== userInfo.id && info.permission === "admin") {
                    return true
                }
                return false;
            });
            if (!hasAdmin) {
                this.$message.error("团队至少保留一个管理员");
                return;
            }
            this.$confirm("确认离开当前团队吗?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = {
                    userId: scope.row.userId,
                    projectId: this.id,
                };
                this.axios.delete("/api/project/delete_user", { data: params }).then(() => {
                    this.selectedUserData.splice(scope.$index, 1);
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
        //改变成员权限
        handleChangePermission(value, scope) {
            const oldPermission = scope.row.permission;
            const hasAdmin = this.selectedUserData.find((info) => {
                if (info.permission === "admin") {
                    return true
                }
                return false;
            });
            if (!hasAdmin) {
                this.$message.error("团队至少保留一个管理员");
                return;
            }
            if (oldPermission === "admin") {
                this.$confirm("确认改变当前管理员权限吗?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }).then(() => {
                    const params = {
                        userId: scope.row.userId,
                        projectId: this.id,
                        permission: value,
                    };
                    scope.row.permission = value;
                    this.axios.put("/api/project/change_permission", params).then(() => {
                    }).catch((err) => {
                        scope.row.permission = oldPermission;
                        this.$errorThrow(err, this);
                    });
                }).catch((err) => {
                    if (err === "cancel" || err === "close") {
                        return;
                    }
                    this.$errorThrow(err, this);
                });
            } else {
                const params = {
                    userId: scope.row.userId,
                    projectId: this.id,
                    permission: value,
                };
                scope.row.permission = value;
                this.axios.put("/api/project/change_permission", params).then(() => {
                }).catch((err) => {
                    scope.row.permission = oldPermission;
                    this.$errorThrow(err, this);
                });
            }
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">

</style>
