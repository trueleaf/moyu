/*
    创建者：shuxiaokai
    创建时间：2020-10-13 13:47
    模块名称：请求发送相关
    备注：xxxx
*/
<template>
    <div class="d-flex a-center w-100">
        <!-- 接口 -->
        <div class="d-flex w-100">
            <s-v-input 
                    v-model="request.url.path"
                    :error="request.url.path.trim() === '' && urlInvalid"
                    placeholder="只需要输入接口地址，前面不需要加域名，加了会被忽略"
                    size="small"
                    @blur="formatUrl"
                    @keyup.enter.native.stop="formatUrl"
            >
                <div slot="prepend" class="request-input">
                    <el-select v-model="request.methods" value-key="name" @change="handleChangeRequestMethods">
                        <el-option v-for="(item, index) in docRules.requestMethod.config" :key="index" :value="item" :label="item.name"></el-option>
                    </el-select>
                </div>                        
            </s-v-input>
            <el-button v-if="!loading" type="success" size="small" @click="sendRequest">发送请求</el-button>
            <el-button v-if="loading" type="danger" size="small" @click="stopRequest">取消请求</el-button>
            <el-button :loading="loading2" type="primary" size="small" @click="$emit('saveRequest')">保存接口</el-button>
            <el-button :loading="loading3" type="primary" size="small" @click="$emit('publishRequest')">发布接口</el-button>
            <el-button type="primary" size="small" @click="dialogVisible = true" @close="dialogVisible = false">全局变量</el-button>
            <el-button type="primary" size="small" @click="dialogVisible2 = true" @close="dialogVisible2 = false">内置参数</el-button>
        </div>
        <s-variable-dialog v-if="dialogVisible" :visible.sync="dialogVisible" @change="handleVariableChange"></s-variable-dialog>
        <s-preset-params-dialog :visible.sync="dialogVisible2" @success="getPresetEnum"></s-preset-params-dialog>
    </div>         
</template>

<script>
import variableDialog from "../dialog/variable-manage"
import presetParamsDialog from "../dialog/preset-params"
export default {
    components: {
        "s-variable-dialog": variableDialog,
        "s-preset-params-dialog": presetParamsDialog,
    },
    props: {
        request: { //完整请求参数
            type: Object,
            default: {}
        }
    },
    computed: {
        docRules() { //---------文档规则
            return this.$store.state.apidocRules;
        },
        //全局变量
        variables() {
            return this.$store.state.apidoc.variables || [];
        },
    },
    data() {
        return {
            urlInvalid: false,
            loading: false,
            loading2: false,
            loading3: false,
            dialogVisible: false,
            dialogVisible2: false,
        };
    },
    created() {

    },
    methods: {
        //=====================================发送请求，保存请求，发布请求====================================//
        //发送请求
        sendRequest() {
            this.loading = true;
            const copyRequestInfo =  JSON.parse(JSON.stringify(this.request)); //数据拷贝,防止数据处理过程中改变拷贝请求参数的值
            const requestParams = this.convertPlainParamsToTreeData(copyRequestInfo.requestParams, true); //跳过未选中的参数
            const headerParams = this.convertPlainParamsToTreeData(copyRequestInfo.header);
            console.log(requestParams, headerParams)
            const url = copyRequestInfo.url.host + copyRequestInfo.url.path;
            const method = copyRequestInfo.methods.toLowerCase();
            const headers = headerParams;
            const data = requestParams;
            this.$store.dispatch("apidoc/sendRequest", { url, method, headers, data }).then(res => {
                console.log(res, "res");
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        stopRequest() {
            this.$store.dispatch("apidoc/stopRequest");
        },
        //=====================================数据处理====================================//
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
                    const valueTypeIsArray = Array.isArray(result);
                    const isComplex = (type === "object" || type === "array");
                    let arrTypeResultLength = 0; //数组类型值长度，用于数组里面嵌套对象时候对象取值
                    if (!isComplex && (key === "" || value === "")) { //非复杂数据需要填写参数名称才可以显示
                        continue
                    }
                    /*eslint-disable indent*/ 
                    switch (type) {
                        case "number": //数字类型需要转换为数字，转换前所有值都为字符串
                            valueTypeIsArray ? result.push(Number(value)) : result[key] = Number(value);
                            break;
                        case "boolean": //字符串类型不做处理
                            valueTypeIsArray ? result.push(result[key] = (value === "true" ? true : false)) : (result[key] = (value === "true" ? true : false));
                            break;
                        case "object":
                            valueTypeIsArray ? (arrTypeResultLength = result.push({})) : (result[key] = {});
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                foo(plainData[i].children, valueTypeIsArray ? (result[arrTypeResultLength - 1]) : result[key]);
                            }
                            break;
                        case "array":
                            result[key] = [];
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                foo(plainData[i].children, result[key]);
                            }
                            break;
                        default: //字符串或其他类型类型不做处理
                            valueTypeIsArray ? result.push(value) : (result[key] = value);
                            break;
                    }
                }
            }
            foo(plainData, result);
            return result;
        },
        //将全局变量转换为请求参数
        convertVariable(val) {
            if (val == null) {
                return;
            }
            const matchedData = val.toString().match(/{{\s*(\w+)\s*}}/);
            if (val && matchedData) { //匹配上数据
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
        //=====================================url操作====================================//
        //删除无效请求字符
        formatUrl() {
            this.request.url.path = "/" + this.request.url.path;
            const protocolReg = /(\/?https?:\/\/)?/;
            this.request.url.path = this.request.url.path.replace(protocolReg, ""); //去除掉协议
            const invalidReg = /\/(?!\/)[^#\.?:]+/; //去除无效部分
            const matchedPath = this.request.url.path.match(invalidReg);
            if (matchedPath) {
                this.request.url.path = matchedPath[0];
            }
        },
        getPresetEnum() {},
        //验证请求url格式是否正确
        checkUrlRule() {
            this.urlInvalid = false;
            if (this.request.url.path.trim() === "") { //为空不做处理
                this.urlInvalid = true;
                return;
            }
            if (this.currentReqeustLimit.contentType.length === 1 && this.currentReqeustLimit.contentType[0] === "query") { //contetnType为query的自动将查询参数转换为请求参数
                this.convertQueryToParams();
            }
            this.request.url.path = "/" + this.request.url.path; //在首部添加/方式纯字符串被替换掉
            const whiteListReg = /[^0-9a-zA-Z./:&=?#-_]+/g; //有效的url字符串
            this.request.url.path = this.request.url.path.replace(whiteListReg, ""); //去除白名单以外的无效字符
            const pathReg = /(\/?https?:\/\/)?([a-zA-Z0-9.]+)?(:\d+)?/;
            const queryReg = /\?.*/;
            this.request.url.path = this.request.url.path.replace(pathReg, ""); //去除协议，域名，端口
            this.request.url.path = this.request.url.path.replace(queryReg, "");
            this.request.url.path = this.request.url.path.replace(/#/, ""); //去除#
            this.request.url.path = this.request.url.path.replace(/\/+\d+$/, ""); //去除末尾/3这类restful接口
            this.request.url.path = this.request.url.path.replace(/\/*/, ""); //去除前面多余的/
            const hostHasSlash = this.request.url.host.endsWith("/");
            const pathHasSlash = this.request.url.path.startsWith("/");
            if (hostHasSlash && !pathHasSlash) {
                return
            } else if (!hostHasSlash && pathHasSlash) {
                return
            } else if (!hostHasSlash && !pathHasSlash) {
                this.request.url.path = "/" + this.request.url.path;
            } else if (hostHasSlash && pathHasSlash) {
                this.request.url.path = this.request.url.path.slice(1);
            }
        },
        //将请求url后面查询参数转换为params
        convertQueryToParams() {
            let queryString = this.request.url.path.split("?") || "";
            queryString = queryString ? queryString[1] : "";
            const queryParams = qs.parse(queryString);
            for (const i in queryParams) {
                const reqParams = this.request.requestParams;
                if (!reqParams.find(val => val.key === i)) {
                    this.request.requestParams.unshift({
                        id: uuid(),
                        key: i, //--------------请求参数键
                        value: queryParams[i], //------------请求参数值
                        type: "string", //-------------请求参数值类型
                        description: "", //------描述
                        required: true, //-------是否必填
                        children: [], //---------子参数
                    })
                }
            }
            this.request.url.path = this.request.url.path.replace(/\?.*$/, "");
        },
        //改变请求方法
        handleChangeRequestMethods(val) {
            this.currentReqeustLimit = val;
            if (val.name === "get") { //get请求需要清空嵌套数据
                this.request.requestParams.forEach(params => {
                    params.children = [];
                })
                this.request.requestType = "query"; 
            } else {
                if (!val.contentType.includes(this.request.requestType)) {
                    this.request.requestType = val.contentType[0];
                }
            } 
            this.request.methods = val.name;
            //改变tabs导航请求方式
            this.$store.commit("apidoc/changeTabInfoById", {
                _id: this.currentSelectDoc._id,
                projectId: this.$route.query.id,
                method: val.name
            });
            //改变banner请求方式
            this.$store.commit("apidoc/changeDocBannerInfoById", {
                id: this.currentSelectDoc._id,
                method: val.name
            });
        },
        //hack通过改变_variableChange触发watch事件刷新变量值
        handleVariableChange() {
            this.request._variableChange = !this.request._variableChange;
        },
    }
};
</script>



<style lang="scss">
.request-input {
    display: flex;
    align-items: center;
    .el-select {
        width: 100px;
    }
}
</style>
