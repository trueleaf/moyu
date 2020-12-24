/*
    创建者：shuxiaokai
    创建时间：2020-06-24 14:39
    模块名称：新增项目弹窗
    备注：xxxx
*/
<template>
    <s-dialog title="新建项目" :isShow="visible" @close="handleClose">
        <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px">
            <!-- 基础数据 -->
            <el-form-item label="项目名称：" prop="projectName">
                <el-input v-model="formInfo.projectName" size="mini" placeholder="请输入项目名称"></el-input>
            </el-form-item>
            <!-- <el-form-item label="备注：">
                <el-input v-model="formInfo.remark" size="mini" placeholder="请输入备注"></el-input>
            </el-form-item> -->
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
                                    <span class="gray-500">(新增和编辑文档)</span>
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
            <el-button :loading="loading2" size="mini" type="primary" @click="handleAddProject">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: {
            type: Boolean,
            default: false,
        }
    },
    data() {
        return {
            //=====================================新建项目====================================//
            formInfo: {
                projectName: "",//----项目名称
                remark: "",//---------项目备注
            }, 
            rules: {
                projectName: [{ required: true, trigger: "blur", message: "请填写项目名称" }]
            }, //----------------------新增项目校验规则
            remoteMembers: [], //------远程用户列表
            selectUserData: [], //-----已选中的用户
            remoteQueryName: "", //----用户名称
            //=====================================其他参数====================================//
            loading: false, //---------成员数据加载状态
            loading2: false, //--------新增项目
        };
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//
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
        //新增项目
        handleAddProject() {
            this.$refs["form"].validate((valid, invalidData) => {
                if (valid) {
                    this.loading2 = true;
                    const params = {
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
                    this.axios.post("/api/project/add_project", params).then(() => {
                        this.handleClose();
                        this.$emit("success");
                    }).catch(err => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading2 = false;
                    });                    
                } else {
                    this.$nextTick(() => {
                        document.querySelector(".el-form-item.is-error input") ? document.querySelector(".el-form-item.is-error input").focus() : null;
                    });
                    for (const invalid in invalidData) {
                        console.log(invalidData[invalid]);
                    }
                    this.$message.warning("请完善必填信息");
                    this.loading = false;
                }
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
            this.selectUserData.splice(index, 1)
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
