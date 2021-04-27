/*
    创建者：shuxiaokai
    创建时间：2021-01-16 21:59
    模块名称：返回参数
    备注：xxxx
*/
<template>
    <div class="response-wrap">
        <s-collapse-card v-for="(item, index) in responseParams" :key="index" :fold="index !== 0">
            <s-params-tree
                ref="paramsTree"
                :tree-data="item.values"
                nest
                :mind-params="mindParams.responseParams"
            >
            </s-params-tree>
            <div slot="head" class="h-100 d-flex a-center">
                <span v-if="!item._isEdit" class="edit-title">{{ item.title }}</span>
                <input
                    v-else
                    :ref="'editInput' + index"
                    v-model="item._title"
                    class="edit-input"
                    :class="{active: item._title.length === 0}"
                    type="text"
                    @click.stop="() => {}"
                    @keydown.enter="handleConfirmHead(item)"
                    @blur="handleBlur(item)"
                >
                <span v-if="item._isEdit" class="ml-1 cursor-pointer theme-color" @click.stop="handleConfirmHead(item)">确定</span>
                <span v-if="item._isEdit" class="ml-1 cursor-pointer theme-color" @click.stop="handleCancelEditHead(item)">取消</span>
                <span v-if="!item._isEdit" title="修改名称" class="edit-icon el-icon-edit" @click.stop="handleEditHead(item, index)"></span>
            </div>
            <div slot="tail" class="d-flex">
                <div v-if="index === 0" class="green cursor-pointer" @click="handleAddResponse">新增</div>
                <div v-if="index !== 0" class="red cursor-pointer" @click="handleDeleteResponse(index)">删除</div>
            </div>
            <!-- 快捷操作 -->
            <div slot="operation" class="d-flex">
                <!-- 导入参数 -->
                <div class="cursor-pointer hover-theme-color mr-3" @click.stop="dialogVisible = true; currentResponseParams = item">
                    <span>导入参数</span>
                </div>
                <!-- 模板选择 -->
                <div class="cursor-pointer hover-theme-color mr-3">
                    <el-dropdown ref="dropdown" trigger="click" :show-timeout="0" @command="(template) => handleSelectPresetParams(template, item)">
                        <div @click.stop.prevent="freshLocalUsefulParams">
                            <span class="cursor-pointer hover-theme-color">应用模板</span>
                        </div>
                        <div slot="dropdown">
                            <el-dropdown-menu>
                                <div class="apply-template">
                                    <div class="cyan mb-2">常用</div>
                                    <template v-for="(params, index2) in usefulPresetParamsList">
                                        <span :key="index2" class="params-item" @click="handleSelectPresetParams(params, item)">{{ params.name }}</span>
                                    </template>
                                    <span class="theme-color cursor-pointer ml-2" @click="handleOpenParamsTemplate">维护</span>
                                    <hr>
                                </div>
                                <el-dropdown-item v-for="(template, i) in templateList" :key="i" :command="template">
                                    <span class="d-flex j-between">
                                        <span>{{ template.name }}</span>
                                        <span class="gray-400">{{ template.creatorName }}</span>
                                    </span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </div>
                    </el-dropdown>
                </div>
                <!-- 保存为模板 -->
                <div class="cursor-pointer hover-theme-color mr-3" @click.stop="handleOpenSaveTemplate(item)">
                    <span>保存为模板</span>
                </div>
                <!-- json预览 -->
                <el-popover placement="right">
                    <s-array-view :data="item.values" class="w-500px mt-2">
                        <div slot="header" v-copy="JSON.stringify(convertPlainParamsToTreeData(item.values), null, 4)" class="cursor-pointer">复制为json</div>
                    </s-array-view>
                    <div slot="reference" class="cursor-pointer hover-theme-color mr-3">
                        <span>预览参数</span>
                    </div>
                </el-popover>
            </div>
            <!-- 弹窗 -->
            <s-json-schema :visible.sync="dialogVisible" :mind-params="mindParams.responseParams" @success="handleConvertJsonToParams"></s-json-schema>
            <s-params-template :items="currentResponseParams.values" type="responseParams" :visible.sync="dialogVisible3" @success="handleAddParamsTemplate"></s-params-template>
        </s-collapse-card>
    </div>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import jsonSchema from "@/pages/modules/apidoc/doc-edit/dialog/json-schema.vue"
import paramsTemplate from "@/pages/modules/apidoc/doc-edit/dialog/params-template.vue"

export default {
    components: {
        "s-json-schema": jsonSchema,
        "s-params-template": paramsTemplate,
    },
    mixins: [mixin],
    data() {
        return {
            usefulPresetParamsList: [], //常用参数模板
            currentResponseParams: {}, //当前response值，因为有多个，操作时将当前值指向选中的response
            //=====================================其他参数====================================//
            dialogVisible: false, //将json转换为请求参数弹窗
            dialogVisible2: false, //模板维护增删改查
            dialogVisible3: false, //保存当前参数为模板
        };
    },
    computed: {
        responseParams: { //请求参数
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.responseParams;
            },
            set(val) {
                this.$store.commit("apidoc/changeResponse", val);
            },
        },
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
        templateList() { //参数模板列表
            return this.$store.state.apidoc.presetParamsList.filter((val) => val.presetParamsType === "responseParams");
        },
    },
    created() {},
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//
        //=====================================组件间交互====================================//
        //新增一个返回参数
        handleAddResponse() {
            if (this.responseParams.length > 5) {
                this.$message.warning("返回参数数量不超过5个")
                return;
            }
            const response = {
                title: "自定义返回参数",
                statusCode: 200,
                values: [this.generateProperty()],
            }
            this.$store.commit("apidoc/addResponse", response);
        },
        //删除一个返回
        handleDeleteResponse(index) {
            this.$store.commit("apidoc/deleteResponse", index);
        },
        //编辑head
        handleEditHead(item, index) {
            this.$set(item, "_isEdit", true);
            this.$set(item, "_title", item.title);
            this.$nextTick(() => {
                this.$refs[`editInput${index}`][0].focus();
            })
        },
        //取消编辑
        handleCancelEditHead(item) {
            item._title = item.title;
            item._isEdit = false;
        },
        //确认保存编辑
        handleConfirmHead(item) {
            if (item._title.length === 0) {
                item._title = item.title;
                item._isEdit = false;
                return
            }
            item.title = item._title;
            item._isEdit = false;
        },
        //blur
        handleBlur(item) {
            if (item._title.length === 0) {
                item._title = item.title;
                item._isEdit = false;
            }
        },
        //打开保存模板弹窗
        handleOpenSaveTemplate(item) {
            this.currentResponseParams = item;
            this.dialogVisible3 = true
        },
        //=====================================其他操作=====================================//
        //将json数据转换为参数
        handleConvertJsonToParams(result, convertType) {
            if (convertType === "append") {
                result.forEach((val) => {
                    this.currentResponseParams.values.unshift(val);
                })
            } else if (convertType === "override") {
                this.currentResponseParams.values = result;
            }
            // this.currentResponseParams = null;
        },
        //选择模板
        handleSelectPresetParams(template, response) {
            this.$refs.dropdown.forEach((dropdown) => {
                dropdown.hide();
            })
            let currentLocalData = localStorage.getItem("apidoc/responseParamsTemplate") || "{}";
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
            localStorage.setItem("apidoc/responseParamsTemplate", JSON.stringify(currentLocalData));

            const preParams = template.items.filter((val) => val.key !== "" && val.value !== "");
            for (let i = 0, len = preParams.length; i < len; i += 1) {
                const element = preParams[i];
                const isComplex = element.type !== "object" && element.type !== "array";
                if (isComplex && (element.key === "" || element.value === "")) { //对象，array不校验key和value
                    continue;
                }
                if (!response.values.find((val) => val.key === element.key)) {
                    response.values.unshift(element);
                }
            }
        },
        //每次选择都增加当前选中模板的权重
        freshLocalUsefulParams() {
            let currentLocalData = localStorage.getItem("apidoc/responseParamsTemplate") || "{}";
            currentLocalData = JSON.parse(currentLocalData);
            currentLocalData = currentLocalData[this.$route.query.id] || [];
            this.usefulPresetParamsList = currentLocalData.sort((a, b) => a.selectNum - b.selectNum > 0).slice(0, 3)
        },
        //新增模板成功后
        handleAddParamsTemplate(template) {
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
.response-wrap {
    .edit-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        cursor: pointer;
        width: size(40);
        &:hover {
            color: $theme-color;
        }
    }
    .edit-title {
        border: 1px solid transparent;
    }
    .edit-input {
        border: 1px solid $gray-600;
        font-size: fz(14);
        height: size(20);
        line-height: size(20);
        &.active {
            border: 1px solid $red;
        }
    }
}
</style>
