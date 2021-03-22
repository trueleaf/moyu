/*
    创建者：shuxiaokai
    创建时间：2021-03-22 11:12
    模块名称：
    备注：
*/
<template>
    <s-fieldset title="将当前项目指定文档导出到其他项目" class="fork">
        <div>
            <span>当前选择文档数：</span>
            <span>{{ allCheckedNodes.length }}</span>
            <el-divider direction="vertical"></el-divider>
            <span>当前选择挂载点：</span>
            <span>未选择</span>
        </div>
        <!-- <div class="orange">在左侧勾选需要迁移的接口,然后在右侧选择期望挂载的目录</div> -->
        <el-divider></el-divider>
        <div v-flex1="30" class="fork-wrap">
            <div class="left">
                <div class="mb-2 f-base">第一步：选择需要导出的项目</div>
                <el-tree
                        ref="docTree"
                        :data="navTreeData"
                        node-key="_id"
                        show-checkbox
                        check-strictly
                        @check-change="handleCheckChange"
                        :expand-on-click-node="true"
                >
                    <template slot-scope="scope">
                        <div
                                class="custom-tree-node"
                                tabindex="0"
                                slot="reference"
                        >
                            <!-- file渲染 -->
                            <template v-if="!scope.data.isFolder">
                                <template v-for="(req) in validRequestMethods">
                                    <span v-if="scope.data.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toLowerCase() }}</span>
                                </template>
                                <span class="node-name ml-1">{{ scope.data.name }}</span>
                            </template>
                            <!-- 文件夹渲染 -->
                            <template v-if="scope.data.isFolder">
                                <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px"/>
                                <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                            </template>
                        </div>
                    </template>
                </el-tree>
            </div>
            <div class="right">
                <div>
                    <div class="mb-2 f-base">第二步：选择需要挂载的文件夹</div>
                    <el-radio-group v-model="projectId" size="mini" @change="handleChangeProject">
                        <el-radio v-for="(item, index) in projectEnum" :key="index" :label="item._id">{{ item.projectName }}</el-radio>
                    </el-radio-group>
                    <s-loading :loading="loading" class="project-nav mt-2">
                        <el-tree
                            ref="mountedTree"
                            :data="projectTreeData"
                            node-key="_id"
                            show-checkbox
                            check-strictly
                            empty-text="请在上方选择项目挂载"
                            @check="handleMountedCheckChange"
                            :expand-on-click-node="true"
                        >
                            <template slot-scope="scope">
                                <div
                                        class="custom-tree-node"
                                        tabindex="1"
                                        slot="reference"
                                >
                                    <!-- 文件夹渲染 -->
                                    <template v-if="scope.data.isFolder">
                                        <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px"/>
                                        <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                                    </template>
                                </div>
                            </template>
                        </el-tree>
                    </s-loading>
                </div>
            </div>
        </div>
    </s-fieldset>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            pressCtrl: false, //--------是否按住ctrl
            allCheckedNodes: [], //-----所有被选中的节点id数组
            //===================================枚举参数====================================//
            projectEnum: [], //---------项目枚举信息
            //===================================业务参数====================================//
            projectTreeData: [], //-----其他项目导航菜单信息
            //===================================其他参数====================================//
            projectId: "", //------------项目id
            loading: false, //-----------项目导航加载
        };
    },
    computed: {
        navTreeData() { //-------树形导航数据
            return this.$store.state.apidoc.banner;
        },
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
        currentSelectDoc() { //--当前选中的文档
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
    },
    created() {
        this.getProjectEnum();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //获取项目枚举
        getProjectEnum() {
            this.axios.get("/api/project/project_enum").then((res) => {
                this.projectEnum = res.data;
            }).catch((err) => {
                console.error(err);
            });
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //节点选中状态改变时候
        handleCheckChange(val, checked) {
            if (checked) {
                this.$helper.forEachForest(val.children || [], (cNode) => {
                    this.$refs.docTree.setChecked(cNode._id, true);
                });
            }
            this.$nextTick(() => {
                this.allCheckedNodes = this.$refs.docTree.getCheckedNodes();
            })
        },
        //选择挂载点
        handleMountedCheckChange(val) {
            this.$refs.mountedTree.setCheckedKeys([], true);
            setTimeout(() => {
                this.$refs.mountedTree.setCheckedKeys([val._id], true);
            })
        },
        //改变项目信息重新获取项目导航数据
        handleChangeProject(projectId) {
            this.loading = true;
            const params = {
                projectId,
            };
            this.axios.get("/api/project/doc_tree_folder_node", { params }).then((res) => {
                this.projectTreeData = res.data;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.fork {
    .el-divider--horizontal {
        margin: size(10) 0;
    }
    .fork-wrap {
        display: flex;
        .left {
            flex: 0 0 50%;
            border-right: 1px solid $gray-300;
            .custom-tree-node {
                @include custom-tree-node;
            }
        }
        .right {
            flex: 1;
            padding: 0 size(15);
            .custom-tree-node {
                @include custom-tree-node;
            }
        }
    }
}

</style>
