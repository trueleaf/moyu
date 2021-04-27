/*
    创建者：shuxiaokai
    创建时间：2021-03-09 21:47
    模块名称：生成在线链接
    备注：
*/
<template>
    <div class="online-link">
        <div class="link-wrap">
            <div class="d-flex j-center mt-5">
                <svg class="link-icon" aria-hidden="true">
                    <use xlink:href="#iconlink"></use>
                </svg>
            </div>
            <s-fieldset title="生成链接">
                <div class="d-flex">
                    <pre class="link w-70">{{ shareLink }}</pre>
                    <el-button-group class="flex0 w-200px">
                        <!-- <el-button :loading="loading" :size="config.renderConfig.layout.size" @click="handleGenerateLink">生成</el-button> -->
                        <el-button v-copy="shareLink" :size="config.renderConfig.layout.size">复制</el-button>
                    </el-button-group>
                </div>
            </s-fieldset>
            <s-fieldset title="额外配置">
                <s-config label="密码设置" :has-check="false" description="密码可不填写">
                    <el-input
                        v-model="formInfo.password"
                        :size="config.renderConfig.layout.size"
                        placeholder="请输入密码"
                        class="w-100"
                        maxlength="100"
                        type="password"
                        show-password
                        clearable
                    >
                    </el-input>
                </s-config>
                <s-config label="过期时间" :has-check="false" description="不填默认一个月后过期，最大日期为一年">
                    <el-radio-group v-model="formInfo.maxAge" :disabled="customMaxAge">
                        <el-radio :label="86400000">1天后</el-radio>
                        <el-radio :label="86400000 * 7">1周后</el-radio>
                        <el-radio :label="86400000 * 30">1个月后</el-radio>
                        <el-radio :label="86400000 * 90">1个季度后</el-radio>
                    </el-radio-group>
                    <el-checkbox v-model="customMaxAge" class="ml-5" :label="true">自定义</el-checkbox>
                    <el-slider v-if="customMaxAge" v-model="formInfo.maxAge" :min="86400000" :step="86400000" :max="86400000 * 365" :format-tooltip="formatTooltip"></el-slider>
                </s-config>
                <s-config ref="configShare" label="选择分享" description="开启后可以自由选择需要分享的文档">
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
                                :expand-on-click-node="true"
                                @check-change="handleCheckChange"
                            >
                                <template slot-scope="prop">
                                    <el-popover
                                        v-model="prop.data._ctrlPress"
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
                                            slot="reference"
                                            class="custom-tree-node"
                                            :class="{'active': currentSelectDoc && currentSelectDoc._id === scope.data._id}"
                                            tabindex="0"
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
                                                <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px" />
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
                    <el-button :size="config.renderConfig.layout.size" :loading="loading" type="primary" @click="handleGenerateLink">生成链接</el-button>
                </div>
            </s-fieldset>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            formInfo: {
                password: "",
                maxAge: 86400000 * 30,
            },
            shareLink: "", //-----------在线链接
            customMaxAge: false, //-----自定义过期时间
            pressCtrl: false, //--------是否按住ctrl
            allCheckedNodes: [], //-----所有被选中的节点id数组
            //=====================================其他参数====================================//
            loading: false, //----------生成在线链接加载按钮
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

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//
        //生成链接
        handleGenerateLink() {
            const enableCustomExport = this.$refs.configShare.enabled;
            const customExportIsEmpty = this.allCheckedNodes.length === 0;
            if (enableCustomExport && customExportIsEmpty) { //允许自定义分享并且数据为空
                this.$message.warning("请至少选择一个文档分享");
                return;
            }
            this.generateLink();
        },
        //生成链接
        generateLink() {
            this.loading = true;
            const { maxAge, password } = this.formInfo; //默认一个月过期
            const selectedIds = this.allCheckedNodes.map((val) => val._id);
            const expire = Date.now() + maxAge;
            const params = {
                projectId: this.$route.query.id,
                maxAge,
                password,
                selectedDocs: selectedIds,
            };
            this.axios.post("/api/project/export/online", params).then((res) => {
                const shareId = res.data;
                const projectName = this.$route.query.name;
                this.shareLink = `${this.config.renderConfig.share.baseUrl}/#/?shareId=${shareId}&projectName=${projectName}&expire=${expire}`;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================ctrl+鼠标移入弹出详情====================================//
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
        //=====================================组件间交互====================================//
        //格式化展示
        formatTooltip(val) {
            return `${val / 86400000}天后`;
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.online-link {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    width: 100%;
    .link-wrap {
        width: 70%;
        min-width: size(768);
        margin: 0 auto;
        .link {
            height: size(28);
            white-space: nowrap;
            overflow-y: auto;
            user-select: auto;
            &::-webkit-scrollbar {
                height: 0px;
            }
        }
        .link-icon {
            width: size(120);
            height: size(120);
        }
    }
    .doc-nav {
        .custom-tree-node {
            @include custom-tree-node;
        }
    }

}
</style>
