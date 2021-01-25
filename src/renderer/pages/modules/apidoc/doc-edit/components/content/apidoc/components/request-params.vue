/*
    创建者：shuxiaokai
    创建时间：2020-10-19 15:05
    模块名称：请求参数
    备注：xxxx
*/
<template>
    <s-collapse-card title="请求参数" class="request-params" ref="collapse">
        <s-params-tree 
            ref="paramsTree"
            :tree-data="request.requestParams"
            :nest="request.requestType === 'json'"
            :enable-form-data="request.requestType === 'formData'"
            :mind-params="mindParams.mindRequestParams"
            showCheckbox
        >
        </s-params-tree>
        <div slot="operation" class="operation">
            <!-- json转换 -->
            <div class="cursor-pointer hover-theme-color mr-3" @click.stop="dialogVisible = true">
                <el-popover placement="top-start" width="200" trigger="hover" content="将json格式数据转换为请求或者返回参数，之前保存过的参数描述也会同时被转化">
                    <span slot="reference">
                        <span>json转换</span>
                        <i class="el-icon-warning theme-color"></i>
                    </span>
                </el-popover>
            </div>
            <!-- 模板选择 -->
            <div class="cursor-pointer hover-theme-color mr-3">
                <el-dropdown ref="dropdown" trigger="click" :show-timeout="0" @command="handleSelectPresetParams">
                    <div @click.stop.prevent="freshLocalUsefulParams">
                        <el-popover placement="top-start" width="200" trigger="hover" content="应用一段常用的请求或者返回参数">
                            <span slot="reference">
                                <span class="cursor-pointer hover-theme-color">应用模板</span>
                                <i class="el-icon-warning theme-color"></i>
                            </span>
                        </el-popover>                                
                    </div>
                    <div slot="dropdown">
                        <el-dropdown-menu>
                            <div class="manage-params">
                                <div class="cyan mb-2">常用</div>
                                <template v-for="(item, index) in usefulPresetRequestParamsList.slice(0, 3)">
                                    <span class="params-item" :key="index" @click="handleSelectPresetParams(item)">{{ item.name }}</span>
                                </template>
                                <span class="theme-color cursor-pointer ml-2" @click="dialogVisible2 = true">维护</span>
                                <hr>
                            </div>
                            <el-dropdown-item v-for="(item, index) in presetParamsList" :key="index" :command="item">
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
            <div class="cursor-pointer hover-theme-color mr-3" @click="dialogVisible3 = true">
                <el-popover placement="top-start" width="200" trigger="hover" content="将当前请求或者返回参数保存为模板">
                    <span slot="reference">
                        <span>保存为模板</span>
                        <i class="el-icon-warning theme-color"></i>
                    </span>
                </el-popover>
            </div>
        </div>
        <s-json-schema :visible.sync="dialogVisible" :plain="request.methods === 'get'" @success="handleConvertJsonToParams"></s-json-schema>
        <s-preset-params :visible.sync="dialogVisible2" @change="getPresetParams"></s-preset-params>
        <s-save-preset-params-as-template type="request" :template-params="request.requestParams" :visible.sync="dialogVisible3" @success="getPresetParams"></s-save-preset-params-as-template>
    </s-collapse-card>
</template>

<script>
import jsonSchema from "../dialog/json-schema"
import presetParams from "../dialog/preset-params"
import savePresetParamsTemplate from "../dialog/preset-params-temp"
export default {
    name: "REQUEST_PARAMS",
    components: {
        "s-json-schema": jsonSchema,
        "s-preset-params": presetParams,
        "s-save-preset-params-as-template": savePresetParamsTemplate,
    },
    props: {
        request: { //---------------请求参数
            type: Object,
            default() {
                return {}
            }
        },
        dataReady: { //------------数据是否请求完毕
            type: Boolean,
            default: false
        }
    },
    computed: {
        mindParams() { //----------联想参数
            return this.$store.state.apidoc.mindParams;
        },
        presetParamsList() { //----预设参数列表
            const allTemplateList = this.$store.state.apidoc.presetParamsList;
            return allTemplateList.filter((val) => val.presetParamsType === "request");
        },
    },
    watch: {
        "$store.state.apidoc.paramsValid"(val) {
            if (!val) {
                this.$refs["collapse"].expand();
            }
        }
    },
    data() {
        return {
            //=========================================================================//
            formInfo: {}, //保存当前参数为模板
            usefulPresetRequestParamsList: [], //常用预设请求参数
            //=====================================其他参数====================================//
            dialogVisible: false, //json转换弹窗
            dialogVisible2: false, //常用参数维护
            dialogVisible3: false, //保存参数为模板
            loading: false, //保存为模板
        };
    },
    created() {
        this.freshLocalUsefulParams();
    },
    methods: {
        selectAll() {
            return new Promise((resolve, reject) => {
                this.$refs["paramsTree"].selectAll().then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err)
                });
            })
        },
        selectChecked() {
            return new Promise((resolve, reject) => {
                this.$refs["paramsTree"].selectChecked().then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err)
                });
            })
        },
        //=====================================数据请求====================================//
        //获取预设参数
        getPresetParams() {
            this.$store.dispatch("apidoc/getPresetParams", {
                projectId: this.$route.query.id,
            });
        },
        //将json转换为标准请求格式
        handleConvertJsonToParams(params) {
            params.forEach((val) => {
                const matchMindParams = this.mindParams.mindRequestParams.find(p => p.key === val.key)
                if (matchMindParams) {
                    val.description = matchMindParams.description;
                }
            })
            this.request.requestParams = params;
            this.selectChecked();
        },
        //刷新本地快捷参数
        freshLocalUsefulParams() {
            let currentLocalData = localStorage.getItem("pages/presetParams/request") || "{}";
            currentLocalData = JSON.parse(currentLocalData);
            currentLocalData = currentLocalData[this.$route.query.id] || [];
            this.usefulPresetRequestParamsList = currentLocalData.sort((a, b) => {
                return a.selectNum - b.selectNum > 0
            }).slice(0, 3)
        },
        //选择预设参数
        handleSelectPresetParams(template) {
            this.$refs["dropdown"].hide();
            let currentLocalData = localStorage.getItem("pages/presetParams/request") || "{}";
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
                findDoc.selectNum ++;                
            }
            localStorage.setItem("pages/presetParams/request", JSON.stringify(currentLocalData))
            const preParams = template.items.filter((val) => val.key !== "" && val.value !== "");
            const reqParams = this.request.requestParams;
            for(let i = 0, len = preParams.length; i < len; i++) {
                const element = preParams[i];
                if ((element.type !== "object" && element.type !== "array") && (element.key === "" || element.value === "")) { //对象，array不校验key和value
                    console.log(222, element.type, element.key, element.value)
                    continue;
                }
                if (!reqParams.find((val) => val.key === element.key)) {
                    element.id = element._id;
                    reqParams.unshift(element);
                    this.$refs["requestParams"].selectAll()
                }
            }
        },
    }
};
</script>



<style lang="scss">
.request-params {
    .operation {    
        display: flex;
        align-items: center;
        margin-left: size(20);
    }
}
.manage-params {
    width: size(350);
    position: sticky;
    top: 0;
    background: $white;
    padding: size(10) size(15) 0;
    .manage-config {
        padding: size(0) size(10);
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: size(30);
        background: $theme-color;        
    }
    .manage-ipt {
        display: flex;
        align-items: center;
        border-top: 1px dashed $gray-400;
        margin-top: size(10);
        input {
            flex: 1;
            height: size(30);
            line-height: size(30);
            border: none;
            text-indent: 1em;
            border-right: 1px solid $gray-400;
        }       
    }
    .params-item {
        display: inline-block;
        padding: size(2) size(10);
        cursor: pointer;
        background: $gray-200;
        margin-left: size(10);
        &:hover {
            background: $gray-300;
        }

    }
}
</style>
