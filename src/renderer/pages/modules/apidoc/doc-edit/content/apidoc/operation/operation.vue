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
                <el-popover placement="top-start" :show-after="500" trigger="hover" width="auto" :content="mockServer" class="mr-2">
                    <template #reference>
                        <el-radio :label="mockServer" border>Mock服务器</el-radio>
                    </template>
                </el-popover>
                <el-popover v-for="(item, index) in hostEnum" :key="index" :show-after="500" placement="top-start" trigger="hover" width="auto" :content="item.url">
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
                                :value="item.value"
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
            <el-button :loading="loading3" type="primary" size="small" class="mr-2" icon="el-icon-refresh" @click="handleFreshApidoc">刷新</el-button>
            <el-dropdown trigger="click">
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
            <span class="label">完整路径：</span><span>{{ fullUrl }}</span>
        </pre>
    </div>
    <s-curd-host-dialog v-if="hostDialogVisible" v-model="hostDialogVisible"></s-curd-host-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed } from "vue"
import globalConfig from "@/../config/config"
import curdHost from "../dialog/curd-host/curd-host.vue"
import getHostPart from "./composables/host"
import { handleFormatUrl, handlePickPathParams } from "./composables/url"
import getMethodPart from "./composables/method"
import getOperationPart from "./composables/operation"
import { useStore } from "@/store/index"
import type { Config } from "@@/config" 

export default defineComponent({
    components: {
        "s-curd-host-dialog": curdHost,
    },
    setup() {
        const config: Ref<Config> = ref(globalConfig);
        const store = useStore();
        /*
        |--------------------------------------------------------------------------
        | host相关
        |--------------------------------------------------------------------------
        */
        const hostPart = getHostPart();
        const { mockServer, hostDialogVisible, host, hostEnum, handleChangeHost } = hostPart;
        /*
        |--------------------------------------------------------------------------
        | 请求方法
        |--------------------------------------------------------------------------
        */
        const methodPart = getMethodPart();
        const { requestMethod, disabledTip, requestMethodEnum } = methodPart;
        /*
        |--------------------------------------------------------------------------
        | 发送请求、保存接口、刷新接口
        |--------------------------------------------------------------------------
        */
        const loading = computed(() => {
            return store.state["apidoc/response"].loading;
        })
        const operationPart = getOperationPart();
        const { loading2, loading3, handleSendRequest, handleStopRequest, handleSaveApidoc, handleFreshApidoc, handleOpenViewDoc  } =  operationPart;
        //请求url、完整url
        const requestPath = computed<string>({
            get() {
                return store.state["apidoc/apidoc"].apidoc.item.url.path;
            },
            set(path) {
                store.commit("apidoc/apidoc/changeApidocUrl", path)
            },
        }); 
        const paths = computed(() => {
            return store.state["apidoc/apidoc"].apidoc.item.paths
        })
        const fullUrl = computed(() => {
            const { queryParams } = store.state["apidoc/apidoc"].apidoc.item;
            let queryString = "";
            queryParams.forEach((v) => {
                if (v.key && v.select) {
                    queryString += `${v.key}=${v.value}&`
                }
            })
            queryString = queryString.replace(/\&$/, "");
            if (queryString) {
                queryString = "?" + queryString;
            }
            const pathMap: Record<string, string> = {};
            paths.value.forEach((v) => {
                if (v.key) {
                    pathMap[v.key] = v.value;
                }
            })
            const validPath = requestPath.value.replace(/\{([^\}]+)\}/g, ($1, $2) => {
                return pathMap[$2] || $2
            })
            return host.value + validPath + queryString
        })

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
            fullUrl,
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
        .label {
            user-select: none;
        }
    }
}
</style>
