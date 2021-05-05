/*
    创建者：shuxiaokai
    创建时间：2020-10-13 13:47
    模块名称：请求发送相关
    备注：xxxx
*/
<template>
    <div class="request-operation w-100">
        <!-- 请求操作区域 -->
        <div class="d-flex w-100">
            <s-v-input
                v-model="requestPath"
                placeholder="只需要输入接口地址，前面不需要加域名，加了会被忽略"
                :error="urlError"
                size="small"
                @input="handlePickPathParams"
                @blur="formatUrl"
                @keyup.enter.native.stop="formatUrl"
            >
                <div slot="prepend" class="request-input">
                    <el-select v-model="requestMethod" value-key="name">
                        <el-option
                            v-for="(item, index) in requestMethodEnum"
                            :key="index"
                            :value="item"
                            :label="item.name"
                            :title="disabledTip(item)"
                            :disabled="!item.enabled"
                        >
                        </el-option>
                    </el-select>
                </div>
            </s-v-input>
            <el-button
                v-if="!loading"
                :loading="loading"
                :disabled="!config.isElectron"
                :title="config.isElectron ? '' : '由于浏览器限制，非electron环境无法模拟发送请求'"
                type="success"
                size="small"
                @click="sendRequest"
            >
                发送请求
            </el-button>
            <el-button v-if="loading" type="danger" size="small" @click="stopRequest">取消请求</el-button>
            <el-button :loading="loading2" type="primary" size="small" @click="saveRequest">保存接口</el-button>
            <el-button :loading="loading3" type="primary" size="small" class="mr-1" icon="el-icon-refresh" @click="handleFreshApidoc">刷新</el-button>
            <el-dropdown trigger="click" class="mr-1">
                <el-button type="primary" size="small">
                    其他操作<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="publishRequest">发布接口</el-dropdown-item>
                    <el-dropdown-item @click.native="handleOpenVariablePage">全局变量</el-dropdown-item>
                    <el-dropdown-item @click.native="dialogVisible = true">内置参数</el-dropdown-item>
                    <el-dropdown-item @click.native="handleOpenConfigPage">全局配置</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <!-- 请求参数展示 -->
        <pre class="full-url">{{ fullUrl }}</pre>
        <s-variable-dialog v-if="dialogVisible" :visible.sync="dialogVisible" @change="handleVariableChange"></s-variable-dialog>
    </div>
</template>

<script>
import qs from "qs"
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import variableDialog from "@/pages/modules/apidoc/doc-edit/dialog/variable-manage.vue"

export default {
    name: "RequestOperation",
    components: {
        "s-variable-dialog": variableDialog,
    },
    mixins: [mixin],
    data() {
        return {
            urlError: { //-----------------请求url错误
                error: false,
                message: "请求url不能为空",
            },
            currentReqeustLimit: { enabledContenType: [] }, //当前选中请求类型额外规则
            //=====================================其他参数====================================//
            loading2: false, //------------保存接口loading
            loading3: false, //------------发布接口loading
            dialogVisible: false, //-------全局变量
            dialogVisible2: false, //------内置参数
        };
    },
    computed: {
        apidocInfo() { //接口文档信息
            return this.$store.state.apidoc.apidocInfo;
        },
        docRules() { //文档规则
            return this.$store.state.apidocRules;
        },
        variables() { //全局变量
            return this.$store.state.apidoc.variables || [];
        },
        remoteResponse() { //远端返回数据结果
            return this.$store.state.apidoc.remoteResponse;
        },
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        tabs() { //全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
        requestMethodEnum() {
            return this.$store.state.apidocRules.requestMethods;
        },
        fullUrl() {
            const apidoc = this.$store.state.apidoc.apidocInfo;
            const url = apidoc?.item?.url || {
                path: "",
            };
            const queryParams = apidoc?.item?.queryParams || [];
            const paths = apidoc?.item?.paths || [];
            let queryStr = "";
            queryParams.map((val) => {
                if (val.key && val._select) {
                    queryStr = `${queryStr}&${val.key}=${val.value}`
                }
                return null;
            })
            queryStr = queryStr.replace(/&/, "");
            queryStr = `${queryStr ? "?" : ""}${queryStr}`;
            const pathParams = paths.filter((param) => param.value !== "");
            const realPath = url.path.replace(/\/{([^}]+)}/g, ($1, $2) => {
                const matchedElement = pathParams.find((val) => val.key === $2);
                if (matchedElement) {
                    return `/${matchedElement.value}`;
                }
                return "";
            })
            return url.host + realPath + queryStr;
        },
        host() {
            return this.$store.state.apidoc.apidocInfo?.item?.url.host;
        },
        requestPath: { //请求路径
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.url.path;
            },
            set(val) {
                this.$store.commit("apidoc/changeDocPath", val);
            },
        },
        requestMethod: { //请求方法
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.method.toUpperCase();
            },
            set(val) {
                this.$store.commit("apidoc/changeDocMethod", val.value);
            },
        },
        loading() { //发送请求loading效果
            return this.$store.state.apidoc.sendRequestLoading;
        },
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
        cookie() {
            const { cookies } = this.$store.state.apidoc;
            return cookies.reduce((accumulator, current) => {
                const currentCookie = `${current.name}=${current.value}`;
                if (accumulator === "") {
                    return currentCookie;
                }
                return `${accumulator};${currentCookie}`;
            }, "");
        },
        enabledContenType() {
            const rules = this.$store.state.apidocRules;
            const requestMethod = this.$store.state.apidoc.apidocInfo?.item?.method
            const matchedContentType = rules.requestMethods.find((val) => val.value === requestMethod);
            const enabledContenType = matchedContentType ? matchedContentType.enabledContenType : [];
            return enabledContenType;
        },
    },
    mounted() {
        window.addEventListener("keydown", this.shortcutSave)
    },
    beforeDestroy() {
        window.removeEventListener("keydown", this.shortcutSave)
    },
    methods: {
        //===============================发送请求，保存请求，发布请求=======================//
        //发送请求
        sendRequest() {
            this.$event.emit("apidoc/sendRequest");
            const { paths } = this.apidocInfo.item;
            const queryParams = this.convertPlainParamsToTreeData(this.apidocInfo.item.queryParams, true);
            const requestBody = this.convertPlainParamsToTreeData(this.apidocInfo.item.requestBody, true);
            const headers = this.convertPlainParamsToTreeData(this.apidocInfo.item.headers, true);
            const realHeaders = { //自定义cookie会覆盖默认cookie
                cookie: this.cookie,
                ...headers,
            };
            this.$store.dispatch("apidoc/sendRequest", {
                url: this.apidocInfo.item.url,
                method: this.apidocInfo.item.method,
                contentType: this.apidocInfo.item.contentType,
                paths,
                queryParams,
                requestBody,
                headers: realHeaders,
            }).then((res) => {
                //本地化cookie
                const rawCookies = res.headers["set-cookie"] || [];
                const cookies = this.getCookies(rawCookies);
                let localCookies = localStorage.getItem("apidoc/cookies") || "{}";
                localCookies = JSON.parse(localCookies);
                if (!localCookies[this.$route.query.id]) {
                    localCookies[this.$route.query.id] = [];
                }
                if (cookies.length > 0) { //有setCookie值
                    localCookies[this.$route.query.id] = cookies;
                    localStorage.setItem("apidoc/cookies", JSON.stringify(localCookies));
                    this.$store.commit("apidoc/changeCookies", cookies);
                }
                //本地化返回值
                let localRemoteResponse = localStorage.getItem("apidoc/remoteResponse") || "{}";
                localRemoteResponse = JSON.parse(localRemoteResponse);
                if (!localRemoteResponse[this.currentSelectDoc._id]) {
                    localRemoteResponse[this.currentSelectDoc._id] = {};
                }
                localRemoteResponse[this.currentSelectDoc._id] = this.remoteResponse;
                localStorage.setItem("apidoc/remoteResponse", JSON.stringify(localRemoteResponse));
            }).catch((err) => {
                console.error(err);
            });
        },
        //取消发送
        stopRequest() {
            this.$store.dispatch("apidoc/stopRequest");
        },
        //保存接口
        saveRequest() {
            if (!this.currentSelectDoc.changed) { //接口未发生改变不请求后台
                this.loading2 = true;
                setTimeout(() => {
                    this.loading2 = false;
                }, 200);
                return;
            }
            //保存接口使用时长
            const currentDocUsedTime = JSON.parse(localStorage.getItem("apidoc/spendTime") || "{}");
            const spendTime = currentDocUsedTime[this.currentSelectDoc._id];
            if (this.host) { //保存默认环境，下次自动应用本次保存的host值
                let storeEnvironment = localStorage.getItem("apidoc/environment") || "{}";
                storeEnvironment = JSON.parse(storeEnvironment);
                storeEnvironment[this.$route.query.id] = this.host;
                localStorage.setItem("apidoc/environment", JSON.stringify(storeEnvironment))
            }
            this.$store.commit("apidoc/changeDocUpdateTime");
            const params = {
                _id: this.currentSelectDoc._id,
                projectId: this.$route.query.id,
                info: this.apidocInfo.info,
                item: this.apidocInfo.item,
                spendTime: spendTime || 0,
            };
            this.saveMindParams(); //保存联想参数
            const originApidocInfo = this.$helper.cloneDeep(this.$store.state.apidoc.apidocInfo)
            this.$store.commit("apidoc/changeOriginApidocInfo", originApidocInfo);
            //取消未保存小圆点
            this.$store.commit("apidoc/changeCurrentTabInfo", {
                _id: this.currentSelectDoc._id,
                projectId: this.$route.query.id,
                changed: false,
            });
            this.loading2 = true;
            this.axios.post("/api/project/fill_doc", params).then(() => {
                if (currentDocUsedTime[this.currentSelectDoc._id]) { //存在文档录入时间，清空时长
                    currentDocUsedTime[this.currentSelectDoc._id] = 0;
                    localStorage.setItem("apidoc/spendTime", JSON.stringify(currentDocUsedTime));
                }
                //改变tabs导航请求方式
                this.$store.commit("apidoc/changeTabInfoById", {
                    _id: this.currentSelectDoc._id,
                    projectId: this.$route.query.id,
                    tail: this.requestMethod.toLowerCase(),
                });
                //改变当前tab导航信息
                this.$store.commit("apidoc/changeCurrentTabInfo", {
                    _id: this.currentSelectDoc._id,
                    projectId: this.$route.query.id,
                    tail: this.requestMethod.toLowerCase(),
                });
                //改变banner请求方式
                this.$store.commit("apidoc/changeDocBannerInfoById", {
                    id: this.currentSelectDoc._id,
                    projectId: this.$route.query.id,
                    method: this.requestMethod.toLowerCase(),
                });
            }).catch((err) => {
                this.$errorThrow(err, this);
                this.$store.commit("apidoc/changeCurrentTabInfo", {
                    _id: this.currentSelectDoc._id,
                    projectId: this.$route.query.id,
                    changed: true,
                });
            }).finally(() => {
                this.loading2 = false;
            });
        },
        //发布接口
        async publishRequest() {
            this.loading3 = true;
            try {
                await this.sendRequest();
                if (this.couldPublish) {
                    this.axios.put("/api/project/publish_doc", { _id: this.currentSelectDoc._id }).then((res) => {
                        this.$message.success("发布成功");
                        this.$store.commit("apidoc/changeDocInfo", res.data)
                    }).catch((err) => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading3 = false;
                    });
                } else {
                    this.$message.error("校验不通过无法发布接口");
                    this.loading3 = false;
                }
            } catch (error) {
                console.error(error);
                this.$message.error("校验错误")
                this.loading3 = false;
            }
        },
        //快捷保存
        shortcutSave(e) {
            const hasTabs = this.tabs && this.tabs.length > 0;
            const currentTabIsDoc = this.currentSelectDoc.tabType === "doc";
            if (hasTabs && currentTabIsDoc && e.ctrlKey && e.key === "s" && this.loading2 === false) {
                e.preventDefault();
                e.stopPropagation();
                this.saveRequest()
            }
        },
        //=====================================联想参数====================================//
        //保存联想参数(将之前录入过的参数保存起来)
        saveMindParams() {
            let allResponse = [];
            this.apidocInfo.item.responseParams.forEach((response) => {
                allResponse = allResponse.concat(response.values);
            })
            const paths = this.filterInvalidParams(this.apidocInfo.item.paths);
            const queryParams = this.filterInvalidParams(this.apidocInfo.item.queryParams);
            const requestBody = this.filterInvalidParams(this.apidocInfo.item.requestBody);
            const responseParams = this.filterInvalidParams(allResponse);
            const projectId = this.$route.query.id;
            const params = {
                projectId,
                paths,
                queryParams,
                requestBody,
                responseParams,
            };
            this.axios.post("/api/project/doc_params_mind", params).then((res) => {
                if (res.data != null) {
                    this.$store.commit("apidoc/initAndChangeMindParams", res.data);
                }
            }).catch((err) => {
                this.$errorThrow(err, this);
            });
        },
        //过滤无效参数数据
        filterInvalidParams(arrayParams) {
            const result = [];
            this.$helper.dfsForest(arrayParams, {
                rCondition(value) {
                    return value.children;
                },
                rKey: "children",
                hooks: (data) => {
                    const isComplex = data.type === "object" || data.type === "array";
                    const copyData = this.$helper.cloneDeep(data);
                    if (!isComplex && data.key !== "" && data.value !== "" && data.description !== "") { //常规数据
                        result.push(copyData);
                    } else if (isComplex && data.key !== "" && data.description !== "") {
                        result.push(copyData);
                    }
                },
            });
            return result;
        },
        //=====================================数据处理和校验====================================//
        //=====================================url操作====================================//
        //删除无效请求字符并且提取查询字符串
        formatUrl() {
            if (this.enabledContenType.indexOf("params") !== -1) {
                this.convertQueryToParams();
            }
            const protocolReg = /(\/?https?:\/\/)?/;
            this.requestPath = this.requestPath.replace(protocolReg, ""); //去除掉协议
            this.requestPath.startsWith(",") ? (this.requestPath = `/${this.requestPath}`) : "";
            const pathReg = /\/(?!\/)[^#\\?:]+/; //查询路径正则
            //路径处理
            const matchedPath = this.requestPath.match(pathReg);
            if (matchedPath) {
                this.requestPath = matchedPath[0];
            } else if (this.requestPath.trim() === "") {
                this.requestPath = "/";
            } else if (!this.requestPath.startsWith("/")) {
                this.requestPath = `/${this.requestPath}`;
            }
            const queryReg = /\?.*/;
            this.requestPath = this.requestPath.replace(queryReg, "")
        },
        //根据url获取path参数
        handlePickPathParams() {
            //path参数处理
            if (this.enabledContenType.indexOf("path") === -1) {
                return;
            }
            const pathParamsReg = /(?<=\/){([^}]+)}/g; //path参数匹配
            let matchedPathParams = this.requestPath.match(pathParamsReg);
            if (matchedPathParams) {
                matchedPathParams = matchedPathParams.map((val) => val.replace(/[{}]+/g, ""))
                const result = matchedPathParams.map((param) => {
                    const property = this.generateProperty();
                    property.key = param;
                    return property;
                });
                this.$store.commit("apidoc/changePathParams", result)
            } else {
                this.$store.commit("apidoc/changePathParams", [])
            }
        },
        //将请求url后面查询参数转换为params
        convertQueryToParams() {
            let queryString = this.requestPath.split("?") || "";
            queryString = queryString ? queryString[1] : "";
            if (!queryString) {
                return;
            }
            const queryParams = qs.parse(queryString);
            const params = this.convertTreeDataToPlainParams(queryParams, this.mindParams.queryParams);
            this.$store.commit("apidoc/unshiftQueryParams", params[0].children)
            const matchedComponent = this.getComponentByName("QueryParams");
            matchedComponent.selectChecked();
        },
        //hack通过改变_variableChange触发watch事件刷新变量值
        handleVariableChange() {
            this.request._variableChange = !this.request._variableChange;
        },
        //刷新请求页面
        handleFreshApidoc() {
            if (!this.currentSelectDoc.changed) {
                this.$store.commit("apidoc/clearRespons");
                this.getComponentByName("ApidocContent").getDocDetail();
            } else {
                this.$confirm("刷新后未保存数据将丢失", "提示", {
                    confirmButtonText: "刷新",
                    cancelButtonText: "取消",
                    type: "warning",
                }).then(() => {
                    this.$store.commit("apidoc/clearRespons");
                    this.getComponentByName("ApidocContent").getDocDetail();
                    this.$store.commit("apidoc/changeCurrentTabInfo", {
                        _id: this.currentSelectDoc._id,
                        projectId: this.$route.query.id,
                        changed: false,
                    });
                }).catch((err) => {
                    if (err === "cancel" || err === "close") {
                        return;
                    }
                    this.$errorThrow(err, this);
                });
            }
        },
        //=====================================其他操作====================================//
        //打开配置界面
        handleOpenConfigPage() {
            this.$store.commit("apidoc/addTab", {
                _id: "idConfig",
                projectId: this.$route.query.id,
                name: "文档全局配置",
                changed: false,
                tail: "conf",
                tabType: "config",
            });
            this.$store.commit("apidoc/changeCurrentTab", {
                _id: "idConfig",
                projectId: this.$route.query.id,
                name: "文档全局配置",
                changed: false,
                tail: "conf",
                tabType: "config",
            });
        },
        //打开全局变量配置页面
        handleOpenVariablePage() {
            const id = this.$helper.uuid();
            if (this.tabs && this.tabs.find((tab) => tab.tabType === "variable")) { //存在则返回不处理
                return;
            }
            this.$store.commit("apidoc/addTab", {
                _id: id,
                name: "全局变量管理",
                changed: false,
                tail: "",
                tabType: "variable",
                projectId: this.$route.query.id,
            });
            this.$store.commit("apidoc/changeCurrentTab", {
                _id: id,
                name: "全局变量管理",
                changed: false,
                tail: "",
                tabType: "variable",
                projectId: this.$route.query.id,
            });
        },
        //请求方法禁用提示
        disabledTip(item) {
            if (!item.enabled) {
                return "当前请求方法被禁止，可以在全局配置中进行相关配置";
            }
            return "";
        },
    },
};
</script>

<style lang="scss">
.request-operation {
    .request-input {
        display: flex;
        align-items: center;
        .el-select {
            width: 100px;
        }
    }
    .full-url {
        height: size(30);
        width: 100%;
        white-space: nowrap;
        &::-webkit-scrollbar {
            height: 0px;
        }
    }
}
</style>
