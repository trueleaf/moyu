/*
    创建者：shuxiaokai
    创建时间：2021-07-13 17:20
    模块名称：
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" title="新增项目" @close="handleClose">
        <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px">
            <el-form-item label="项目名称：" prop="projectName">
                <el-input v-model="formInfo.projectName" size="mini" placeholder="请输入项目名称"></el-input>
            </el-form-item>
            <el-form-item label="选择成员：">
                <s-remote-select v-model="remoteQueryName" :remote-methods="getRemoteUserByName" :loading="loading" placeholder="输入用户名或真实姓名查找用户">
                    <s-remote-select-item v-for="(item, index) in remoteMembers" :key="index">
                        <div class="d-flex a-center j-between w-100 h-100" @click="handleSelectUser(item)">
                            <span>{{ item.loginName }}</span>
                            <span>{{ item.realName }}</span>
                        </div>
                    </s-remote-select-item>
                </s-remote-select>
            </el-form-item>
        </el-form>
        <!-- 成员信息 -->
        <el-table :data="selectUserData" stripe border size="mini" max-height="200px">
            <el-table-column prop="loginName" label="用户名" align="center"></el-table-column>
            <el-table-column prop="realName" label="真实姓名" align="center"></el-table-column>
            <el-table-column label="角色(权限)" align="center">
                <template #default="scope">
                    <el-select v-model="scope.row.permission" size="mini">
                        <el-option label="只读" value="readOnly">
                            <span>只读</span>
                            <span class="gray-500">(仅查看项目)</span>
                        </el-option>
                        <el-option label="读写" value="readAndWrite">
                            <span>读写</span>
                            <span class="gray-500">(新增和编辑文档)</span>
                        </el-option>
                        <el-option label="管理员" value="admin">
                            <span>管理员</span>
                            <span class="gray-500">(添加新成员)</span>
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="200px">
                <template #default="scope">
                    <el-button type="text" size="mini" @click="handleDeleteMember(scope.$index)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-button :loading="loading" size="mini" type="primary" @click="handleAddProject">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import type { ResUserBaseInfo } from "@@/global"

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
            //=====================================新建项目====================================//
            formInfo: {
                projectName: "", //-------------------------项目名称
                remark: "", //------------------------------项目备注
            },
            rules: { //-------------------------------------新增项目校验规则
                projectName: [{ required: true, trigger: "blur", message: "请填写项目名称" }],
            },
            remoteMembers: [] as ResUserBaseInfo[], //------远程用户列表
            selectUserData: [] as ResUserBaseInfo[], //-----已选中的用户
            remoteQueryName: "", //-------------------------用户名称
            //=====================================其他参数====================================//
            loading: false, //------------------------------成员数据加载状态
            loading2: false, //-----------------------------新增项目
        };
    },
    methods: {
        //根据名称查询用户列表
        getRemoteUserByName(query: string) {
            this.loading = true;
            const params = {
                name: query,
            };
            this.axios.get("/api/security/userListByName", { params }).then((res) => {
                this.remoteMembers = res.data;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //新增项目
        handleAddProject() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading2 = true;
                    const params = {
                        ...this.formInfo,
                        members: this.selectUserData.map((val) => ({
                            userId: val.userId,
                            permission: val.permission,
                            loginName: val.loginName,
                            realName: val.realName,
                        })),
                    };
                    this.axios.post("/api/project/add_project", params).then((res) => {
                        this.handleClose();
                        this.$emit("success", {
                            id: res.data,
                            name: this.formInfo.projectName,
                        });
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading2 = false;
                    });
                } else {
                    this.$nextTick(() => {
                        const input: HTMLInputElement = document.querySelector(".el-form-item.is-error input") as HTMLInputElement;
                        if (input) {
                            input.focus();
                        }
                    });
                    this.$message.warning("请完善必填信息");
                    this.loading = false;
                }
            });
        },
        //选取用户
        handleSelectUser(item: ResUserBaseInfo) {
            this.remoteMembers = [];
            this.remoteQueryName = "";
            const hasUser = this.selectUserData.find((val) => val.userId === item.userId);
            if (hasUser) {
                this.$message.warning("请勿重复添加");
                return;
            }
            item.permission = "readAndWrite";
            this.selectUserData.push(item);
        },
        //删除成员
        handleDeleteMember(index: number) {
            this.selectUserData.splice(index, 1);
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
