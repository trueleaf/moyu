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
                    <div :title="item.projectName" class="title theme-color text-ellipsis">苏州项目</div>
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
                <!-- 客户端信息 -->
                <s-collapse title="客户端相关">
                    <div class="my-2">
                        <!-- 代码仓库 -->
                        <div class="item-list">
                            <div class="prefix">
                                <svg class="svg-icon mr-1" aria-hidden="true">
                                    <use xlink:href="#icongithub"></use>
                                </svg> 
                                <span class="mr-1">代码仓库：</span>
                            </div>
                            <div class="content">
                                <el-popover placement="top-start" width="400" trigger="click">
                                    <span slot="reference" class="theme-color cursor-pointer">[仓库地址]</span>
                                    <div>
                                        <div>
                                            <el-divider content-position="left">地址</el-divider>
                                            <span>http://192.168.0.109:8081/visual/suzhou/#/main/n</span>
                                        </div>
                                        <div>
                                            <el-divider content-position="left">备注</el-divider>
                                            <p>账号:admin   密码: 111111</p>
                                        </div>
                                        <div class="d-flex j-end">
                                            <el-button type="primary" size="mini">修改</el-button>
                                            <el-button type="success" size="mini">访问</el-button>
                                        </div>
                                    </div>
                                </el-popover>
                            </div>
                            <div class="tail">
                                <div class="d-flex a-center">
                                    <span class="gray-600 mr-1">张三</span>
                                    <svg class="svg-icon" aria-hidden="true">
                                        <use xlink:href="#iconlishi"></use>
                                    </svg>     
                                </div>                                
                            </div>
                        </div> 
                        <!-- 可访问地址 -->
                        <div class="item-list">
                            <div class="prefix">
                                <svg class="svg-icon mr-1" aria-hidden="true">
                                    <use xlink:href="#iconkehuduan"></use>
                                </svg> 
                                <span class="mr-1">访问链接：</span>
                            </div>
                            <div class="content">
                                <el-popover placement="top-start" width="400" trigger="click">
                                    <span slot="reference" class="theme-color cursor-pointer mr-2">[正式地址]</span>
                                    <div>
                                        <div>
                                            <el-divider content-position="left">地址</el-divider>
                                            <span>http://192.168.0.109:8081/visual/suzhou/#/main/n</span>
                                        </div>
                                        <div>
                                            <el-divider content-position="left">备注</el-divider>
                                            <p>账号:admin   密码: 111111</p>
                                        </div>
                                        <div class="d-flex j-end">
                                            <el-button type="success" size="mini">访问</el-button>
                                        </div>
                                    </div>
                                </el-popover>
                                <el-popover placement="top-start" width="400" trigger="click">
                                    <span slot="reference" class="theme-color cursor-pointer">[测试地址]</span>
                                    <div>
                                        <div>
                                            <el-divider content-position="left">地址</el-divider>
                                            <span>http://192.168.0.109:8081/visual/suzhou/#/main/n</span>
                                        </div>
                                        <div>
                                            <el-divider content-position="left">备注</el-divider>
                                            <p>账号:admin   密码: 111111</p>
                                        </div>
                                        <div class="d-flex j-end">
                                            <el-button type="success" size="mini">访问</el-button>
                                        </div>
                                    </div>
                                </el-popover>
                            </div>
                            <div class="tail">
                                <div class="d-flex a-center">
                                    <span class="gray-600 mr-1">张三</span>
                                    <svg class="svg-icon" aria-hidden="true">
                                        <use xlink:href="#iconlishi"></use>
                                    </svg>     
                                </div>                                
                            </div>
                        </div> 

                    </div>
                </s-collapse>
                <!-- 服务端信息 -->
                <s-collapse title="服务端相关">
                    <div class="my-2">
                        <div class="item-list">
                            <div class="prefix">
                                <svg class="svg-icon mr-1" aria-hidden="true">
                                    <use xlink:href="#icongithub"></use>
                                </svg> 
                                <span class="mr-1">代码仓库：</span>
                            </div>
                            <div class="content">
                                <el-popover placement="top-start" width="400" trigger="click">
                                    <span slot="reference" class="theme-color cursor-pointer">[仓库地址]</span>
                                    <div>
                                        <div>
                                            <el-divider content-position="left">地址</el-divider>
                                            <span>http://192.168.0.109:8081/visual/suzhou/#/main/n</span>
                                        </div>
                                        <div>
                                            <el-divider content-position="left">备注</el-divider>
                                            <p>账号:admin   密码: 111111</p>
                                        </div>
                                        <div class="d-flex j-end">
                                            <el-button type="primary" size="mini">修改</el-button>
                                            <el-button type="success" size="mini">访问</el-button>
                                        </div>
                                    </div>
                                </el-popover>
                            </div>
                            <div class="tail">
                                <div class="d-flex a-center">
                                    <span class="gray-600 mr-1">张三</span>
                                    <svg class="svg-icon" aria-hidden="true">
                                        <use xlink:href="#iconlishi"></use>
                                    </svg>     
                                </div>                                
                            </div>
                        </div> 
                    </div>
                </s-collapse>
                <!-- 服务端信息 -->
                <s-collapse title="产品相关">
                    <div class="my-2">
                        <div class="item-list">
                            <div class="prefix">
                                <svg class="svg-icon mr-1" aria-hidden="true">
                                    <use xlink:href="#icongithub"></use>
                                </svg> 
                                <span class="mr-1">代码仓库：</span>
                            </div>
                            <div class="content">
                                <el-popover placement="top-start" width="400" trigger="click">
                                    <span slot="reference" class="theme-color cursor-pointer">[仓库地址]</span>
                                    <div>
                                        <div>
                                            <el-divider content-position="left">地址</el-divider>
                                            <span>http://192.168.0.109:8081/visual/suzhou/#/main/n</span>
                                        </div>
                                        <div>
                                            <el-divider content-position="left">备注</el-divider>
                                            <p>账号:admin   密码: 111111</p>
                                        </div>
                                        <div class="d-flex j-end">
                                            <el-button type="primary" size="mini">修改</el-button>
                                            <el-button type="success" size="mini">访问</el-button>
                                        </div>
                                    </div>
                                </el-popover>
                            </div>
                            <div class="tail">
                                <div class="d-flex a-center">
                                    <span class="gray-600 mr-1">张三</span>
                                    <svg class="svg-icon" aria-hidden="true">
                                        <use xlink:href="#iconlishi"></use>
                                    </svg>     
                                </div>                                
                            </div>
                        </div> 
                    </div>
                </s-collapse>
                <!-- 操作信息 -->
                <div class="d-flex a-center j-around mt-3">
                    <div class="d-flex a-center">
                        <span class=""></span> 
                        <span class="hover-theme-color cursor-pointer mr-1">接口文档</span>
                    </div>
                    <el-divider direction="vertical"></el-divider>
                    <div class="d-flex a-center">
                        <span class=""></span> 
                        <span class="hover-theme-color cursor-pointer mr-1">测试管理</span>
                    </div>
                    <el-divider direction="vertical"></el-divider>
                    <div class="d-flex a-center">
                        <span class=""></span>
                        <span class="hover-theme-color cursor-pointer mr-1">持续集成</span>
                    </div>
                    <el-divider direction="vertical"></el-divider>
                    <div class="d-flex a-center">
                        <span class=""></span> 
                        <span class="hover-theme-color cursor-pointer mr-1">UI文档</span>
                    </div>
                    <el-divider direction="vertical"></el-divider>
                    <div class="d-flex a-center">
                        <span class=""></span> 
                        <span class="hover-theme-color cursor-pointer mr-1">产品文档</span>
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
            projectList: [{}], //------项目列表
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
           
        },
        //=====================================前后端交互====================================//
        //删除项目
        deleteProject() {
            
        },
        //=====================================组件间交互====================================//  
        //过滤项目
        filterProject() {
            
        },
        //打开修改弹窗
        handleOpenEditDialog() {
           
        },
        //跳转至界面详情
        jumpToProject() {
           
        },
        //查看页面
        handleView() {
           
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
        width: size(500);
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
                font-size: fz(16);
                max-width: 150px;
            }
            .operator {
                margin-left: auto;
                display: flex;
                font-size: fz(14);
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
        
        .item-list {
            display: flex;
            align-items: center;
            &:not(:last-of-type) {
                margin-bottom: size(15);
            }
            .prefix {
                display: flex;
                align-items: center;
              
            }
            .content {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .tail {
                margin-left: auto;
                // width: size(180);
                flex-grow: 0;
                flex-shrink: 1;
            }
        }
        .svg-icon {
            width: size(17);
            height: size(17);
        }  
    }
}
</style>
