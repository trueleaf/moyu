/*
    创建者：shuxiaokai
    创建时间：2021-07-13 21:24
    模块名称：项目列表
    备注：
*/
<template>
    <div class="tab-a">
        <!-- 搜索条件 -->
        <div class="search-item d-flex a-center mb-3">
            <el-input v-model="projectName" placeholder="搜索项目名称" prefix-icon="el-icon-search" size="small" class="w-200px mr-3" clearable></el-input>
            <el-button size="small" type="success" icon="el-icon-plus" @click="dialogVisible = true">新建项目</el-button>
            <el-button size="small" type="success" icon="el-icon-download" @click="dialogVisible3 = true">导入项目</el-button>
        </div>
        <!-- 项目列表 -->
        <s-loading :loading="loading">
            <!-- 收藏的项目 -->
            <h2 v-show="starProjects.length > 0">收藏的项目</h2>
            <div v-show="starProjects.length > 0" class="project-wrap">
                <div v-for="(item, index) in starProjects" :key="index" class="project-list">
                    <div class="project-header">
                        <div :title="item.projectName" class="title theme-color text-ellipsis">{{ item.projectName }}</div>
                        <div class="operator">
                            <div title="编辑" @click="handleOpenEditDialog(item)">
                                <i class="el-icon-edit"></i>
                            </div>
                            <div title="成员管理" @click="handleOpenPermissionDialog(item)">
                                <i class="el-icon-user"></i>
                            </div>
                            <div v-if="!item.isStared" title="收藏" @click="handleStar(item)">
                                <i v-if="!starLoading" class="el-icon-star-off"></i>
                                <i v-if="starLoading" class="el-icon-loading"></i>
                            </div>
                            <div v-if="item.isStared" title="取消收藏" @click="handleUnStar(item)">
                                <i v-if="!unStarLoading" class="el-icon-star-on f-base yellow"></i>
                                <i v-if="unStarLoading" class="el-icon-loading"></i>
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
                            <el-button type="primary" size="mini" @click="jumpToProject(item._id, item.projectName)">编辑</el-button>
                            <el-button type="primary" size="mini" @click="handleView(item)">预览</el-button>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 项目列表 -->
            <div class="project-wrap">
                <div v-for="(item, index) in projectList" :key="index" class="project-list">
                    <div class="project-header">
                        <div :title="item.projectName" class="title theme-color text-ellipsis">{{ item.projectName }}</div>
                        <div class="operator">
                            <div title="编辑" @click="handleOpenEditDialog(item)">
                                <i class="el-icon-edit"></i>
                            </div>
                            <div title="成员管理" @click="handleOpenPermissionDialog(item)">
                                <i class="el-icon-user"></i>
                            </div>
                            <div v-if="!item.isStared" title="收藏" @click="handleStar(item)">
                                <i v-if="!starLoading" class="el-icon-star-off"></i>
                                <i v-if="starLoading" class="el-icon-loading"></i>
                            </div>
                            <div v-if="item.isStared" title="取消收藏" @click="handleUnStar(item)">
                                <i v-if="!unStarLoading" class="el-icon-star-on f-base yellow"></i>
                                <i v-if="unStarLoading" class="el-icon-loading"></i>
                            </div>
                            <div title="删除" @click="deleteProject(item._id)">
                                <i class="el-icon-delete"></i>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex j-end a-center gray-600 mt-2">
                        <span>创建者:</span>
                        <span>{{ item.owner.name }}</span>&nbsp;&nbsp;
                    </div>
                    <div class="d-flex j-end a-center gray-600">
                        <span>最新更新:</span>
                        <span>{{ $helper.formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
                    </div>
                    <div class="project-bottom d-flex">
                        <div>
                            <span class="f-sm">接口数:</span>
                            <span class="teal">{{ item.docNum }}</span>
                        </div>
                        <div class="ml-auto">
                            <el-button type="primary" size="mini" @click="handleJumpToProject(item)">编辑</el-button>
                            <el-button type="primary" size="mini" @click="handleJumpToView(item)">预览</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </s-loading>
    </div>
    <s-add-project-dialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></s-add-project-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { Response, ResApiProjectList, ApiProjectInfo } from "@@/global";
import addProject from "../dialog/add-project/add-project.vue"

export default defineComponent({
    components: {
        "s-add-project-dialog": addProject
    },
    data() {
        return {
            projectName: "", //--------------------------------------------项目名称
            recentVisitProjectIds: [] as string[], //----------------------最近访问项目id集合
            starProjectIds: [] as string[], //-----------------------------收藏项目id集合
            projectListCopy: [] as ApiProjectInfo[], //-----------项目列表拷贝用户数据过滤
            loading: false, //---------------------------------------------项目数据加载
            starLoading: false, //-----------------------------------------是否正在收藏
            unStarLoading: false, //---------------------------------------是否取消收藏
            dialogVisible: false, //---------------------------------------新增项目弹窗
            dialogVisible2: false, //--------------------------------------修改项目弹窗
            dialogVisible3: false, //--------------------------------------导入项目弹窗
        };
    },
    computed: {
        /**
         * 项目列表
         */
        projectList(): ApiProjectInfo[] {
            const filteredProjectList = this.projectListCopy.filter((val) => val.projectName.match(new RegExp(this.projectName, "gi")))
            return filteredProjectList.map((val) => {
                const isStared = this.starProjectIds.find((id) => id === val._id);
                return {
                    ...val,
                    isStared: !!isStared,
                };
            });
        },
        /**
         * 当前收藏的项目
         */
        starProjects(): ApiProjectInfo[] {
            const filteredProjectList = this.projectListCopy.filter((val) => val.projectName.match(new RegExp(this.projectName, "gi")))
            return filteredProjectList.filter((projectInfo) => this.starProjectIds.find((id) => id === projectInfo._id)).map((val) => {
                const isStared = this.starProjectIds.find((id) => id === val._id);
                return {
                    ...val,
                    isStared: !!isStared,
                };
            });
        },
    },
    created() {
        this.getProjectList();
    },
    methods: {
        //=====================================项目增删改查====================================//
        //获取项目列表
        getProjectList() {
            this.loading = true;
            this.axios.get<Response<ResApiProjectList>, Response<ResApiProjectList>>("/api/project/project_list").then((res) => {
                this.recentVisitProjectIds = res.data.recentVisitProjects;
                this.starProjectIds = res.data.starProjects;
                this.projectListCopy = res.data.list;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //编辑项目弹窗
        handleOpenEditDialog(item: ApiProjectInfo) {
            console.log(item)
        },
        //编辑权限弹窗
        handleOpenPermissionDialog(item: ApiProjectInfo) {
            console.log(item)
        },
        //收藏项目
        handleStar(item: ApiProjectInfo) {
            if (this.starLoading) {
                return;
            }
            this.starLoading = true;
            this.axios.put("/api/project/star", { projectId: item._id }).then(() => {
                item.isStared = true;
                this.starProjectIds.push(item._id);
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.starLoading = false;
            });
        },
        //取消收藏项目
        handleUnStar(item: ApiProjectInfo) {
            if (this.unStarLoading) {
                return;
            }
            this.unStarLoading = true;
            this.axios.put("/api/project/unstar", { projectId: item._id }).then(() => {
                item.isStared = true;
                const delIndex = this.starProjectIds.findIndex((val) => val === item._id);
                this.starProjectIds.splice(delIndex, 1);
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.unStarLoading = false;
            });
        },
        //删除项目
        deleteProject(_id: string) {
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = {
                    ids: [_id],
                };
                this.axios.delete("/api/project/delete_project", { data: params }).then(() => {
                    this.getProjectList();
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
        //跳转到编辑
        handleJumpToProject(item: ApiProjectInfo) {
            console.log(item)
        },
        //跳转到预览
        handleJumpToView(item: ApiProjectInfo) {
            console.log(item)
        },
        //新增项目成功
        handleAddSuccess() {
            console.log(33)
        },
    },
})
</script>

<style lang="scss">
.tab-a {
    .project-wrap {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: size(20);
        @media only screen and (max-width: 1199px) {
            justify-content: center;
        }
    }
    .project-list {
        width: 300px;
        border: 1px solid $gray-200;
        box-shadow: $box-shadow-sm;
        margin-right: size(30);
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
                font-size: fz(16);
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
