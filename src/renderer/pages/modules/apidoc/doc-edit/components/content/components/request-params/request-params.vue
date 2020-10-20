/*
    创建者：shuxiaokai
    创建时间：2020-10-19 15:05
    模块名称：请求参数
    备注：xxxx
*/
<template>
    <s-collapse-card title="请求参数" class="request-params">
        <s-params-tree 
            ref="requestParams"
            :tree-data="request.requestParams"
            :nest="request.requestType !== 'query' && request.requestType !== 'formData'"
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
                <el-dropdown trigger="click" :show-timeout="0" @command="handleSelectRequestPresetParams">
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
                                    <span class="params-item">{{ item.name }}</span>
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
        <s-preset-params :visible.sync="dialogVisible2" @success="getPresetParams"></s-preset-params>
        <s-save-preset-params-as-template :visible.sync="dialogVisible3"></s-save-preset-params-as-template>
    </s-collapse-card>
</template>

<script>
import jsonSchema from "../../dialog/json-schema"
import presetParams from "../../dialog/preset-params"
import savePresetParamsTemplate from "../../dialog/preset-params-temp"
export default {
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
            return allTemplateList.filter(val => val.presetParamsType === "request");
        },
    },
    watch: {
        dataReady(val) {
            if (val) {
                this.$refs["requestParams"].selectAll();
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
        //=====================================数据请求====================================//
        //获取预设参数
        getPresetParams() {
            this.$store.dispatch("apidoc/getPresetParams", {
                projectId: this.$route.query.id,
            });
        },
        //将json转换为标准请求格式
        handleConvertJsonToParams(reqParams) {
            reqParams.forEach(val => {
                const matchMindParams = this.mindParams.mindRequestParams.find(p => p.key === val.key)
                if (matchMindParams) {
                    val.description = matchMindParams.description;
                }
            })
            this.request.requestParams = reqParams;
        },
        //刷新本地快捷参数
        freshLocalUsefulParams() {
            // this.usefulPresetRequestParamsList
        },
        //选择预设参数
        handleSelectRequestPresetParams(template) {
            let currentLocalData = localStorage.getItem("pages/presetParams/request") || "[]";
            currentLocalData = JSON.parse(currentLocalData);
            const findDoc = currentLocalData.find(val => val._id === template._id);
            if (!findDoc) {
                currentLocalData.push(template)
            } else {
                if (!findDoc.selectNum) {
                    findDoc.selectNum = 0;
                }
                findDoc.selectNum ++;                
            }
            localStorage.setItem("pages/presetParams/request", JSON.stringify(currentLocalData))
            const preParams = template.items.filter(val => val.key !== "" && val.value !== "");
            const reqParams = this.request.requestParams;
            for(let i = 0, len = preParams.length; i < len; i++) {
                const element = preParams[i];
                if (element.key === "" || element.value === "") {
                    continue;
                }
                if (!reqParams.find(val => val.key === element.key)) {
                    element.id = element._id;
                    reqParams.unshift(element);
                    this.$refs["requestParams"].selectAll()
                }
            }
        },
        //保存当前参数为模板
        handleAddRequestTemplate() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    const params = {
                        name: this.formInfo.name,
                        presetParamsType: "request",
                        projectId: this.$route.query.id,
                        items: this.request.requestParams,
                    };
                    this.loading5 = true;
                    this.axios.post("/api/project/doc_preset_params", params).then(res => {
                        this.dialogVisible7 = false;
                        this.getPresetEnum();
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        this.loading5 = false;
                    });
                } 
            });
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
</style>
