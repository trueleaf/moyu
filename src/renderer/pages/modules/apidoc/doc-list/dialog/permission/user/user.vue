/*
    创建者：shuxiaokai
    创建时间：2021-07-20 21:35
    模块名称：项目用户选择
    备注：
*/
<template>
    <div class="d-flex a-center mb-3">
        <span class="flex0">{{ $t("添加用户") }}：</span>
        <s-remote-select v-model="remoteQueryName" :remote-methods="getRemoteUserByName" :loading="loading2" :placeholder="$t('输入用户名或真实姓名查找用户')" class="w-300px">
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
        <el-table :data="selectedUserData" stripe border max-height="300px">
            <el-table-column prop="loginName" :label="$t('用户名')" align="center"></el-table-column>
            <el-table-column prop="realName" :label="$t('真实姓名')" align="center"></el-table-column>
            <el-table-column label="角色(权限)" align="center">
                <template #default="scope">
                    <el-select v-model="scope.row.permission" :size="config.renderConfig.layout.size" @change="handleChangePermission(scope.row)">
                        <el-option :label="$t('只读')" value="readOnly">
                            <span>{{ $t("只读") }}</span>
                            <span class="gray-500">({{ $t("仅查看项目") }})</span>
                        </el-option>
                        <el-option :label="$t('读写')" value="readAndWrite">
                            <span>{{ $t("读写") }}</span>
                            <span class="gray-500">({{ $t("新增和编辑文档") }})</span>
                        </el-option>
                        <el-option :label="$t('管理员')" value="admin">
                            <span>{{ $t("管理员") }}</span>
                            <span class="gray-500">({{ $t("添加新成员") }})</span>
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column :label="$t('操作')" align="center" width="200px">
                <template #default="scope">
                    <el-button v-if="selfLoginName === scope.row.loginName" type="primary" text @click="handleLeaveGroup(scope.row, scope.$index)">{{ $t("退出") }}</el-button>
                    <el-button v-else type="primary" text @click="handleDeleteMember(scope.row, scope.$index)">{{ $t("删除") }}</el-button>
                </template>
            </el-table-column>
        </el-table>
    </s-loading>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import type { ApidocProjectInfo, Response, ApidocProjectMemberInfo, ApidocProjectPermission } from "@@/global"

type PermissionUserInfo = ApidocProjectMemberInfo & { _permission: ApidocProjectPermission };

export default defineComponent({
    props: {
        id: {
            type: String,
            default: "",
        },
    },
    emits: ["leave"],
    data() {
        return {
            remoteMembers: [] as ApidocProjectMemberInfo[], //------远程用户列表
            selectedUserData: [] as ApidocProjectInfo["members"], //-----已选中的用户
            remoteQueryName: "", //----用户名称
            //===================================其他参数====================================//
            loading: false, //---------项目详情
            loading2: false, //--------查询用户列表
        };
    },
    computed: {
        selfLoginName(): string {
            return this.$store.state.permission.userInfo.loginName;
        },
    },
    created() {
        this.getApidocProjectMemberInfo();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //获取项目成员信息
        getApidocProjectMemberInfo() {
            this.loading = true;
            this.axios.get<Response<ApidocProjectMemberInfo[]>, Response<ApidocProjectMemberInfo[]>>("/api/project/project_members", { params: { _id: this.id } }).then((res) => {
                this.selectedUserData = res.data.map((v) => ({
                    ...v,
                    _permission: v.permission,
                })) || [];
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //根据名称查询用户列表
        getRemoteUserByName(query: string) {
            this.loading2 = true;
            const params = {
                name: query,
            };
            this.axios.get("/api/security/userListByName", { params }).then((res) => {
                this.remoteMembers = res.data;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading2 = false;
            });
        },
        //=====================================成员增删改查====================================//
        //新增成员
        handleSelectUser(item: ApidocProjectMemberInfo) {
            this.remoteMembers = [];
            this.remoteQueryName = "";
            const hasUser = this.selectedUserData.find((val) => val.userId === item.userId);
            if (hasUser) {
                this.$message.warning(this.$t("用户已经存在，请勿重复添加"));
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
                item.permission = "readAndWrite"
                this.selectedUserData.push(item);
            }).catch((err) => {
                console.error(err);
            });
        },
        //删除成员
        handleDeleteMember(row: PermissionUserInfo, index: number) {
            this.$confirm(this.$t("确认删除当前成员吗?"), this.$t("提示"), {
                confirmButtonText: this.$t("确定"),
                cancelButtonText: this.$t("取消"),
                type: "warning",
            }).then(() => {
                const params = {
                    userId: row.userId,
                    projectId: this.id,
                };
                this.axios.delete("/api/project/delete_user", { data: params }).then(() => {
                    this.selectedUserData.splice(index, 1);
                }).catch((err) => {
                    console.error(err);
                });
            }).catch((err: Error | string) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                console.error(err);
            });
        },
        //离开团队
        handleLeaveGroup(row: PermissionUserInfo, index: number) {
            const { userInfo } = this.$store.state.permission;
            const hasAdmin = this.selectedUserData.find((info) => {
                if (info.userId !== userInfo.id && info.permission === "admin") {
                    return true
                }
                return false;
            });
            if (!hasAdmin) {
                this.$message.error(this.$t("团队至少保留一个管理员"));
                return;
            }
            this.$confirm(this.$t("确认离开当前团队吗?"), this.$t("提示"), {
                confirmButtonText: this.$t("确定"),
                cancelButtonText: this.$t("取消"),
                type: "warning",
            }).then(() => {
                const params = {
                    userId: row.userId,
                    projectId: this.id,
                };
                this.axios.delete("/api/project/delete_user", { data: params }).then(() => {
                    this.selectedUserData.splice(index, 1);
                    this.$emit("leave");
                }).catch((err) => {
                    console.error(err);
                });
            }).catch((err: Error | string) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                console.error(err);
            });
        },
        //改变成员权限
        handleChangePermission(row: PermissionUserInfo) {
            const oldPermission = row._permission
            const hasAdmin = this.selectedUserData.find((info) => {
                if (info.permission === "admin") {
                    return true
                }
                return false;
            });
            if (!hasAdmin) {
                this.$message.error(this.$t("团队至少保留一个管理员"));
                row.permission = oldPermission;
                return;
            }
            if (oldPermission === "admin") {
                this.$confirm(this.$t("确认改变当前管理员权限吗?"), this.$t("提示"), {
                    confirmButtonText: this.$t("确定"),
                    cancelButtonText: this.$t("取消"),
                    type: "warning",
                }).then(() => {
                    const params = {
                        userId: row.userId,
                        projectId: this.id,
                        permission: row.permission,
                    };
                    this.axios.put("/api/project/change_permission", params).then(() => {
                        row._permission = row.permission;
                    }).catch((err) => {
                        row.permission = oldPermission;
                        console.error(err);
                    });
                }).catch((err: Error | string) => {
                    if (err === "cancel" || err === "close") {
                        row.permission = oldPermission;
                        return;
                    }
                    console.error(err);
                });
            } else {
                const params = {
                    userId: row.userId,
                    projectId: this.id,
                    permission: row.permission,
                };
                this.axios.put("/api/project/change_permission", params).then(() => {
                    row._permission = row.permission;
                }).catch((err) => {
                    row.permission = oldPermission;
                    console.error(err);
                });
            }
        },
    },
})
</script>

<style lang="scss">

</style>
