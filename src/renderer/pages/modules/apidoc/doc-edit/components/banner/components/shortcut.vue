/*
    创建者：shuxiaokai
    创建时间：2021-05-21 08:58
    模块名称：快捷方式
    备注：
*/
<template>
    <div class="tool-icon d-flex j-between mt-1 px-1">
        <el-tooltip class="item" effect="dark" content="新增文件夹" :open-delay="300">
            <svg class="svg-icon" aria-hidden="true" @click="handleClickAddFolder">
                <use xlink:href="#iconxinzengwenjian"></use>
            </svg>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="新增文件" :open-delay="300">
            <svg class="svg-icon" aria-hidden="true" @click="handleClickAddFile">
                <use xlink:href="#iconwenjian"></use>
            </svg>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" content="在线链接" :open-delay="300">
            <svg class="svg-icon" aria-hidden="true" @click="handleOpenOnlineLink">
                <use xlink:href="#iconlink"></use>
            </svg>
        </el-tooltip>
        <svg class="item svg-icon" aria-hidden="true" @click="freshBanner">
            <use xlink:href="#iconshuaxin"></use>
        </svg>
        <el-tooltip class="item" effect="dark" content="回收站" :open-delay="300">
            <svg class="svg-icon" aria-hidden="true" @click="handleOpenRecyclerPage">
                <use xlink:href="#iconhuishouzhan"></use>
            </svg>
        </el-tooltip>
        <el-dropdown ref="dropdown" trigger="click" class="mr-1">
            <i class="more-op el-icon-more" title="更多操作"></i>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleViewDoc">
                    <div class="dropdown-item">
                        <span>预览文档</span>
                        <span class="gray-500">Ctrl+P</span>
                    </div>
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleOpenExportPage">
                    <div class="dropdown-item">
                        <span>导出文档</span>
                        <span class="gray-500">Ctrl+E</span>
                    </div>
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleOpenImportPage">
                    <div class="dropdown-item">
                        <span>导入文档</span>
                        <span class="gray-500">Ctrl+I</span>
                    </div>
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleOpenHistoryPage">
                    <div class="dropdown-item">
                        <span>历史记录</span>
                        <span class="gray-500">Ctrl+H</span>
                    </div>
                </el-dropdown-item>
                <el-dropdown-item @click.native="handleOpenConfigPage">
                    <div class="dropdown-item">
                        <span>全局设置</span>
                        <span class="gray-500">Ctrl+,</span>
                    </div>
                </el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            shortcut: {},
            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
        };
    },
    created() {

    },
    methods: {
        //点击新增文件夹
        handleClickAddFolder() {
            this.$event.emit("apidoc/addRootFolder");
        },
        //新建文件
        handleClickAddFile() {
            this.$event.emit("apidoc/addRootFile");
        },
        //刷新banner
        freshBanner() {
            this.$event.emit("apidoc/freshBanner");
        },
        //打开在线链接tab
        handleOpenOnlineLink() {
            this.handleAddTab("生成在线链接", "onlineLink");
        },
        //打开导出tab
        handleOpenExportPage() {
            this.handleAddTab("文档导出", "exportDoc");
        },
        //打开导入tab
        handleOpenImportPage() {
            this.handleAddTab("文档导入", "importDoc");
        },
        //打开配置界面
        handleOpenConfigPage() {
            this.handleAddTab("文档全局配置", "config");
        },
        //打开历史记录界面
        handleOpenHistoryPage() {
            this.handleAddTab("历史记录", "history");
        },
        //打开回收站
        handleOpenRecyclerPage() {
            this.handleAddTab("回收站", "recycler");
        },
        //打开新的tab
        handleAddTab(name, tabType) {
            this.$store.commit("apidoc/changeCurrentTab", {
                _id: tabType,
                projectId: this.$route.query.id,
                name,
                changed: false,
                tabType,
            });
            if (this.tabs && this.tabs.find((tab) => tab.tabType === tabType)) { //存在则返回不处理
                return;
            }
            this.$store.commit("apidoc/addTab", {
                _id: tabType,
                projectId: this.$route.query.id,
                name,
                changed: false,
                tabType,
            });
        },
        //预览文档
        handleViewDoc() {
            this.$router.push({
                path: "/v1/apidoc/doc-view",
                query: {
                    id: this.$route.query.id,
                    name: this.$route.query.name,
                },
            });
        },

    },
};
</script>

<style lang="scss">

</style>
