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
            <el-input v-model="projectName" :placeholder="$t('项目名称或者接口URL')" :prefix-icon="iconSearch" class="w-200px mr-3" clearable @input="handleSearchProject"></el-input>
            <el-button type="success" :icon="iconPlus" @click="dialogVisible = true">{{ $t("新建项目") }}</el-button>
            <el-button v-if="0" type="success" :icon="iconDownload" @click="dialogVisible3 = true">{{ $t("导入项目") }}</el-button>
        </div>
        <!-- 项目列表 -->
        <s-loading :loading="loading">
            <!-- 收藏的项目 -->
            <h2 v-show="starProjects.length > 0">{{ $t("收藏的项目") }}</h2>
            <div v-show="starProjects.length > 0" class="project-wrap">
                <div v-for="(item, index) in starProjects" :key="index" class="project-list">
                    <div class="project-header">
                        <div :title="item.projectName" class="title theme-color text-ellipsis">
                            <s-emphasize :value="item.projectName" :keyword="projectName"></s-emphasize>
                        </div>
                        <div class="operator">
                            <div :title="$t('编辑')" @click="handleOpenEditDialog(item)">
                                <el-icon :size="16">
                                    <edit-icon></edit-icon>
                                </el-icon>
                            </div>
                            <div :title="$t('成员管理')" @click="handleOpenPermissionDialog(item)">
                                <el-icon :size="16">
                                    <user-icon></user-icon>
                                </el-icon>
                            </div>
                            <div v-if="!item.isStared" :title="$t('收藏')" @click="handleStar(item)">
                                <el-icon v-if="!starLoading" :size="16">
                                    <star-icon></star-icon>
                                </el-icon>
                                <el-icon v-if="starLoading" :size="16" class="is-loading">
                                    <loading-icon></loading-icon>
                                </el-icon>
                            </div>
                            <div v-if="item.isStared" :title="$t('取消收藏')" @click="handleUnStar(item)">
                                <el-icon v-if="!unStarLoading" :size="19" class="yellow">
                                    <star-filled-icon></star-filled-icon>
                                </el-icon>
                                <el-icon v-if="unStarLoading" :size="16" class="is-loading">
                                    <loading-icon></loading-icon>
                                </el-icon>
                            </div>
                            <div :title="$t('删除')" @click="deleteProject(item._id)">
                                <el-icon :size="16">
                                    <delete-icon></delete-icon>
                                </el-icon>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex j-end a-center gray-500 mt-2">
                        <span>{{ $t("最新更新") }}:</span>
                        <span>{{ $helper.formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
                    </div>
                    <div class="d-flex j-end a-center gray-500">
                        <span>{{ $t("创建者") }}:</span>
                        <span>{{ item.owner.name }}</span>&nbsp;&nbsp;
                    </div>
                    <div class="project-bottom d-flex">
                        <div>
                            <span class="f-sm">{{ $t("接口数") }}:</span>
                            <span class="teal">{{ item.docNum }}</span>
                        </div>
                        <div class="ml-auto">
                            <el-button type="primary" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
                            <el-button type="primary" @click="handleJumpToView(item)">{{ $t("预览") }}</el-button>
                        </div>
                    </div>
                </div>
            </div>
            <h2 class="cursor-pointer" @click="toggleCollapse">
                <el-icon v-if="!isFold" class="mr-1" :size="16">
                    <caret-bottom-icon />
                </el-icon>
                <el-icon v-if="isFold" class="mr-1" :size="16">
                    <caret-right-icon />
                </el-icon>
                <span>{{ $t("全部项目") }}({{ projectList.length }})</span>
            </h2>
            <!-- 项目列表 -->
            <div v-show="!isFold" class="project-wrap">
                <div v-for="(item, index) in projectList" :key="index" class="project-list">
                    <div class="project-header">
                        <div :title="item.projectName" class="title theme-color text-ellipsis">
                            <s-emphasize :value="item.projectName" :keyword="projectName"></s-emphasize>
                        </div>
                        <div class="operator">
                            <div :title="$t('编辑')" @click="handleOpenEditDialog(item)">
                                <el-icon :size="16">
                                    <edit-icon></edit-icon>
                                </el-icon>
                            </div>
                            <div :title="$t('成员管理')" @click="handleOpenPermissionDialog(item)">
                                <el-icon :size="16">
                                    <user-icon></user-icon>
                                </el-icon>
                            </div>
                            <div v-if="!item.isStared" :title="$t('收藏')" @click="handleStar(item)">
                                <el-icon v-if="!starLoading" :size="16">
                                    <star-icon></star-icon>
                                </el-icon>
                                <el-icon v-if="starLoading" :size="16" class="is-loading">
                                    <loading-icon></loading-icon>
                                </el-icon>
                            </div>
                            <div v-if="item.isStared" :title="$t('取消收藏')" @click="handleUnStar(item)">
                                <el-icon v-if="!unStarLoading" :size="19" class="yellow">
                                    <star-filled-icon></star-filled-icon>
                                </el-icon>
                                <el-icon v-if="unStarLoading" :size="16" class="is-loading">
                                    <loading-icon></loading-icon>
                                </el-icon>
                            </div>
                            <div :title="$t('删除')" @click="deleteProject(item._id)">
                                <el-icon :size="16">
                                    <delete-icon></delete-icon>
                                </el-icon>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex j-end a-center gray-600 mt-2">
                        <span>{{ $t("创建者") }}:</span>
                        <span>{{ item.owner.name }}</span>&nbsp;&nbsp;
                    </div>
                    <div class="d-flex j-end a-center gray-600">
                        <span>{{ $t("最新更新") }}:</span>
                        <span>{{ $helper.formatDate(item.updatedAt) }}</span>&nbsp;&nbsp;
                    </div>
                    <div class="project-bottom d-flex">
                        <div>
                            <span class="f-sm">{{ $t("接口数") }}:</span>
                            <span class="teal">{{ item.docNum }}</span>
                        </div>
                        <div class="ml-auto">
                            <el-button type="primary" @click="handleJumpToProject(item)">{{ $t("编辑") }}</el-button>
                            <el-button type="primary" @click="handleJumpToView(item)">{{ $t("预览") }}</el-button>
                        </div>
                    </div>
                </div>
            </div>
        </s-loading>
    </div>
    <s-add-project-dialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></s-add-project-dialog>
    <s-edit-project-dialog v-if="dialogVisible2" v-model="dialogVisible2" :project-id="currentEditProjectId" :project-name="currentEditProjectName" @success="handleEditSuccess"></s-edit-project-dialog>
    <s-edit-permission-dialog v-if="dialogVisible4" v-model="dialogVisible4" :project-id="currentEditProjectId" @leave="getProjectList"></s-edit-permission-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { Edit, User, Loading, Star, StarFilled, Delete, Plus, Download, Search, CaretBottom, CaretRight } from "@element-plus/icons-vue"
import type { Response, ApidocProjectListInfo, ApidocProjectInfo } from "@@/global";
import addProject from "../dialog/add-project/add-project.vue"
import editProject from "../dialog/edit-project/edit-project.vue"
import editPermissionProject from "../dialog/permission/permission.vue"

export default defineComponent({
    components: {
        "s-add-project-dialog": addProject,
        "s-edit-project-dialog": editProject,
        "s-edit-permission-dialog": editPermissionProject,
        "edit-icon": Edit,
        "user-icon": User,
        "caret-bottom-icon": CaretBottom,
        "caret-right-icon": CaretRight,
        "loading-icon": Loading,
        "star-icon": Star,
        "star-filled-icon": StarFilled,
        "delete-icon": Delete,
    },
    setup() {
        return {
            iconPlus: Plus,
            iconDownload: Download,
            iconSearch: Search,
        }
    },
    data() {
        return {
            projectName: "", //--------------------------------------------项目名称
            recentVisitProjectIds: [] as string[], //----------------------最近访问项目id集合
            starProjectIds: [] as string[], //-----------------------------收藏项目id集合
            projectListCopy: [] as ApidocProjectInfo[], //--------------------项目列表拷贝
            currentEditProjectId: "", //-----------------------------------项目id用于编辑
            currentEditProjectName: "", //---------------------------------项目名称用于编辑
            //=====================================其他参数====================================//
            searchFn: null as (null | (() => void)), //---------------------------------------------搜索函数
            isFold: false, //----------------------------------------------是否折叠
            loading: false, //---------------------------------------------项目数据加载
            starLoading: false, //-----------------------------------------是否正在收藏
            unStarLoading: false, //---------------------------------------是否取消收藏
            dialogVisible: false, //---------------------------------------新增项目弹窗
            dialogVisible2: false, //--------------------------------------修改项目弹窗
            dialogVisible3: false, //--------------------------------------导入项目弹窗
            dialogVisible4: false, //--------------------------------------修改项目权限弹窗
        };
    },
    computed: {
        /**
         * 项目列表
         */
        projectList(): ApidocProjectInfo[] {
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
        starProjects(): ApidocProjectInfo[] {
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
        this.initCahce();
    },
    methods: {
        //=====================================项目增删改查====================================//
        /**
         * 获取项目列表
         */
        getProjectList() {
            this.loading = true;
            this.axios.get<Response<ApidocProjectListInfo>, Response<ApidocProjectListInfo>>("/api/project/project_list").then((res) => {
                this.recentVisitProjectIds = res.data.recentVisitProjects;
                this.starProjectIds = res.data.starProjects;
                this.projectListCopy = res.data.list;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        /**
         * 编辑项目弹窗
         */
        handleOpenEditDialog(item: ApidocProjectInfo) {
            this.currentEditProjectId = item._id;
            this.currentEditProjectName = item.projectName;
            this.dialogVisible2 = true;
        },
        /**
         * 编辑权限弹窗
         */
        handleOpenPermissionDialog(item: ApidocProjectInfo) {
            this.currentEditProjectId = item._id;
            this.dialogVisible4 = true;
        },
        /**
         * 收藏项目
         */
        handleStar(item: ApidocProjectInfo) {
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
        /**
         * 取消收藏项目
         */
        handleUnStar(item: ApidocProjectInfo) {
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
        /**
         * 删除项目
         */
        deleteProject(_id: string) {
            this.$confirm(this.$t("此操作将永久删除此条记录, 是否继续?"), this.$t("提示"), {
                confirmButtonText: this.$t("确定"),
                cancelButtonText: this.$t("取消"),
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
        //=====================================其他操作====================================//
        /**
         * 初始化一些缓存
         */
        initCahce() {
            this.isFold = localStorage.getItem("doc-list/isFold") === "close";
        },
        /**
         * 跳转到编辑
         */
        handleJumpToProject(item: ApidocProjectInfo) {
            this.axios.put("/api/project/visited", { projectId: item._id }).catch((err) => {
                console.error(err);
            });
            this.$router.push({
                path: "/v1/apidoc/doc-edit",
                query: {
                    id: item._id,
                    mode: "edit",
                },
            });
        },
        /**
         * 跳转到预览
         */
        handleJumpToView(item: ApidocProjectInfo) {
            this.axios.put("/api/project/visited", { projectId: item._id }).catch((err) => {
                console.error(err);
            });
            this.$router.push({
                path: "/v1/apidoc/doc-edit",
                query: {
                    id: item._id,
                    mode: "view",
                },
            });
        },
        /**
         * 新增项目成功
         */
        handleAddSuccess(id: string) {
            this.$router.push({
                path: "/v1/apidoc/doc-edit",
                query: {
                    id,
                    mode: "edit"
                }
            });
        },
        /**
         * 编辑项目成功
         */
        handleEditSuccess() {
            this.getProjectList()
        },
        /**
         * 折叠打开项目列表
         */
        toggleCollapse() {
            this.isFold = !this.isFold;
            localStorage.setItem("doc-list/isFold", this.isFold ? "close" : "open");
        },
        //搜索项目
        handleSearchProject() {
            if (!this.searchFn) {
                this.searchFn = this.$helper.debounce(() => {
                    //console.log(2222)
                }, 1000)
            } else {
                this.searchFn();
            }
            // console.log(this.projectName)
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
        @media only screen and (max-width: 720px) {
            justify-content: center;
        }
    }
    .project-list {
        width: size(300);
        // height: size(160);
        border: 1px solid $gray-200;
        box-shadow: $box-shadow-sm;
        margin-right: size(30);
        margin-bottom: size(20);
        padding: 10px;
        position: relative;
        @media only screen and (max-width: 720px) {
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
