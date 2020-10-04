/*
    创建者：shuxiaokai
    创建时间：2020-06-24 14:39
    模块名称：修改项目弹窗
    备注：xxxx
*/
<template>
    <s-dialog title="修改项目" :isShow="visible" @close="handleClose">
        <el-form v-loading="loading3" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" ref="form" :model="formInfo" :rules="rules" label-width="150px">
            <!-- 基础数据 -->
            <el-form-item label="项目名称：" prop="projectName">
                <el-input v-model="formInfo.projectName" size="mini" placeholder="请输入项目名称"></el-input>
            </el-form-item>
            <el-form-item label="备注：">
                <el-input v-model="formInfo.remark" size="mini" placeholder="请输入备注"></el-input>
            </el-form-item>
            <el-form-item label="成员：">
                <s-remote-select v-model="remoteQueryName" :remote-methods="getRemoteUserByName" :loading="loading" placeholder="输入用户名或真实姓名查找用户">
                    <s-remote-select-item v-for="(item, index) in remoteMembers" :key="index">
                        <div class="d-flex a-center j-between w-100 h-100" @click="handleSelectUser(item)">
                            <span>{{ item.loginName }}</span>
                            <span>{{ item.realName }}</span>
                        </div>
                    </s-remote-select-item>
                </s-remote-select>
            </el-form-item>
            <!-- 成员信息 -->
            <el-table :data="selectUserData" stripe border size="mini" max-height="200px">
                <el-table-column prop="loginName" label="用户名" align="center"></el-table-column>
                <el-table-column prop="realName" label="真实姓名" align="center"></el-table-column>
                <el-table-column label="角色(权限)" align="center">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.permission" size="mini">
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
                        <el-button type="text" size="mini" @click="handleDeleteMember(scope.$index)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
        <div slot="footer">
            <el-button :loading="loading2" size="mini" type="primary" @click="handleEditProject">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: { //弹窗显示与否
            type: Boolean,
            default: false,
        },
        id: { //项目id
            type: String,
            default: ""
        },
    },
    data() {
        return {
            //=====================================修改项目====================================//
            formInfo: {
                projectName: "",//----项目名称
                remark: "",//---------项目备注
            }, 
            rules: {
                projectName: [{ required: true, trigger: "blur", message: "请填写项目名称" }]
            }, //----------------------修改项目校验规则
            remoteMembers: [], //------远程用户列表
            selectUserData: [], //-----已选中的用户
            remoteQueryName: "", //----用户名称
            //=====================================其他参数====================================//
            loading: false, //---------成员数据加载状态
            loading2: false, //--------修改项目加载状态
            loading3: false, //--------获取项目详情
        };
    },
    created() {
        this.getProjectInfo();
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取项目基本信息
        getProjectInfo() {
            this.loading3 = true;
            this.axios.get("/api/project/project_info", { params: { _id: this.id } }).then(res => {
                Object.assign(this.formInfo, res.data);
                this.selectUserData = res.data.members || [];
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading3 = false;
            });
        },
        //根据名称查询用户列表
        getRemoteUserByName(query) {
            this.loading = true;
            const params = {
                name: query
            };
            this.axios.get("/api/security/userListByName", { params }).then(res => {
                this.remoteMembers = res.data;
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });  
        },
        //=====================================前后端交互====================================//
        //修改项目
        handleEditProject() {
            this.loading2 = true;
            const params = {
                _id: this.id,
                ...this.formInfo,
                members: this.selectUserData.map(val => {
                    return {
                        userId: val.userId,
                        permission: val.permission,
                        loginName: val.loginName,
                        realName: val.realName
                    };
                })
            };
            this.axios.put("/api/project/edit_project", params).then(() => {
                this.handleClose();
                this.$emit("success");
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading2 = false;
            });
        },
        //=====================================组件间交互====================================//  
        //选取用户
        handleSelectUser(item) {
            this.remoteMembers = [];
            this.remoteQueryName = "";
            const hasUser = this.selectUserData.find(val => val.userId === item.userId);
            if (hasUser) {
                this.$message.warning("请勿重复添加");
                return;
            }
            this.$set(item, "permission", "readAndWrite")
            this.selectUserData.push(item);
        },
        //删除成员
        handleDeleteMember(index) {
            this.$confirm("确认删除当前成员吗?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                this.selectUserData.splice(index, 1)
            }).catch(err => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
            
        },
        //=====================================其他操作=====================================//
        //关闭弹窗
        handleClose() {
            this.$emit("update:visible", false);
        },
    }
};
</script>



<style lang="scss">

</style>
