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
        <s-fieldset title="文档详情">
            <div class="download-wrap">
                <div class="item" :class="{active: selectedType === 'html'}" @click="selectedType = 'html'">
                    <svg class="svg-icon" aria-hidden="true">
                        <use xlink:href="#iconhtml"></use>
                    </svg>
                    <div class="mt-1">HTML</div>
                </div>
                <div class="item" :class="{active: selectedType === 'moyu'}" @click="selectedType = 'moyu'">
                    <img src="@/assets/imgs/logo.png" alt="moyu" class="svg-icon">
                    <div class="mt-1">JSON文档</div>
                </div>
            </div>
            <!-- <s-download url="/api/project/doc_offline_data" :params="{ projectId: $route.query.id }" class="item"></s-download> -->
            <!-- <s-download url="/api/project/export/moyu" :params="{ projectId: $route.query.id }" class="item"></s-download> -->
        </s-fieldset>
        <s-fieldset title="额外配置">
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
                        <hr>
                        <el-tree
                                ref="docTree"
                                :data="navTreeData"
                                node-key="_id"
                                show-checkbox
                                @check-change="handleCheckChange"
                                :expand-on-click-node="true"
                        >
                            <template slot-scope="scope">
                                <el-popover
                                    v-model="scope.data._ctrlPress"
                                    class="w-100"
                                    placement="right"
                                    width="300"
                                    trigger="manual"
                                    >
                                    <div class="d-flex flex-column">
                                        <s-label-value label="id：" label-width="auto" :value="scope.data._id"></s-label-value>
                                        <s-label-value label="创建者：" label-width="auto" :value="scope.data.creator"></s-label-value>
                                        <s-label-value v-if="!scope.data.isFolder" label="url：" label-width="auto" :value="scope.data.url.path" class="mb-0"></s-label-value>
                                    </div>
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
                                </el-popover>
                            </template>
                        </el-tree>
                    </div>
                </template>
            </s-config>
            <div class="d-flex j-center mt-2">
                <el-button :loading="loading" size="mini" type="primary" @click="handleExport">确定导出</el-button>
            </div>
        </s-fieldset>
    </div>
</template>

<script>
export default {
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
            //=====================================其他参数====================================//
            loading: false, //----------导出加载按钮
        };
    },
    mounted() {},
    methods: {
        //处理节点上面keydown快捷方式(例如f2重命名)
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
        //=====================================其他操作=====================================//
        //确认导出
        handleExport() {
            const enableCustomExport = this.$refs.config.enabled;
            const customExportIsEmpty = this.allCheckedNodes.length === 0;
            if (enableCustomExport && !customExportIsEmpty) { //允许自定义导出并且数据不为空

            } else if (enableCustomExport && customExportIsEmpty) { //允许自定义导出并且数据为空
                this.$message.warning("请至少选择一个文档导出");
            } else { //完整导出
                this.loading = true;
                const params = {
                    projectId: this.$route.query.id,
                };
                this.axios.get("/api/project/doc_offline_data", { params }).then((res) => {
                    this.$helper.download(res.data, res.fileName);
                }).catch((err) => {
                    this.$errorThrow(err, this);
                }).finally(() => {
                    this.loading = false;
                });
            }
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
            width: size(100);
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
