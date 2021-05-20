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
                                    <span :key="index" class="params-item" @click="handleSelectPresetParams(item)">{{ item.name }}</span>
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
            <el-popover v-if="bodyType === 'application/json'" placement="right">
                <s-array-view :data="jsonBody" class="w-500px mt-2">
                    <div slot="header" v-copy="jsonBodyParams" class="cursor-pointer">复制为json</div>
                </s-array-view>
                <div slot="reference" class="cursor-pointer hover-theme-color mr-3">
                    <span>预览参数</span>
                </div>
            </el-popover>
        </div>
        <div class="d-flex a-center j-center py-2">
            <el-radio-group v-model="bodyType">
                <el-radio label="application/json" :disabled="!enabledContenType.find((ct) => ct === 'json')">json</el-radio>
                <el-radio label="multipart/form-data" :disabled="!enabledContenType.find((ct) => ct === 'formData')">form-data</el-radio>
                <el-radio label="application/x-www-form-urlencoded" :disabled="!enabledContenType.find((ct) => ct === 'x-www-form-urlencoded')">x-www-form-urlencoded</el-radio>
                <el-radio
                    label="raw"
                    :disabled="!enabledContenType.find((ct) => ct === 'text/plain' || ct === 'text/html' || ct === 'application/xml')"
                >
                    raw
                </el-radio>
                <el-radio label="none">none</el-radio>
            </el-radio-group>
        </div>
        <!-- json -->
        <s-params-tree
            v-show="bodyType === 'application/json'"
            ref="jsonTree"
            :tree-data="jsonBody"
            nest
            :mind-params="mindParams.requestBody"
            show-checkbox
        >
        </s-params-tree>
        <!-- form-data -->
        <s-params-tree
            v-show="bodyType === 'multipart/form-data'"
            ref="formDataTree"
            :tree-data="formDataBody"
            :nest="false"
            :mind-params="mindParams.requestBody"
            enable-form-data
            show-checkbox
        >
        </s-params-tree>
        <!-- x-www-form-urlencoded -->
        <s-params-tree
            v-show="bodyType === 'application/x-www-form-urlencoded'"
            ref="formUrlTree"
            :tree-data="formUrlBody"
            :nest="false"
            :mind-params="mindParams.requestBody"
            show-checkbox
        >
        </s-params-tree>
        <div v-if="bodyType === 'raw'" class="raw">
            <s-code-editor ref="editor" :type="rawType" @input="handleRawInput"></s-code-editor>
            <div class="raw-type">
                <el-select v-model="rawType" size="mini" @change="handleChangeRawType">
                    <el-option :disabled="!enabledContenType.find((ct) => ct === 'text/plain')" label="text" value="text"></el-option>
                    <el-option :disabled="!enabledContenType.find((ct) => ct === 'text/html')" label="html" value="html"></el-option>
                    <el-option :disabled="!enabledContenType.find((ct) => ct === 'application/xml')" label="xml" value="xml"></el-option>
                </el-select>
            </div>
        </div>
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
    name: "RequestBody",
    components: {
        "s-json-schema": jsonSchema,
        "s-params-template": paramsTemplate,
    },
    mixins: [mixin],
    data() {
        return {
            usefulPresetParamsList: [], //常用参数模板
            //=========================================================================//
            jsonBody: [], //application/json
            formDataBody: [], //multipart/form-data
            formUrlBody: [], //application/x-www-form-urlencoded
            rawBody: "", //raw
            //=====================================其他参数====================================//
            contentTypeWatchFlag: null, //内容区域watch
            jsonWatchFlag: null, //watch标识用于清空数据
            formDataWatchFlag: null, //watch标识用于清空数据
            formUrlWatchFlag: null, //watch标识用于清空数据
            rawType: "",
            bodyType: "",
            //=====================================其他参数====================================//
            debounceFn: null, //节流函数实例
            dialogVisible: false, //将json转换为请求参数弹窗
            dialogVisible3: false, //保存当前参数为模板
        };
    },
    computed: {
        requestBody() { //请求body
            return this.$store.state.apidoc.apidocInfo?.item?.requestBody;
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
        enabledContenType() {
            const rules = this.$store.state.apidocRules;
            const requestMethod = this.$store.state.apidoc.apidocInfo?.item?.method
            const matchedContentType = rules.requestMethods.find((val) => val.value === requestMethod);
            const enabledContenType = matchedContentType ? matchedContentType.enabledContenType : [];
            return enabledContenType;
        },
        contentType() {
            return this.$store.state.apidoc.apidocInfo?.item?.contentType;
        },
    },
    watch: {
        bodyType: {
            handler(val) {
                this.$refs.jsonTree?.selectChecked();
                this.$refs.formDataTree?.selectChecked();
                this.$refs.formUrlTree?.selectChecked();
                if (val === "raw" && this.rawType === "text") {
                    this.$store.commit("apidoc/changeContentType", "text/plain");
                } else if (val === "raw" && this.rawType === "html") {
                    this.$store.commit("apidoc/changeContentType", "text/html");
                } else if (val === "raw" && this.rawType === "xml") {
                    this.$store.commit("apidoc/changeContentType", "application/xml");
                } else if (val !== "") {
                    this.$store.commit("apidoc/changeContentType", val);
                }
            },
            immediate: true,
        },
    },
    mounted() {
        this.$event.one("apidoc/changeApiDocInfo", () => {
            const contentType = this.$store.state.apidoc.apidocInfo?.item?.contentType;
            if (contentType === "application/json") {
                this.bodyType = "application/json"
            } else if (contentType === "application/x-www-form-urlencoded") {
                this.bodyType = "application/x-www-form-urlencoded"
            } else if (contentType === "multipart/form-data") {
                this.bodyType = "multipart/form-data"
            } else if (contentType === "none") {
                this.bodyType = "none"
            } else {
                this.bodyType = "raw"
            }
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
            if (this.bodyType === "application/json") {
                this.jsonBody = this.$helper.cloneDeep(this.requestBody);
                this.formDataBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
            } else if (this.bodyType === "application/x-www-form-urlencoded") {
                this.formUrlBody = this.$helper.cloneDeep(this.requestBody);
                this.jsonBody = [this.generateProperty()];
                this.formDataBody = [this.generateProperty()];
            } else if (this.bodyType === "multipart/form-data") {
                this.formDataBody = this.$helper.cloneDeep(this.requestBody);
                this.jsonBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
            } else if (this.bodyType === "raw") {
                const jsonProperty = this.generateProperty("object");
                jsonProperty.children = [this.generateProperty()];
                this.formDataBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
                this.jsonBody = [jsonProperty];
                this.rawBody = this.requestBody[0].value;
                this.$nextTick(() => {
                    this.$refs.editor?.setValue(this.rawBody);
                })
                if (this.enabledContenType.find((ct) => ct === "text/plain")) {
                    this.rawType = "text"
                } else if (this.enabledContenType.find((ct) => ct === "text/html")) {
                    this.rawType = "html"
                } else if (this.enabledContenType.find((ct) => ct === "application/xml")) {
                    this.rawType = "xml"
                } else {
                    this.rawType = "text"
                }
            } else {
                const jsonProperty = this.generateProperty("object");
                jsonProperty.children = [this.generateProperty()];
                this.formDataBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
                this.jsonBody = [jsonProperty];
            }
            this.$nextTick(() => {
                this.initWatch();
            })
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
                } else if (this.bodyType === "raw") {
                    this.$refs.editor.setValue(this.rawBody);
                }
            }, 300, true), {
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
        //改变rawType类型
        handleChangeRawType() {
            if (this.rawType === "text") {
                this.$store.commit("apidoc/changeContentType", "text/plain");
            } else if (this.rawType === "html") {
                this.$store.commit("apidoc/changeContentType", "text/html");
            } else if (this.rawType === "xml") {
                this.$store.commit("apidoc/changeContentType", "application/xml");
            }
        },
        //raw类型数据输入处理
        handleRawInput(val) {
            const property = this.generateProperty();
            if (!this.debounceFn) {
                this.debounceFn = this.$helper.debounce((value) => {
                    property.value = value;
                    property.key = this.$store.state.apidoc.apidocInfo?.item?.contentType;
                    property._isRaw = true;
                    this.$store.commit("apidoc/changeRequestBody", [property]);
                    this.rawBody = value;
                })
            }
            this.debounceFn(val);
        },
        //将json数据转换为参数
        handleConvertJsonToParams(result) {
            if (this.bodyType === "application/json") {
                this.jsonBody = result;
            } else if (this.bodyType === "application/x-www-form-urlencoded") {
                const rootParam = result[0];
                const rootType = rootParam.type;
                const childParams = rootParam.children;
                if (rootType === "array" || rootType === "object") {
                    this.formUrlBody = childParams.map((val) => ({
                        ...val,
                        type: "string",
                        children: [],
                    }));
                    this.formUrlBody.push(this.generateProperty())
                } else {
                    const params = [{ ...rootParam, type: "string" }];
                    this.formUrlBody = params;
                    this.formUrlBody.push(this.generateProperty())
                }
            } else if (this.bodyType === "multipart/form-data") {
                const rootParam = result[0];
                const rootType = rootParam.type;
                const childParams = rootParam.children;
                if (rootType === "array" || rootType === "object") {
                    this.formDataBody = childParams.map((val) => ({
                        ...val,
                        type: "string",
                        children: [],
                    }));
                    this.formUrlBody.push(this.generateProperty())
                    this.formDataBody.push(this.generateProperty())
                } else {
                    const params = [{ ...rootParam, type: "string" }];
                    this.formDataBody = params;
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

            if (this.bodyType === "application/json") {
                this.jsonBody = template.item;
            } else if (this.bodyType === "application/x-www-form-urlencoded") {
                this.formUrlBody = template.item;
            } else if (this.bodyType === "multipart/form-data") {
                this.formDataBody = template.item;
            }
            this.selectChecked()
            // const preParams = template.items.filter((val) => val.key !== "" && val.value !== "");
            // for (let i = 0, len = preParams.length; i < len; i += 1) {
            //     const element = preParams[i];
            //     const isComplex = element.type !== "object" && element.type !== "array";
            //     if (isComplex && (element.key === "" || element.value === "")) { //对象，array不校验key和value
            //         continue;
            //     }
            //     if (!this.requestBody.find((val) => val.key === element.key)) {
            //         if (this.bodyType === "application/json") {
            //             this.jsonBody.unshift(element);
            //         } else if (this.bodyType === "application/x-www-form-urlencoded") {
            //             this.formUrlBody.unshift(element);
            //         } else if (this.bodyType === "multipart/form-data") {
            //             this.formDataBody.unshift(element);
            //         }
            //         this.selectChecked()
            //     }
            // }
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
.body-params {
    .raw {
        height: size(300);
        position: relative;
        .raw-type {
            position: absolute;
            right: size(5);
            bottom: size(35);
        }
    }
}
</style>
