/*
    创建者：shuxiaokai
    创建时间：2020-06-19 13:37
    模块名称：项目列表
    备注：xxxx
*/
<template>
    <div class="tab-a">
        <!-- 搜索条件 -->
        <div class="search-item d-flex a-center">
            <el-input v-model="projectName" placeholder="搜索项目名称" prefix-icon="el-icon-search" size="small" class="w-200px mr-3" @input="filterProject" clearable></el-input>
            <el-button size="small" type="success" icon="el-icon-plus" @click="dialogVisible = true">新建项目</el-button>
        </div> 
        <!-- 项目列表 -->
        <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="project-wrap mt-3">
            <div v-for="(item, index) in projectList" :key="index" class="project-list">
                <div class="project-header">
                    <div :title="item.projectName" class="title theme-color text-ellipsis">{{ item.projectName }}</div>
                    <div class="operator">
                        <div title="编辑" @click="handleOpenEditDialog(item)">
                            <i class="el-icon-edit"></i>
                        </div>
                        <div title="成员管理" @click="handleOpenEditDialog(item)">
                            <i class="el-icon-user"></i>
                        </div>
                        <div title="查看" @click="handleView(item)">
                            <i class="el-icon-view"></i>
                        </div>
                        <div title="删除" @click="deleteProject(item._id)">
                            <i class="el-icon-delete"></i>
                        </div>
                    </div>
                </div>
                <div class="d-flex j-end a-center gray-500 mt-2">
                    <span>最新更新:</span>
                    <span>{{ new Date(item.updatedAt).toLocaleDateString() }}</span>&nbsp;&nbsp;
                </div>
                <div class="d-flex j-end a-center gray-500">
                    <span>创建者:</span>
                    <span>{{ item.owner.name }}</span>&nbsp;&nbsp;
                </div>
                <div class="project-bottom d-flex">
                    <div>
                        <span class="f-sm">接口数:</span>
                        <span class="teal">{{ item.docNum }}</span>
                    </div>
                    <div class="ml-auto">
                        <el-button v-if="item.owner.name !== userInfo.realName && (item.members && item.members.find(m => m.realName === userInfo.realName && m.permission === 'readOnly'))" type="primary" size="mini" @click="handleView(item)">查看</el-button>
                        <el-button v-else type="primary" size="mini" @click="jumpToProject(item._id, item.projectName)">进入</el-button>
                    </div>
                </div>
            </div>
        </div>
        <!-- 新增项目弹窗 -->
        <s-add-project-dialog v-if="dialogVisible" :visible.sync="dialogVisible" @success="getProjectList"></s-add-project-dialog>
        <s-edit-project-dialog v-if="dialogVisible2" :id="projectId" :visible.sync="dialogVisible2" @success="getProjectList"></s-edit-project-dialog>
    </div>
</template>

<script>
import addProjectDialog from "../dialog/add-project"
import editProjectDialog from "../dialog/edit-project"
export default {
    components: {
        "s-add-project-dialog": addProjectDialog,
        "s-edit-project-dialog": editProjectDialog,
    },
    data() {
        return {
            //=========================================================================//
            projectList: [], //------项目列表
            projectListCopy: [], //--项目列表拷贝用户数据过滤
            projectName: "", //------搜索框项目名称
            projectId: "", //--------修改项目时候获取项目详情id
            //=====================================其他====================================//
            dialogVisible: false, //-新增项目弹窗
            dialogVisible2: false, //修改项目弹窗
            loading: false, //-------数据加载状态
        };
    },
    computed: {
        userInfo() {
            return this.$store.state.permission.userInfo
        },
    },
    created() {
        this.getProjectList(); //获取项目列表
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取项目列表
        getProjectList() {
            const params = this.formInfo;
            this.loading = true;
            this.axios.get("/api/project/project_list", { params }).then(res => {
                this.projectList = res.data.rows;
                this.projectListCopy = res.data.rows;
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================前后端交互====================================//
        //删除项目
        deleteProject(id) {
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                const params = {
                    ids: [id]
                };
                this.axios.delete("/api/project/delete_project", { data: params }).then(() => {
                    this.getProjectList();
                }).catch(err => {
                    this.$errorThrow(err, this);
                })
            }).catch(err => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        //=====================================组件间交互====================================//  
        //过滤项目
        filterProject() {
            this.projectList = this.projectListCopy.filter(val => {
                return val.projectName.match(new RegExp(this.projectName, "gi"));
            });
        },
        //打开修改弹窗
        handleOpenEditDialog(item) {
            this.dialogVisible2 = true;
            this.projectId = item._id;
        },
        //跳转至界面详情
        jumpToProject(id, name) {
            this.$router.push({
                path: "/v1/apidoc/doc-edit",
                query: {
                    id,
                    name
                },
            });
        },
        //查看页面
        handleView(item) {
            this.$router.push({
                path: "/v1/apidoc/doc-view",
                query: {
                    id: item._id,
                    name: item.projectName
                }
            });
            console.log(item);
        },
        //=====================================其他操作=====================================//
    }
};
</script>



<style lang="scss" scoped>
.tab-a {
    .project-wrap {
        display: flex;
        flex-wrap: wrap;
        min-height: 300px;
        align-items: flex-start;
        @media only screen and (max-width: 1199px) {
            justify-content: center;
        }
    }
    .project-list {
        width: 300px;
        // height: 180px;
        border: 1px solid $gray-200;
        box-shadow: $box-shadow-sm;
        margin-right: 30px;
        margin-bottom: 30px;
        padding: 10px;
        position: relative;
        @media only screen and (max-width: 1199px) {
            margin-right: 0;
            width: 100%;
        }
        .project-header {
            height: 40px;
            display: flex;
            align-items: center;
            .title {
                max-width: 150px;
            }
            .operator {
                margin-left: auto;
                display: flex;
                & > div {
                    width: 25px;
                    height: 25px;
                    margin-right: 5px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    &:hover {
                        background: $gray-200;
                    }
                }
            }
        }
        .project-bottom {
            width: 100%;
            padding: 10px 0;
            bottom: 10px;
            display: flex;
            align-items: center;
        }
        .start {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            bottom: 10px;
            right: 10px;
            cursor: pointer;
            &:hover {
                background: $gray-200;
            }
            i {
                font-size: 18px;
            }
        }
    }
}
</style>
