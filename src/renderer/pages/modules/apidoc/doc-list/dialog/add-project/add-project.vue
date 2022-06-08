/*
    创建者：shuxiaokai
    创建时间：2021-07-13 22:20
    模块名称：新增项目
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" :title="$t('新增项目')" @close="handleClose">
        <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px">
            <el-form-item :label="`${$t('项目名称')}：`" prop="projectName">
                <el-input v-model="formInfo.projectName" v-focus-select :size="config.renderConfig.layout.size" :placeholder="$t('请输入项目名称')" @keydown.enter="handleAddProject"></el-input>
            </el-form-item>
            <el-form-item :label="`${$t('选择成员')}：`">
                <s-remote-select v-model="remoteQueryName" :remote-methods="getRemoteUserByName" :loading="loading" :placeholder="$t('输入用户名或真实姓名查找用户')">
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
        <el-table :data="selectUserData" stripe border max-height="200px">
            <el-table-column prop="loginName" :label="$t('用户名')" align="center"></el-table-column>
            <el-table-column prop="realName" :label="$t('真实姓名')" align="center"></el-table-column>
            <el-table-column :label="$t('角色(权限)')" align="center">
                <template #default="scope">
                    <el-select v-model="scope.row.permission" :size="config.renderConfig.layout.size">
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
                    <el-button link type="primary" text @click="handleDeleteMember(scope.$index)">{{ $t("删除") }}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="handleAddProject">{{ $t("确定") }}</el-button>
            <el-button type="warning" @click="handleClose">{{ $t("取消") }}</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import type { PermissionUserBaseInfo, ApidocProjectMemberInfo } from "@@/global"

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
                projectName: [{ required: true, trigger: "blur", message: this.$t("请填写项目名称") }],
            },
            remoteMembers: [] as PermissionUserBaseInfo[], //------远程用户列表
            selectUserData: [] as ApidocProjectMemberInfo[], //-----已选中的用户
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
                        this.$emit("success", res.data);
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
        handleSelectUser(item: PermissionUserBaseInfo) {
            this.remoteMembers = [];
            this.remoteQueryName = "";
            const hasUser = this.selectUserData.find((val) => val.userId === item.userId);
            if (hasUser) {
                this.$message.warning(this.$t("请勿重复添加"));
                return;
            }
            const userInfo: ApidocProjectMemberInfo = {
                ...item,
                permission: "readAndWrite",
            }
            this.selectUserData.push(userInfo);
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
