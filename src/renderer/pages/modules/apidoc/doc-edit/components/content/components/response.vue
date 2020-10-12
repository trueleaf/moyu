/*
    创建者：shuxiaokai
    创建时间：2020-07-10 20:13
    模块名称：请求返回信息
    备注：xxxx
*/
<template>
    <div class="response">
        <s-collapse title="基本信息" class="baseInfo">
            <div>
                <div class="my-2 d-flex a-center">
                    <span class="flex0">请求地址：</span>
                    <div v-copy="requestData.url.host" v-copy2="requestData.url.host + requestData.url.path" title="鼠标左键右键拷贝内容不一样">
                        <s-ellipsis-content class="cursor-pointer" :value="requestData.url.host + requestData.url.path" max-width="100%"></s-ellipsis-content>
                    </div>
                </div>
                <div class="my-2">
                    <span>请求方式：</span>
                    <span class="f-xs green">{{ requestData.methods.toUpperCase() }}</span>
                </div>
                <div class="d-flex mb-1">
                    <div class="flex0">
                        <span>连通&nbsp;</span>
                        <span v-if="currentCondition.connected === -1" class="gray-600 el-icon-question"></span>
                        <span v-else-if="currentCondition.connected === 0" class="red el-icon-error"></span>
                        <span v-else-if="currentCondition.connected === 1" class="green el-icon-success"></span>
                        <span class="mx-1 gray-400">|</span>
                    </div>
                    <div class="flex0" :title="currentCondition.status">
                        <span>状态码&nbsp;</span>
                        <span v-if="currentCondition.status === -1" class="gray-600 el-icon-question"></span>
                        <span v-else-if="currentCondition.status >= 200 && currentCondition.status < 300" class="green el-icon-success"></span>
                        <span v-else class="red el-icon-error"></span>
                        <span class="mx-1 gray-400">|</span>
                    </div>
                    <div class="flex0" :title="`不超过10kb,当前${currentCondition.size}kb`">
                        <span>大小&nbsp;</span>
                        <span v-if="currentCondition.size === 0" class="gray-600 el-icon-question"></span>
                        <span v-else-if="currentCondition.size >= 10" class="red el-icon-error"></span>
                        <span v-else class="green el-icon-success"></span>
                        <span class="mx-1 gray-400">|</span>
                    </div>
                    <!-- <div class="flex0">
                        <span>本地参数&nbsp;</span>
                        <span v-if="currentCondition.localParams === -1" class="gray-600 el-icon-question"></span>
                        <span v-else-if="currentCondition.localParams === 0" class="red el-icon-error"></span>
                        <span v-else class="green el-icon-success"></span>
                        <span class="mx-1 gray-400">|</span>
                    </div> -->
                    <div class="flex0" :title="`${currentCondition.responseErrorType}`">
                        <span>返回参数&nbsp;</span>
                        <span v-if="currentCondition.remoteResponse === -1" class="gray-600 el-icon-question"></span>
                        <span v-else-if="currentCondition.remoteResponse === 0" class="red el-icon-error"></span>
                        <span v-else class="green el-icon-success"></span>
                        <span class="mx-1 gray-400">|</span>
                    </div>
                </div>
            </div>
        </s-collapse>
        <s-collapse title="请求头">
            <template v-if="requestData.header.length > 1">
                <template v-for="(item, index) in requestData.header">
                    <div v-if="item.key" class="d-flex a-center mt" :key="index">
                        <span v-if="item.key" class="flex0">{{ item.key }}：</span>
                        <s-ellipsis-content :value="convertVariable(item.value)" :max-width="300" copy></s-ellipsis-content>
                    </div>                    
                </template>
            </template>
            <div v-else class="f-xs gray-500">暂无数据</div>
        </s-collapse>
        <s-collapse title="请求参数" :active="false">
            <s-tree-json :data="requestParams"></s-tree-json>
        </s-collapse>
        <s-collapse title="响应参数" :active="false">
            <s-tree-json :data="requestData.responseParams"></s-tree-json>
        </s-collapse>
        <s-collapse title="远程结果">
            <div v-if="responseData" class="f-xs d-flex j-end mb-2">
                <div>
                    <span>Status：</span>
                    <span v-if="responseData.status >= 200 && responseData.status <= 299" class="green">{{ responseData.status }}</span>
                    <span v-else-if="responseData.status >= 300 && responseData.status <= 399" class="yellow">{{ responseData.status }}</span>
                    <span v-else-if="responseData.status >= 400 && responseData.status <= 599" class="red">{{ responseData.status }}</span>
                </div>
                <div class="mx-2">
                    <span>Time：</span>
                    <span v-if="responseData.rt >= 0 && responseData.rt <= 2000" class="green">{{ responseData.rt }}ms</span>
                    <span v-else class="red">{{ responseData.rt }}ms</span>
                </div>
                <div>
                    <span>Size：</span>
                    <span v-if="responseData.size >= 0 && responseData.size <= 10" class="green">{{ responseData.size }}kb</span>
                    <span v-else class="red">{{ responseData.size }}kb</span>
                </div>
            </div>
            <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)">
                <s-json v-if="responseData && responseData.contentType.includes('application/json')" :data="responseData.data" :check-data="checkJsonData" @export="handleExport"></s-json>
                <span v-else-if="responseData && responseData.contentType.includes('image/svg+xml')" v-html="responseData.data"></span>
                <img v-else-if="responseData && responseData.contentType.includes('image/')" :src="responseData.data" alt="无法显示">
                <pre v-else-if="responseData && responseData.contentType.includes('text/')" v-text="responseData.data" class="res-text"></pre>
                <iframe v-else-if="responseData && responseData.contentType.includes('application/pdf/')" :src="responseData.data" class="res-pdf"></iframe>
                <pre v-else-if="responseData && responseData.contentType === 'error'">{{ responseData.data }}</pre>
                <pre v-else>{{ responseData }}</pre>
            </div>
            <!-- <s-json v-if="responseData" :data="responseData.headers"></s-json> -->
        </s-collapse>
        <s-collapse title="返回头">
            <pre v-if="responseData">{{ responseData.headers }}</pre>
        </s-collapse>
    </div>
</template>

<script>
import FileType from "file-type/browser";
import querystring from "querystring"
import { dfsForest } from "@/lib/index"
import uuid from "uuid/v4"
import HttpClient from "@/api/net.js"
const httpClient = new HttpClient();
export default {
    components: {},
    props: {
        requestData: {
            type: Object,
            default() {
                return {};
            }
        },
    },
    computed: {
        //返回参数(对象类型)
        responseParams() {
            const copyData = JSON.parse(JSON.stringify(this.requestData.responseParams)); //扁平数据拷贝
            const result = this.convertPlainParamsToTreeData(copyData);
            return result;
        },
        requestParams() {
            const copyData = JSON.parse(JSON.stringify(this.requestData.requestParams)); //扁平数据拷贝
            dfsForest(copyData, {
                rCondition(value) {
                    return value ? value.children : null;
                },
                rKey: "children",
                hooks: (val, i, forestData, parent) => {
                    if (val && !val._select) {
                        if (!parent) {
                            copyData.splice(i, 1);
                        } else {
                            parent.children.splice(i, 1);
                        }
                    }
                }
            });
            return copyData;
        },
        //预发布满足提交的条件
        currentCondition() {
            return this.$store.state.apidocRules.currentCondition
        },
        //当前选中的doc
        currentSelectDoc() { 
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        //全局变量
        variables() {
            return this.$store.state.apidoc.variables || [];
        },
        // //发送请求---取消请求 文案
        // sendText() {

        // }
       
    },
    watch: {
        currentSelectDoc: {
            handler(val) {
                if (val) {
                    this.responseData = null;
                }
            },
            deep: true
        }
    },
    data() {
        return {
            responseData: null, //---返回结果对象
            checkJsonData: {}, //--用于对比本地书写的返回参数与实际返回参数
            loading: false, //-------返回结果加载状态
            sendText: "发送请求"
        };
    },
    created() {

    },
    methods: {
        //=====================================发送请求====================================//
        sendRequest() {
            return new Promise((resolve, reject) => {
                this.loading = true;
                const requestInfo = this.formatRequestParams();
                const urllibOptions = this.formatUrllibOptions(requestInfo);
                console.log("请求参数", urllibOptions)
                httpClient.request(requestInfo.url, {
                    method: urllibOptions.method,
                    headers: urllibOptions.headers,
                    data: urllibOptions.data
                }).then(response => {
                    console.log(response);
                    this.responseData = {};
                    this.responseData.headers = response.headers;
                    this.responseData.rt = response.rt;
                    this.responseData.size = (response.size / 1024).toFixed(2);
                    this.responseData.status = response.status;
                    this.responseData.contentType = response.contentType;
                    this.responseData.cookie = response.headers["set-cookie"];
                    this.responseData.data = response.data;
                    this.currentCondition.connected = 1; //连通
                    this.currentCondition.status = this.responseData.status;
                    this.currentCondition.size = this.responseData.size;
                    this.checkResponseParams()
                    resolve(response);
                }).catch(err => {
                    console.error(err);
                    this.responseData = {};
                    this.responseData.contentType = "error";
                    this.responseData.data = err;
                    this.currentCondition.connected = 0; //未连通
                    reject(err)
                }).finally(() => {
                    this.loading = false;
                });
            })
        },
        stopRequest() {
            this.responseData = {};
            this.responseData.contentType = "error";
            this.responseData.data = "请求取消!";
            httpClient.stopReqeust();
            this.loading = false;
        },
        //格式化请求参数
        formatRequestParams() {
            const copyRequestData = JSON.parse(JSON.stringify(this.requestData)); //扁平数据拷贝
            const requestParams = this.convertPlainParamsToTreeData(copyRequestData.requestParams, true); //请求参数
            const headerParams = this.convertPlainParamsToTreeData(copyRequestData.header); //请求头
            const requestInfo = {
                method: copyRequestData.methods.toLowerCase(),
                url: copyRequestData.url.host + copyRequestData.url.path,
                headers: headerParams,
                contentType: copyRequestData.requestType,
                requestParams 
            };
            return requestInfo;
        },
        //格式化urllib配置信息
        formatUrllibOptions(requestInfo) {
            const contentType = requestInfo.contentType; //query json formData x-www-form-urlencoded
            const requestOptions = {};
            /*eslint-disable indent*/ 
            switch (contentType) {
                case "query":
                    requestOptions.method = requestInfo.method;
                    requestOptions.data = requestInfo.requestParams;
                    // requestOptions.contentType = requestInfo.contentType;
                    requestOptions.headers = requestInfo.headers;
                    break;
                case "json":
                    requestOptions.method = requestInfo.method;
                    requestOptions.data = requestInfo.requestParams;
                    requestOptions.contentType = requestInfo.contentType;
                    requestOptions.headers = requestInfo.headers;
                    break;
                case "formData":
                    requestOptions.method = requestInfo.method;
                    requestOptions.data = requestInfo.requestParams;
                    requestOptions.contentType = requestInfo.contentType;
                    requestOptions.headers = requestInfo.headers;
                    break;
                case "x-www-form-urlencoded":
                    requestOptions.method = requestInfo.method;
                    requestOptions.data = requestInfo.requestParams;
                    requestOptions.contentType = requestInfo.contentType;
                    requestOptions.headers = requestInfo.headers;
                    break;
                default:
                    requestOptions.method = requestInfo.method;
                    requestOptions.data = requestInfo.requestParams;
                    requestOptions.contentType = requestInfo.contentType;
                    requestOptions.headers = requestInfo.headers;
                    break;
            }
            return requestOptions
        },
        //格式化返回参数
        formatResponseData(response) {
            let result = null;
            if (response.headers["content-type"].includes("application/json")) { //常规json格式
                result = JSON.parse(response.data.toString());
            } else if (response.headers["content-type"].includes("image/svg+xml")) { //svg格式，一般为验证码
                result = response.data.toString();
            } else if (response.headers["content-type"].includes("text/")) {
                result = response.data.toString();
            } else if (response.headers["content-type"].includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
                const contentDisposition = response.headers["content-disposition"];
                const fileInfo = contentDisposition ? contentDisposition.match(/filename=([^=]+)/) : null;
                const fileName = fileInfo ? fileInfo[1] : "";
                const arrayData = response.data
                const ab = new ArrayBuffer(arrayData.length);
                const view = new Uint8Array(ab);
                for (var i = 0; i < arrayData.length; ++i) {
                    view[i] = arrayData[i];
                }
                result = new Blob([view], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                this.blobDownload(result, fileName);
            }
            return result;
        },
        //=====================================组件间交互====================================//  
        //将扁平数据转换为树形结构数据
        convertPlainParamsToTreeData(plainData, jumpChecked) {
            const result = {};
            const foo = (plainData, result) => {
                for(let i = 0,len = plainData.length; i < len; i++) {
                    if (jumpChecked && !plainData[i]._select) { //若请求参数未选中则不发送请求
                        continue;
                    }
                    const key = plainData[i].key.trim();
                    const value = this.convertVariable(plainData[i].value);
                    const type = plainData[i].type;
                    const resultIsArray = Array.isArray(result);
                    const isComplex = (type === "object" || type === "array");
                    let arrTypeResultLength = 0; //数组类型值长度，用于数组里面嵌套对象时候对象取值
                    if (!isComplex && (key === "" || value === "")) { //非复杂数据需要填写参数名称才可以显示
                        continue
                    }
                    /*eslint-disable indent*/ 
                    switch (type) {
                        case "number": //数字类型需要转换为数字，转换前所有值都为字符串
                            resultIsArray ? result.push(Number(value)) : result[key] = Number(value);
                            break;
                        case "boolean": //字符串类型不做处理
                            resultIsArray ? result.push(result[key] = (value === "true" ? true : false)) : (result[key] = (value === "true" ? true : false));
                            break;
                        case "object":
                            resultIsArray ? (arrTypeResultLength = result.push({})) : (result[key] = {});
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                foo(plainData[i].children, resultIsArray ? (result[arrTypeResultLength - 1]) : result[key]);
                            }
                            break;
                        case "array":
                            result[key] = [];
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                foo(plainData[i].children, result[key]);
                            }
                            break;
                        default: //字符串或其他类型类型不做处理
                            resultIsArray ? result.push(value) : (result[key] = value);
                            break;
                    }
                }
            }
            foo(plainData, result);
            return result;
        },
        //将扁平数据转换为树形结构字符串数据
        convertPlainParamsToStringTreeData(plainData, jumpChecked) {
            const result = {
                str: ""
            };
            const createIndent = (level) => { //缩进级别
                const indent = 4;
                return " ".repeat(level * indent);
            }; 
            const createDash = (length) => { //创建短横线
                if (length < 0) length = 0; 
                return "-".repeat(length);
            }; 

            const foo = (plainData, level, inArray) => {
                let resultStr = "";
                for(let i = 0,len = plainData.length; i < len; i++) {
                    if (jumpChecked && !plainData[i]._select) { //若请求参数未选中则不发送请求
                        continue; 
                    }
                    const key = plainData[i].key.toString().trim();
                    let value = plainData[i].value;
                    const type = plainData[i].type;
                    const desc = plainData[i].description;
                    const required = plainData[i].required;
                    const isComplex = (type === "object" || type === "array");
                    // if (isComplex && key === "") { //复杂数据必须填写参数名称
                    //     continue;
                    // }
                    if (!isComplex && (value === "")) { //非复杂数据需要填写参数名称才可以显示
                        continue
                    }
                    /*eslint-disable indent*/ 
                    switch (type) {
                        case "number": { //数字类型需要转换为数字，转换前所有值都为字符串
                            const keyLength = inArray ? -2 : key.length; //-2是两个"占据的位置
                            const currentLength = 40 - level * 4 - 3 - keyLength - value.length;
                            resultStr += `${createIndent(level)}${inArray ? "" : key + ": "}${Number(value)}, //${createDash(currentLength)}${desc || ""}${required ? " (必填)" : ""}\n`;
                            result.str += `${createIndent(level)}${inArray ? "" : key + ": "}${Number(value)}, //${createDash(currentLength)}${desc || ""}${required ? " (必填)" : ""}\n`;
                            break;
                        }
                        case "boolean": {
                            const keyLength = inArray ? -2 : key.length; //-2是两个"占据的位置
                            const currentLength = 40 - level * 4 - 3 - keyLength - value.length;
                            resultStr += `${createIndent(level)}${inArray ? "" : key + ": "}${value}, //${createDash(currentLength)}${desc || ""}${required ? " (必填)" : ""}\n`;
                            result.str += `${createIndent(level)}${inArray ? "" : key + ": "}${value}, //${createDash(currentLength)}${desc || ""}${required ? " (必填)" : ""}\n`;
                            break;                            
                        }
                        case "object": {
                            const keyLength = inArray ? -2 : key.length; //-2是两个"占据的位置
                            const currentLength = 40 - level * 4 - 3 - keyLength;
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                if (level === 0) {
                                    result.str += `${createIndent(level)}${inArray ? "" : key + ": "}{ //${createDash(currentLength)}${desc || ""}\n${foo(plainData[i].children, level + 1, false)}}`;
                                } else {
                                    resultStr = `${createIndent(level)}${inArray ? "" : key + ": "}{ //${createDash(currentLength)}${desc || ""}\n${foo(plainData[i].children, level + 1, false)}${createIndent(level)}}\n`;
                                }
                            } else {
                                if (level === 0) {
                                    result.str += `${createIndent(level)}${inArray ? "" : key + ": "}{ //${createDash(currentLength)}${desc || ""}\n}, \n`;
                                } else {
                                    resultStr = `${createIndent(level)}${inArray ? "" : key + ": "}{ //${createDash(currentLength)}${desc || ""}\n}, \n`;
                                }
                            }
                            break;                            
                        }
                        case "array": {
                            const currentLength = 40 - level * 4 - 3 - key.length;
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                if (level === 0) {
                                    result.str += `${createIndent(level)}${key}: [ //${createDash(currentLength)}${desc || ""}\n${foo(plainData[i].children, level + 1, true)}]`;
                                } else {
                                    resultStr = `${createIndent(level)}${key}: [ //${createDash(currentLength)}${desc || ""}\n${foo(plainData[i].children, level + 1, true)}${createIndent(level)}]\n`;
                                }
                            } else {
                                if (level === 0) {
                                    result.str += `${createIndent(level)}${key}: [ //${createDash(currentLength)}${desc || ""}\n], \n`;
                                } else {
                                    resultStr = `${createIndent(level)}${key}: [ //${createDash(currentLength)}${desc || ""}\n], \n`;
                                }
                            }
                            break;                            
                        }
                        default: { //字符串或其他类型类型不做处理
                            const keyLength = inArray ? -2 : key.length; //-2是两个"占据的位置
                            let currentLength = 0;
                            if (value && value.length > 15) { //字符串长度超过15个字符的做截取操作
                                value = value.slice(0, 15) + "...";
                                currentLength = 40 - level * 4 - 3 - keyLength - value.length - 2;
                            } else {
                                currentLength = 40 - level * 4 - 3 - keyLength - value.length - 2;
                            }
                            resultStr += `${createIndent(level)}${inArray ? "" : key + ": "}"${value}", //${createDash(currentLength)}${desc || ""}${required ? " (必填)" : ""}\n`;
                            result.str += `${createIndent(level)}${inArray ? "" : key + ": "}"${value}", //${createDash(currentLength)}${desc || ""}${required ? " (必填)" : ""}\n`;
                            break;
                        }
                    }
                }
                return resultStr;
            }
            foo(plainData, 0, false);
            return result;
        },
        //导出数据
        handleExport(data) {
            const copyData =JSON.parse(JSON.stringify(data))
            dfsForest(copyData, {
                rCondition(value) {
                    return value.children;
                },
                rKey: "children",
                hooks: (val) => {
                    val.description || (this.$set(val, "description", ""))
                    Object.assign(val, {
                        id: uuid(),
                        required: true, //-------是否必填
                    })
                }
            });
            copyData.push(this.generateParams());
            this.requestData.responseParams = copyData
            // console.log(copyData)
        },
        //检查返回值与响应参数是否一致
        checkResponseParams() {
            if (this.responseData.headers["content-type"].includes("application/json")) {
                const remoteParams = this.responseData.data;
                const localParams = this.responseParams;
                this.checkJsonData = localParams;
                let responseErrorType = null;
                const hasOwn = Object.hasOwnProperty;
                if (Object.keys(localParams).length === 0) {
                    responseErrorType = "lackKey"
                }
                const foo = (localData, remoteData) => {
                    for (let i in localData) { //不处理原型链上的数据
                        if (!hasOwn.call(localData, i)) {
                            continue;
                        }
                        // console.log(remoteData)
                        const remoteKeys = Object.keys(remoteData); //-----远程keys
                        const localKeys = Object.keys(localData); //-------本地keys
                        const isLackKey = localKeys.some(val => !remoteKeys.includes(val)); //远程结果是否缺少对应字段
                        const isTooMuchKey = !remoteKeys.every(val => localKeys.includes(val)); //远程结果是否超出字段
                        //字段超出或者缺少判断
                        if (isLackKey) {
                            responseErrorType = "lackKey";
                            return;
                        }   
                        if (isTooMuchKey) {
                            responseErrorType = "tooMuchKey"
                            return
                        }
                        //判断字段类型是否一致
                        const localValue = localData[i];
                        const remoteValue = remoteData[i];
                        const localType = this.getType(localValue);
                        const remoteType = this.getType(remoteValue);
                        if (localType !== remoteType) {
                            responseErrorType = "typeError"
                            return
                        }
                        if (localType === "object") {
                            foo(localValue, remoteValue);
                        }
                        if (localType === "array" && remoteValue[0]) {
                            console.log(remoteValue, remoteValue[0], 999)
                            foo(localValue[0], remoteValue[0]);
                        }
                    }                    
                }
                foo(localParams, remoteParams);
                if (responseErrorType) {
                    this.$store.commit("apidocRules/changeCurrentCondition", {
                        remoteResponse: 0, 
                        responseErrorType, 
                    })
                } else {
                    this.$store.commit("apidocRules/changeCurrentCondition", {
                        remoteResponse: 1, 
                    })
                }
            }
        },
        //=====================================其他操作=====================================//
        convertVariable(val) {
            if (val == null) {
                return;
            }
            const matchedData = val.toString().match(/{{\s*(\w+)\s*}}/);
            if (val && matchedData) {
                const varInfo = this.variables.find(v => {
                    return v.name === matchedData[1];
                });
                if (varInfo) {
                    return val.replace(/{{\s*(\w+)\s*}}/, varInfo.value);
                } else {
                    return val;
                }
            } else {
                return val;
            }
        },
        //获取参数类型
        getType(value) {
            // console.log(value, 999)
            if (typeof value === "string") {
                return "string"
            } else if (typeof value === "number") { //NaN
                return "number"
            } else if (typeof value === "boolean") {
                return "boolean"
            } else if (Array.isArray(value)) {
                return "array"
            } else if (typeof value === "object" && value !== null) {
                return "object"
            } else { // null undefined ...
                return "string"
            }
        },
        //生成请求数据
        generateParams(type = "string") {
            return {
                id: uuid(),
                key: "",
                description: "",
                type: type,
                value: "",
                required: true,
            }
        },
    }
};
</script>



<style lang="scss">
.response {
    height: calc(100vh - 120px);
    overflow-y: auto;
    .baseInfo {
        position: sticky;
        top: 0;
        background: $white;
        z-index: 1;
        box-shadow: $box-shadow-sm;
        padding-bottom: size(10);
    }
    .res-data {
        min-height: size(100);
        max-height: size(300);
    }
    .res-text {
        width: 100%;
        max-height: size(300);
        overflow: auto;
    }
    .res-pdf {
        width: 100%;
        height: size(300);
    }
}
</style>
