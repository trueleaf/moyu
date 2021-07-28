/*
    创建者：shuxiaokai
    创建时间：2021-07-27 21:24
    模块名称：banner菜单顶部搜索和操作区域
    备注：
*/
<template>
    <div class="tool">
        <h2 class="gray-700 f-lg text-center text-ellipsis" :title="projectName">{{ projectName }}</h2>
        <el-input v-model="queryData" class="doc-search" placeholder="文档名称、文档url、创建者" clearable @input="handleFilterBanner"></el-input>
        <div class="tool-icon mt-1 px-1">
            <s-draggable v-model="operations" animation="150" item-key="name" class="operation">
                <template #item="{ element }">
                    <div>
                        <el-tooltip :key="element.name" class="item" effect="dark" :content="element.name" :open-delay="300">
                            <div>
                                <svg class="svg-icon" aria-hidden="true" @click="handleEmit(element.op)">
                                    <use :xlink:href="element.icon"></use>
                                </svg>
                            </div>
                        </el-tooltip>
                        <!-- <el-dropdown ref="dropdown" trigger="click" class="more">
                            <i class="more-op el-icon-more" title="更多操作"></i>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="handleViewDoc">
                                        <div class="dropdown-item">
                                            <span>预览文档</span>
                                            <span class="gray-500">Ctrl+P</span>
                                        </div>
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="handleOpenExportPage">
                                        <div class="dropdown-item">
                                            <span>导出文档</span>
                                            <span class="gray-500">Ctrl+E</span>
                                        </div>
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="handleOpenImportPage">
                                        <div class="dropdown-item">
                                            <span>导入文档</span>
                                            <span class="gray-500">Ctrl+I</span>
                                        </div>
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="handleOpenHistoryPage">
                                        <div class="dropdown-item">
                                            <span>历史记录</span>
                                            <span class="gray-500">Ctrl+H</span>
                                        </div>
                                    </el-dropdown-item>
                                    <el-dropdown-item @click="handleOpenConfigPage">
                                        <div class="dropdown-item">
                                            <span>全局设置</span>
                                            <span class="gray-500">Ctrl+,</span>
                                        </div>
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown> -->
                    </div>
                </template>
            </s-draggable>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import draggable from "vuedraggable"

export default defineComponent({
    components: {
        "s-draggable": draggable,
    },
    data() {
        return {
            operations: [{
                name: "新增文件夹",
                icon: "#iconxinzengwenjian",
                op: "addRootFolder",
                shortcut: [],
            }, {
                name: "新增文件",
                icon: "#iconwenjian",
                op: "addRootFile",
                shortcut: [],
            }, {
                name: "在线链接",
                icon: "#iconlink",
                op: "onlineLink",
                shortcut: ["Ctrl", "L"],
            }, {
                name: "刷新banner",
                icon: "#iconshuaxin",
                op: "freshBanner",
                shortcut: [],
            }, {
                name: "回收站",
                icon: "#iconhuishouzhan",
                op: "recycler",
                shortcut: ["Ctrl", "Alt", "R"],
            }, {
                name: "预览文档",
                icon: "#iconyulan",
                op: "viewDoc",
                shortcut: ["Ctrl", "P"],
            },
            // {
            //     name: "导出文档",
            //     icon: "#icondaochu1",
            //     op: "exportDoc",
            //     shortcut: ["Ctrl", "E"],
            // }, {
            //     name: "导入文档",
            //     icon: "#icondaoru",
            //     op: "importDoc",
            //     shortcut: ["Ctrl", "I"],
            // }, {
            //     name: "历史记录",
            //     icon: "#iconlishi",
            //     op: "history",
            //     shortcut: ["Ctrl", "H"],
            // }, {
            //     name: "全局设置",
            //     icon: "#iconshezhi",
            //     op: "config",
            //     shortcut: ["Ctrl", ","],
            // }
            ],
            queryData: "", //过滤条件
        };
    },
    computed: {
        projectName(): string {
            return this.$store.state["apidoc/baseInfo"].projectName;
        },
    },
    methods: {
        handleFilterBanner() {
            console.log(333)
        },
        //操作
        handleEmit(op: string) {
            console.log(op);
        },
        //点击新增文件夹
        handleClickAddFolder() {
            this.$helper.event.emit("apidoc/addRootFolder");
        },
        //新建文件
        handleClickAddFile() {
            this.$helper.event.emit("apidoc/addRootFile");
        },
        //刷新banner
        freshBanner() {
            this.$helper.event.emit("apidoc/freshBanner");
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
        handleAddTab(name: string, tabType: string) {
            console.log(name, tabType)
            // this.$store.commit("apidoc/changeCurrentTab", {
            //     _id: tabType,
            //     projectId: this.$route.query.id,
            //     name,
            //     changed: false,
            //     tabType,
            // });
            // if (this.tabs && this.tabs.find((tab) => tab.tabType === tabType)) { //存在则返回不处理
            //     return;
            // }
            // this.$store.commit("apidoc/addTab", {
            //     _id: tabType,
            //     projectId: this.$route.query.id,
            //     name,
            //     changed: false,
            //     tabType,
            // });
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
})
</script>

<style lang="scss">
.tool {
    position: relative;
    padding: 0 size(20);
    height: size(150);
    background: $gray-200;
    // 搜索框样式
    .doc-search {
        border-radius: 20px;
        .el-input__inner {
            border-radius: 20px;
        }
    }
    // 快捷方式样式
    .tool-icon {
        position: relative;
        .operation {
            display: flex;
            justify-content: space-between;
        }
        .more {
        }
        .svg-icon {
            width: size(25);
            height: size(25);
            padding: size(5);
            cursor: pointer;
            &:hover {
                background: $gray-400;
            }
        }
    }
    .more-op {
        width: size(25);
        height: size(25);
        line-height: size(25);
        text-align: center;
        cursor: pointer;
        &:hover {
            background: $gray-400;
        }
    }
}
</style>
