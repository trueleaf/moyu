/*
    创建者：shuxiaokai
    创建时间：2021-01-16 13:57
    模块名称：查询字符串
    备注：xxxx
*/
<template>
    <s-collapse-card v-bind="$attrs">
        <!-- 头部 -->
        <div slot="head">
            <span>请求参数</span>
            <span>(Params)</span>
        </div>
        <!-- 快捷操作 -->
        <div slot="operation" class="d-flex">
            <!-- 导入参数 -->
            <div class="cursor-pointer hover-theme-color mr-3" @click.stop="dialogVisible = true">
                <span>导入参数</span>
            </div>
            <!-- 模板选择 -->
            <div class="cursor-pointer hover-theme-color mr-3">
                <el-dropdown ref="dropdown" trigger="click" :show-timeout="0" @command="handleSelectPresetParams">
                    <div @click.stop.prevent="freshLocalUsefulParams">
                        <span class="cursor-pointer hover-theme-color">应用模板</span>
                    </div>
                    <div slot="dropdown">
                        <el-dropdown-menu>
                            <div class="apply-template">
                                <div class="cyan mb-2">常用</div>
                                <template v-for="(item, index) in usefulPresetRequestParamsList">
                                    <span class="params-item" :key="index" @click="handleSelectPresetParams(item)">{{ item.name }}</span>
                                </template>
                                <span class="theme-color cursor-pointer ml-2" @click="handleOpenParamsTemplate">维护</span>
                                <hr>
                            </div>
                            <el-dropdown-item v-for="(item, index) in templateList" :key="index" :command="item">
                                <span class="d-flex j-between">
                                    <span>{{ item.name }}</span>
                                    <span class="gray-400">{{ item.creatorName }}</span>
                                </span>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </div>
                </el-dropdown>
            </div>
            <!-- 保存为模板 -->
            <div class="cursor-pointer hover-theme-color mr-3" @click.stop="dialogVisible3 = true">
                <span>保存为模板</span>
            </div>
             <!-- json预览 -->
            <!-- <el-popover ref="jsonView" placement="right">
                <s-array-view :data="queryParams" class="w-500px mt-2">
                    <div v-copy="jsonQueryParams" slot="header" class="cursor-pointer">复制为json</div>
                </s-array-view>
                <div slot="reference" class="cursor-pointer hover-theme-color mr-3">
                    <span>预览参数</span>
                </div>
            </el-popover> -->
        </div>
        <!-- 参数录入 -->
        <s-params-tree
            ref="paramsTree"
            :tree-data="queryParams"
            :nest="false"
            :mind-params="mindParams.queryParams"
            showCheckbox
        >
        </s-params-tree>
        <!-- 弹窗 -->
        <s-json-schema :visible.sync="dialogVisible" :mind-params="mindParams.queryParams" @success="handleConvertJsonToParams"></s-json-schema>
        <s-params-template :items="queryParams" type="queryParams" :visible.sync="dialogVisible3" @success="handleAddParamsTemplate"></s-params-template>
    </s-collapse-card>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import jsonSchema from "@/pages/modules/apidoc/doc-edit/dialog/json-schema.vue"
import paramsTemplate from "@/pages/modules/apidoc/doc-edit/dialog/params-template.vue"

export default {
    name: "QUERY_PARAMS",
    mixins: [mixin],
    components: {
        "s-json-schema": jsonSchema,
        "s-params-template": paramsTemplate,
    },
    computed: {
        queryParams: { //请求参数
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.queryParams;
            },
            set(val) {
                this.$store.commit("apidoc/changeQueryParams", val);
            },
        },
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
        templateList() { //参数模板列表
            return this.$store.state.apidoc.presetParamsList.filter((val) => val.presetParamsType === "queryParams");
        },
        jsonQueryParams() {
            const queryParams = this.$store.state.apidoc.apidocInfo?.item?.queryParams;
            const convertQueryParams = this.convertPlainParamsToTreeData(queryParams || []);
            return JSON.stringify(convertQueryParams, null, 4);
        },
    },
    data() {
        return {
            usefulPresetRequestParamsList: [], //常用参数模板
            //=====================================其他参数====================================//
            dialogVisible: false, //将json转换为请求参数弹窗
            dialogVisible3: false, //保存当前参数为模板
        };
    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //选中_select为true的参数
        selectChecked() {
            return new Promise((resolve, reject) => {
                this.$refs.paramsTree.selectChecked().then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err)
                });
            })
        },
        //将json数据转换为参数
        handleConvertJsonToParams(result, convertType) {
            const convertData = result.map((val) => ({ ...val, type: "string", children: [] })); //仅转换第一层
            if (convertType === "append") {
                this.$store.commit("apidoc/unshiftQueryParams", convertData)
            } else if (convertType === "override") {
                this.$store.commit("apidoc/changeQueryParams", convertData)
            }
            this.$refs.paramsTree.selectChecked();
            console.log(result, convertType);
        },
        //选择模板
        handleSelectPresetParams(template) {
            this.$refs.dropdown.hide();
            let currentLocalData = localStorage.getItem("apidoc/queryParamsTemplate") || "{}";
            currentLocalData = JSON.parse(currentLocalData);
            if (!currentLocalData[this.$route.query.id]) {
                currentLocalData[this.$route.query.id] = [];
            }
            const findDoc = currentLocalData[this.$route.query.id].find((val) => val._id === template._id);
            if (!findDoc) {
                currentLocalData[this.$route.query.id].push(template)
            } else {
                if (!findDoc.selectNum) {
                    findDoc.selectNum = 0;
                }
                findDoc.selectNum += 1;
            }
            localStorage.setItem("apidoc/queryParamsTemplate", JSON.stringify(currentLocalData));

            const preParams = template.items.filter((val) => val.key !== "" && val.value !== "");
            for (let i = 0, len = preParams.length; i < len; i += 1) {
                const element = preParams[i];
                const isComplex = element.type !== "object" && element.type !== "array";
                if (isComplex && (element.key === "" || element.value === "")) { //对象，array不校验key和value
                    continue;
                }
                if (!this.queryParams.find((val) => val.key === element.key)) {
                    this.queryParams.unshift(element);
                    this.$refs.paramsTree.selectChecked()
                }
            }
        },
        //每次选择都增加当前选中模板的权重
        freshLocalUsefulParams() {
            let currentLocalData = localStorage.getItem("apidoc/queryParamsTemplate") || "{}";
            currentLocalData = JSON.parse(currentLocalData);
            currentLocalData = currentLocalData[this.$route.query.id] || [];
            this.usefulPresetRequestParamsList = currentLocalData.sort((a, b) => a.selectNum - b.selectNum > 0).slice(0, 3)
        },
        //新增模板成功后
        handleAddParamsTemplate(template) {
            console.log(template)
            this.$store.commit("apidoc/addPresetParams", template);
        },
        //打开模板维护模块
        handleOpenParamsTemplate() {
            this.$store.commit("apidoc/addTab", {
                id: "idParamsTemplate",
                projectId: this.$route.query.id,
                name: "参数模板",
                changed: false,
                tabType: "paramsTemplate",
            });
            this.$store.commit("apidoc/changeCurrentTab", {
                id: "idParamsTemplate",
                projectId: this.$route.query.id,
                name: "参数模板",
                changed: false,
                tabType: "paramsTemplate",
            });
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.apply-template {
    @include apply-template;
}
</style>
