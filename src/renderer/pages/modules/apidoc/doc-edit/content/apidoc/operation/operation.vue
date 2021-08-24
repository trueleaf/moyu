/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:10
    模块名称：操作区域
    备注：
*/
<template>
    <div class="api-operation">
        <!-- 环境、host、服务器地址 -->
        <div>
            <el-radio-group v-model="host" size="mini" @change="handleChangeHost">
                <el-popover placement="top-start" trigger="hover" width="auto" :content="mockServer" class="mr-2">
                    <template #reference>
                        <el-radio :label="mockServer" border>Mock服务器</el-radio>
                    </template>
                </el-popover>
                <el-popover v-for="(item, index) in hostEnum" :key="index" placement="top-start" trigger="hover" width="auto" :content="item.url">
                    <template #reference>
                        <el-radio :label="item.url" border>{{ item.name }}</el-radio>
                    </template>
                </el-popover>
            </el-radio-group>
            <el-button type="text" size="small" class="ml-3" @click="hostDialogVisible = true;">环境维护</el-button>
        </div>
        <!-- 请求地址，发送请求 -->
        <div class="op-wrap">
            <el-input
                v-model="requestPath"
                placeholder="只需要输入接口地址，前面不需要加域名，加了会被忽略"
                size="small"
                @input="handlePickPathParams"
                @blur="handleFormatUrl"
                @keyup.enter.stop="handleFormatUrl"
            >
                <template #prepend>
                    <div class="request-method">
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
                </template>
            </el-input>
            <el-button
                v-if="!loading"
                :loading="loading"
                :disabled="!config.isElectron"
                :title="config.isElectron ? '' : '由于浏览器限制，非electron环境无法模拟发送请求'"
                type="success"
                size="small"
                @click="handleSendRequest"
            >
                发送请求
            </el-button>
            <el-button v-if="loading" type="danger" size="small" @click="handleStopRequest">取消请求</el-button>
            <el-button :loading="loading2" type="primary" size="small" @click="handleSaveApidoc">保存接口</el-button>
            <el-button :loading="loading3" type="primary" size="small" class="mr-1" icon="el-icon-refresh" @click="handleFreshApidoc">刷新</el-button>
            <el-dropdown trigger="click" class="mr-1">
                <el-button type="primary" size="small">
                    其他操作<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="handleOpenViewDoc">预览接口</el-dropdown-item>
                        <!-- <el-dropdown-item @click="handleOpenVariablePage">全局变量</el-dropdown-item>
                        <el-dropdown-item @click="handleOpenConfigPage">全局配置</el-dropdown-item> -->
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
        <pre class="pre-url">
            <span>完整路径：</span>
            <span>{{ host }}{{ requestPath }}</span>
        </pre>
    </div>
    <s-curd-host-dialog v-if="hostDialogVisible" v-model="hostDialogVisible"></s-curd-host-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from "vue"
import { router } from "@/router/index"
import { useStore } from "@/store/index"
import globalConfig from "@/../config/config"
import curdHost from "../dialog/curd-host/curd-host.vue"
import { apidocGenerateProperty } from "@/helper/index"
import type { ApidocRequestMethodRule } from "@@/store" 
import type { Config } from "@@/config" 

export default defineComponent({
    components: {
        "s-curd-host-dialog": curdHost,
    },
    setup() {
        const store = useStore();
        const config: Ref<Config> = ref(globalConfig);
        const projectId = router.currentRoute.value.query.id as string;
        const currentSelectTab = computed(() => {
            const tabs = store.state["apidoc/tabs"].tabs[projectId];
            const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
            return currentSelectTab;
        });
        /*
        |--------------------------------------------------------------------------
        | host相关
        |--------------------------------------------------------------------------
        */
        const mockServer = ref(`http://${globalConfig.renderConfig.mock.ip}:${globalConfig.renderConfig.mock.port}`);
        const hostDialogVisible = ref(false); //环境维护弹窗
        //host值
        const host = computed({
            get() {
                return store.state["apidoc/apidoc"].apidoc.item.url.host;
            },
            set(val) {
                store.commit("apidoc/apidoc/changeApidocHost", val);
            },
        });
        //host枚举
        const hostEnum = computed(() => {
            return store.state["apidoc/baseInfo"].hosts
        });
        //改变host值
        const handleChangeHost = () => {
            console.log(2)
        };
        /*
        |--------------------------------------------------------------------------
        | 请求URL
        |--------------------------------------------------------------------------
        */
        //请求路径
        const requestPath: Ref<string> = computed({
            get() {
                return store.state["apidoc/apidoc"].apidoc.item.url.path;
            },
            set(path) {
                store.commit("apidoc/apidoc/changeApidocUrl", path)
            },
        });
        //从url中找出path参数
        const handlePickPathParams = (requestPath: string) => {
            const pathParamsReg = /(?<=\/){([^}]+)}/g; //path参数匹配
            let matchedPathParams = requestPath.match(pathParamsReg);
            if (matchedPathParams) {
                matchedPathParams = matchedPathParams.map((val) => val.replace(/[{}]+/g, ""))
                const result = matchedPathParams.map((param) => {
                    const property = apidocGenerateProperty();
                    property.key = param;
                    return property;
                });
                store.commit("apidoc/apidoc/changePathParams", result)
            } else {
                store.commit("apidoc/apidoc/changePathParams", [])
            }
        };
        //将请求url后面查询参数转换为params
        const convertQueryToParams = () => {
            const stringParams = requestPath.value.split("?")[1] || "";
            const urlSearchParams = new URLSearchParams(stringParams);
            const queryParams = Object.fromEntries(urlSearchParams.entries());
            console.log(queryParams)
            // let queryString = requestPath.value.split("?") || "";
            // queryString = queryString ? queryString[1] : "";
            // if (!queryString) {
            //     return;
            // }
            // const queryParams = qs.parse(queryString);
            // const params = this.convertTreeDataToPlainParams(queryParams, this.mindParams.queryParams);
            // this.$store.commit("apidoc/unshiftQueryParams", params[0].children)
            // const matchedComponent = this.getComponentByName("QueryParams");
            // matchedComponent.selectChecked();
        };
        //格式化url
        const handleFormatUrl = () => {
            /**
             * 用例：http://127.0.0.1:80
             * 用例：http://127.0.0.1
             * 用例：http://255.255.0.1
             * 用例：https://www.baidu.com
             * 用例：demo.google.com
             */
            convertQueryToParams();
            const ipReg = /https?:\/\/(\d|[1-9]\d|2[0-5]{2}\.){3}(\d|[1-9]\d|2[0-5]{2})(:\d{2,5})?(\/.+)?/;
            const dominReg = /(https?:\/\/)?([^.]{1,62}\.){1,}[^.]{1,62}/;
            const matchedIp = requestPath.value.match(ipReg);
            const matchedDomin = requestPath.value.match(dominReg);
            let formatPath = requestPath.value;
            if (!matchedIp && !matchedDomin) {
                const pathReg = /\/(?!\/)[^#\\?:]+/; //查询路径正则
                //路径处理
                const matchedPath = formatPath.match(pathReg);
                if (matchedPath) {
                    formatPath = matchedPath[0];
                } else if (formatPath.trim() === "") {
                    formatPath = "/";
                } else if (!formatPath.startsWith("/")) {
                    formatPath = `/${formatPath}`;
                }
                const queryReg = /\?.*/;
                formatPath = formatPath.replace(queryReg, "")
            } else {
                host.value = ""
            }
            requestPath.value = formatPath;
        };
        /*
        |--------------------------------------------------------------------------
        | 请求方法
        |--------------------------------------------------------------------------
        */
        //请求方法
        const requestMethod = computed({
            get() {
                return store.state["apidoc/apidoc"].apidoc.item.method;
            },
            set() {
                console.log(2)
            },
        });
        //禁用请求方法后提示信息
        const disabledTip = (item: ApidocRequestMethodRule) => {
            if (!item.enabled) {
                return "当前请求方法被禁止，可以在全局配置中进行相关配置";
            }
            return "";
        }
        //请求方法枚举
        const requestMethodEnum = computed(() => {
            return store.state["apidoc/baseInfo"].rules.requestMethods;
        });
        /*
        |--------------------------------------------------------------------------
        | 发送请求、保存接口、刷新接口
        |--------------------------------------------------------------------------
        */
        const loading = ref(false); //发送请求
        const loading2 = ref(false); //保存接口
        const loading3 = ref(false); //刷新接口
        //发送请求
        const handleSendRequest = () => {
            console.log("发送请求")
        }
        //停止请求
        const handleStopRequest = () => {
            console.log(2)
        };
        //保存文档
        const handleSaveApidoc = () => {
            console.log(3)
        };
        //刷新文档

        const handleFreshApidoc = () => {
            loading3.value = true;
            store.dispatch("apidoc/apidoc/getApidocDetail", {
                id: currentSelectTab.value?._id,
                projectId,
            }).then(() => {
                loading3.value = false;
            })
        };
        //预览文档
        const handleOpenViewDoc = () => {
            console.log(5)
        }
        return {
            config,
            host,
            hostEnum,
            mockServer,
            hostDialogVisible,
            handleChangeHost,
            requestMethodEnum,
            requestPath,
            requestMethod,
            handlePickPathParams,
            handleFormatUrl,
            disabledTip,
            handleSendRequest,
            loading,
            loading2,
            loading3,
            handleStopRequest,
            handleSaveApidoc,
            handleFreshApidoc,
            handleOpenViewDoc,
        };
    },
})
</script>

<style lang="scss">
.api-operation {
    position: sticky;
    top: 0;
    padding: size(10) size(20);
    box-shadow: 0 3px 2px $gray-400;
    background: $white;
    z-index: $zIndex-request-info-wrap;
    height: size(130);
    .el-radio {
        margin-right: size(5);
    }
    .op-wrap {
        display: flex;
        margin-top: size(10);
        .request-method {
            display: flex;
            align-items: center;
            .el-select {
                width: 100px;
            }
        }

    }
    .pre-url {
        height: size(30);
        width: 100%;
        white-space: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        &::-webkit-scrollbar {
            height: 0px;
        }
    }
}
</style>
