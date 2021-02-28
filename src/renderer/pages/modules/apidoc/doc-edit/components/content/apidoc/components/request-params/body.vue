/*
    创建者：shuxiaokai
    创建时间：2021-01-16 13:58
    模块名称：body请求参数
    备注：xxxx
*/
<template>
    <s-collapse-card v-bind="$attrs" class="body-params">
        <div slot="head">
            <span>请求参数</span>
            <span>(Body)</span>
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
                                <template v-for="(item, index) in usefulPresetParamsList">
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
            <el-popover v-if="contentType === 'application/json'" placement="right">
                <s-array-view :data="jsonBody" class="mt-2">
                    <div v-copy="jsonBodyParams" slot="header" class="cursor-pointer">复制为json</div>
                </s-array-view>
                <div slot="reference" class="cursor-pointer hover-theme-color mr-3">
                    <span>JSON预览</span>
                </div>
            </el-popover>
        </div>
        <div class="d-flex a-center j-center py-2">
            <el-radio-group v-model="contentType">
                <el-radio label="application/json">json</el-radio>
                <el-radio label="multipart/form-data">form-data</el-radio>
                <el-radio label="application/x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
            </el-radio-group>
        </div>
        <!-- json -->
        <s-params-tree
            v-show="contentType === 'application/json'"
            ref="jsonTree"
            :tree-data="jsonBody"
            nest
            :mind-params="mindParams.requestBody"
            showCheckbox
        >
        </s-params-tree>
        <!-- form-data -->
        <s-params-tree
            v-show="contentType === 'multipart/form-data'"
            ref="formDataTree"
            :tree-data="formDataBody"
            :nest="false"
            :mind-params="mindParams.requestBody"
            enable-form-data
            showCheckbox
        >
        </s-params-tree>
        <!-- x-www-form-urlencoded -->
        <s-params-tree
            v-show="contentType === 'application/x-www-form-urlencoded'"
            ref="formUrlTree"
            :tree-data="formUrlBody"
            :nest="false"
            :mind-params="mindParams.requestBody"
            showCheckbox
        >
        </s-params-tree>
        <!-- 弹窗 -->
        <s-json-schema :visible.sync="dialogVisible" :mind-params="mindParams.requestBody" @success="handleConvertJsonToParams"></s-json-schema>
        <s-params-template :items="requestBody" type="requestBody" :visible.sync="dialogVisible3" @success="handleAddParamsTemplate"></s-params-template>
    </s-collapse-card>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import jsonSchema from "@/pages/modules/apidoc/doc-edit/dialog/json-schema.vue"
import paramsTemplate from "@/pages/modules/apidoc/doc-edit/dialog/params-template.vue"

export default {
    name: "REQUEST_BODY",
    mixins: [mixin],
    components: {
        "s-json-schema": jsonSchema,
        "s-params-template": paramsTemplate,
    },
    computed: {
        requestBody() { //请求body
            return this.$store.state.apidoc.apidocInfo?.item?.requestBody;
        },
        contentType: { //请求contentType类型
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.contentType;
            },
            set(val) {
                this.$refs.jsonTree?.selectChecked();
                this.$refs.formDataTree?.selectChecked();
                this.$refs.formUrlTree?.selectChecked();
                this.$store.commit("apidoc/changeContentType", val);
            },
        },
        templateList() { //参数模板列表
            return this.$store.state.apidoc.presetParamsList.filter((val) => val.presetParamsType === "requestBody");
        },
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
        jsonBodyParams() {
            const convertBodyParams = this.convertPlainParamsToTreeData(this.jsonBody);
            return JSON.stringify(convertBodyParams, null, 4);
        },
    },
    data() {
        return {
            usefulPresetParamsList: [], //常用参数模板
            //=========================================================================//
            jsonBody: [], //application/json
            formDataBody: [], //multipart/form-data
            formUrlBody: [], //application/x-www-form-urlencoded
            //=====================================其他参数====================================//
            contentTypeWatchFlag: null, //内容区域watch
            jsonWatchFlag: null, //watch标识用于清空数据
            formDataWatchFlag: null, //watch标识用于清空数据
            formUrlWatchFlag: null, //watch标识用于清空数据
            //=====================================其他参数====================================//
            dialogVisible: false, //将json转换为请求参数弹窗
            dialogVisible3: false, //保存当前参数为模板
        };
    },
    created() {
        this.$on("dataReady", () => {
            this.initRequestBody();
        });
    },
    methods: {
        //=====================================初始化&获取远程数据===========================//
        //初始化requestBody
        initRequestBody() {
            this.jsonBody = [];
            this.formDataBody = [];
            this.formUrlBody = [];
            if (this.contentType === "application/json") {
                this.jsonBody = this.$helper.cloneDeep(this.requestBody);
                this.formDataBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
            } else if (this.contentType === "application/x-www-form-urlencoded") {
                this.formUrlBody = this.$helper.cloneDeep(this.requestBody);
                this.jsonBody = [this.generateProperty()];
                this.formDataBody = [this.generateProperty()];
            } else if (this.contentType === "multipart/form-data") {
                this.formDataBody = this.$helper.cloneDeep(this.requestBody);
                this.jsonBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
            } else { //默认按照json进行处理
                this.jsonBody = this.$helper.cloneDeep(this.requestBody);
                this.formDataBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
            }
            this.initWatch();
        },
        //初始化以后绑定对参数的监听
        initWatch() {
            this.jsonWatchFlag && this.jsonWatchFlag();
            this.formDataWatchFlag && this.formDataWatchFlag();
            this.formUrlWatchFlag && this.formUrlWatchFlag();
            this.contentTypeWatchFlag && this.contentTypeWatchFlag();
            //=========================================================================//
            this.jsonWatchFlag = this.$watch("jsonBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(val));
            }), {
                deep: true,
            });
            this.formDataWatchFlag = this.$watch("formDataBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(val));
            }), {
                deep: true,
            });
            this.formUrlWatchFlag = this.$watch("formUrlBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(val));
            }), {
                deep: true,
            });
            //=========================================================================//
            this.contentTypeWatchFlag = this.$watch("contentType", this.$helper.debounce((contentType) => {
                if (contentType === "application/json") {
                    this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(this.jsonBody));
                } else if (contentType === "application/x-www-form-urlencoded") {
                    this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(this.formUrlBody));
                } else if (contentType === "multipart/form-data") {
                    this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(this.formDataBody));
                } else { //默认按照json进行处理
                    this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(this.jsonBody));
                }
            }), {
                deep: true,
            });
        },
        //选中_select为true的参数
        selectChecked() {
            return new Promise((resolve, reject) => {
                Promise.all([this.$refs.jsonTree?.selectChecked(), this.$refs.formDataTree?.selectChecked(), this.$refs.formUrlTree?.selectChecked()]).then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err)
                })
            })
        },
        //=====================================其他操作=====================================//
        //将json数据转换为参数
        handleConvertJsonToParams(result, convertType) {
            if (convertType === "append") {
                if (this.contentType === "application/json") {
                    result.forEach((val) => {
                        this.jsonBody.unshift(val);
                    })
                } else if (this.contentType === "application/x-www-form-urlencoded") {
                    result.forEach((val) => {
                        this.formUrlBody.unshift(val);
                    })
                } else if (this.contentType === "multipart/form-data") {
                    result.forEach((val) => {
                        this.formDataBody.unshift(val);
                    })
                }
            } else if (convertType === "override") {
                if (this.contentType === "application/json") {
                    this.jsonBody = result;
                } else if (this.contentType === "application/x-www-form-urlencoded") {
                    this.formUrlBody = result;
                } else if (this.contentType === "multipart/form-data") {
                    this.formDataBody = result;
                }
            }
            this.selectChecked();
        },
        //选择模板
        handleSelectPresetParams(template) {
            this.$refs.dropdown.hide();
            let currentLocalData = localStorage.getItem("apidoc/requestBodyTemplate") || "{}";
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
            localStorage.setItem("apidoc/requestBodyTemplate", JSON.stringify(currentLocalData));

            const preParams = template.items.filter((val) => val.key !== "" && val.value !== "");
            for (let i = 0, len = preParams.length; i < len; i += 1) {
                const element = preParams[i];
                const isComplex = element.type !== "object" && element.type !== "array";
                if (isComplex && (element.key === "" || element.value === "")) { //对象，array不校验key和value
                    continue;
                }
                if (!this.requestBody.find((val) => val.key === element.key)) {
                    if (this.contentType === "application/json") {
                        this.jsonBody.unshift(element);
                    } else if (this.contentType === "application/x-www-form-urlencoded") {
                        this.formUrlBody.unshift(element);
                    } else if (this.contentType === "multipart/form-data") {
                        this.formDataBody.unshift(element);
                    }
                    this.selectChecked()
                }
            }
        },
        //每次选择都增加当前选中模板的权重
        freshLocalUsefulParams() {
            let currentLocalData = localStorage.getItem("apidoc/requestBodyTemplate") || "{}";
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
    },
};
</script>

<style lang="scss">
// .body-params {
//     .operation {
//         height: size(30);
//         padding: 0 size(20);
//         width: 100%;
//         display: flex;
//         align-items: center;
//         justify-content: flex-end;
//         color: $gray-300;
//     }
// }
</style>
