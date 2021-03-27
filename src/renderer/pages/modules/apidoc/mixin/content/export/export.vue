/*
    创建者：shuxiaokai
    创建时间：2020-11-4 19:07
    模块名称：导出文档
    备注：xxxx
*/
<template>
    <div class="doc-export">
        <!-- <div class="d-flex j-center mt-5">
            <img src="@/assets/imgs/logo.png" alt="logo" width="120px" height="120px">
        </div> -->
        <s-fieldset title="导出类型">
            <div class="download-wrap">
                <div class="item" :class="{active: selectedType === 'html'}" @click="selectedType = 'html'">
                    <svg class="svg-icon" aria-hidden="true">
                        <use xlink:href="#iconhtml"></use>
                    </svg>
                    <div class="mt-1">HTML</div>
                </div>
                <div class="item" :class="{active: selectedType === 'moyu'}" @click="selectedType = 'moyu'">
                    <img src="@/assets/imgs/logo.png" alt="moyu" class="img">
                    <div class="mt-1">JSON文档</div>
                </div>
                <div class="item" :class="{active: selectedType === 'otherProject'}" @click="selectedType = 'otherProject'">
                    <svg class="svg-icon" aria-hidden="true">
                        <use xlink:href="#icondaochu1"></use>
                    </svg>
                    <div class="mt-1">导出到其他项目</div>
                </div>
            </div>
        </s-fieldset>
        <s-fieldset v-if="selectedType !== 'otherProject'" title="额外配置">
            <s-config ref="config" label="选择导出" description="开启后可以自由选择需要导出的文档">
                <template slot-scope="scope">
                    <div v-if="scope.enabled" class="doc-nav">
                        <div>
                            <span>总数：</span>
                            <span>{{ allCheckedNodes.length }}</span>
                            <el-divider direction="vertical"></el-divider>
                            <span>文件夹数量：</span>
                            <span>{{ allCheckedNodes.filter(node => node.isFolder).length }}</span>
                            <el-divider direction="vertical"></el-divider>
                            <span>文档数量：</span>
                            <span>{{ allCheckedNodes.filter(node => !node.isFolder).length }}</span>
                        </div>
                        <el-divider></el-divider>
                        <el-tree
                                ref="docTree"
                                :data="navTreeData"
                                node-key="_id"
                                show-checkbox
                                @check-change="handleCheckChange"
                                :expand-on-click-node="true"
                        >
                            <template slot-scope="scope">
                                <div
                                        class="custom-tree-node"
                                        :class="{'active': currentSelectDoc && currentSelectDoc._id === scope.data._id}"
                                        tabindex="0"
                                        slot="reference"
                                        @keydown.stop="handleKeydown($event, scope.data)"
                                        @keyup.stop="handleKeyUp($event, scope.data)"
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
                </template>
            </s-config>
            <div class="d-flex j-center mt-2">
                <el-button :loading="loading" size="mini" type="primary" @click="handleExport">确定导出</el-button>
            </div>
        </s-fieldset>
        <s-fork v-else></s-fork>
    </div>
</template>

<script>
import fork from "./fork/fork.vue"

export default {
    components: {
        "s-fork": fork,
    },
    props: {
        visible: { //是否现实弹窗
            type: Boolean,
            default: false,
        },
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
    data() {
        return {
            formInfo: {
                name: "", //------------文件名称
            },
            selectedType: "html", //----导出文档类型
            pressCtrl: false, //--------是否按住ctrl
            allCheckedNodes: [], //-----所有被选中的节点id数组
            //=====================================枚举参数====================================//
            //=====================================其他参数====================================//
            loading: false, //----------导出加载按钮
        };
    },
    mounted() {
    },
    methods: {
        //=====================================数据获取====================================//
        //=====================================ctrl+鼠标移入弹出详情========================//
        //处理节点上面keydown快捷方式
        handleKeydown(e, data) {
            if (e.code === "ControlLeft" || e.code === "ControlRight") {
                this.clearPopover();
                this.$set(data, "_ctrlPress", true);
                this.pressCtrl = true;
            }
        },
        //清除popover效果
        clearPopover() {
            this.$helper.forEachForest(this.navTreeData, (data) => {
                this.$set(data, "_ctrlPress", false);
            });
        },
        //按键放开
        handleKeyUp() {
            this.clearPopover();
            this.pressCtrl = false;
        },
        //节点选中状态改变时候
        handleCheckChange() {
            const checkedNodes = this.$refs.docTree.getCheckedNodes();
            const halfCheckedNodes = this.$refs.docTree.getHalfCheckedNodes();
            this.allCheckedNodes = checkedNodes.concat(halfCheckedNodes);
        },
        //=====================================前后端交互=====================================//
        //确认导出
        handleExport() {
            const enableCustomExport = this.$refs.config.enabled;
            const customExportIsEmpty = this.allCheckedNodes.length === 0;
            if (enableCustomExport && customExportIsEmpty) { //允许自定义导出并且数据为空
                this.$message.warning("请至少选择一个文档导出");
                return;
            }
            if (this.selectedType === "html") {
                this.handleExportAsHTML();
            } else if (this.selectedType === "moyu") {
                this.handleExportAsMoyu();
            } else { //默认兜底导出html
                this.handleExportAsHTML();
            }
        },
        //导出为html
        handleExportAsHTML() {
            const selectedIds = this.allCheckedNodes.map((val) => val._id);
            this.loading = true;
            const params = {
                projectId: this.$route.query.id,
                selectedNodes: selectedIds,
            };
            this.axios.request({
                method: "post",
                url: "/api/project/export/html",
                responseType: "blob",
                data: params,
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //导出为摸鱼文档
        handleExportAsMoyu() {
            const selectedIds = this.allCheckedNodes.map((val) => val._id);
            this.loading = true;
            const params = {
                projectId: this.$route.query.id,
                selectedNodes: selectedIds,
            };
            this.axios.request({
                method: "post",
                url: "/api/project/export/moyu",
                responseType: "blob",
                data: params,
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.doc-export {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    width: 70%;
    min-width: size(768);
    margin: 0 auto;
    .download-wrap {
        display: flex;
        .item {
            width: size(130);
            height: size(100);
            padding: size(10);
            margin-right: size(20);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            border: 1px solid transparent;
            &.active {
                border: 1px solid $gray-400;
                box-shadow: $box-shadow-sm;
            }
            &:hover {
                border: 1px solid $gray-400;
            }
            .svg-icon {
                width: size(70);
                height: size(70);
            }
            .img {
                width: size(60);
                height: size(60);
            }
        }
    }
    .doc-nav {
        // max-height: size(400);
        .custom-tree-node {
            @include custom-tree-node;
        }
    }
}
</style>
