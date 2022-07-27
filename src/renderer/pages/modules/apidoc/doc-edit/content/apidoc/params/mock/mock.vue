/*
    创建者：shuxiaokai
    创建时间：2022-06-30 22:19
    模块名称：mock配置
    备注：
*/
<template>
    <div class="mock-wrap">
        <s-fieldset title="Mock服务器基本信息" class="w-100">
            <!-- 状态 -->
            <s-label-value label="状态：" label-width="50px" class="mb-1" one-line>
                <span v-if="mockServerInfo.serverState === 'closing'" class="f-sm">
                    <span class="dot"></span>
                    <span>关闭中</span>
                </span>
                <span v-if="mockServerInfo.serverState === 'connecting'" class="f-sm">
                    <span class="dot bg-orange"></span>
                    <span>连接中</span>
                </span>
                <span v-if="mockServerInfo.serverState === 'connection'" class="f-sm">
                    <span class="dot bg-green"></span>
                    <span>已连接</span>
                </span>
                <span v-if="mockServerInfo.serverState === 'disconnection'" class="f-sm">
                    <span class="dot bg-gray-500"></span>
                    <span>断开连接</span>
                </span>
                <span v-if="mockServerInfo.serverState === 'error'" class="f-sm">
                    <span class="dot bg-red"></span>
                    <span>异常</span>
                </span>
            </s-label-value>
            <!-- mock地址 -->
            <s-label-value label="Mock地址：" label-width="90px" class="mb-1" one-line>
                <span class="text">{{ mockServer }}</span>
                <input v-model="customPath" type="text" class="edit-ipt" @input="handleChangeMockPath">
                <span v-copy="fullMockUrl" class="cursor-pointer f-sm theme-color ml-1 mr-2">复制</span>
                <span v-if="orginPath !== customPath" class="theme-color cursor-pointer f-sm" @click="handleResetMockUrl">还原</span>
            </s-label-value>
            <!-- mock端口 -->
            <s-label-value label="Mock端口：" label-width="90px" class="mb-1" one-line>
                <span v-if="!isEditingPort">{{ mockPort }}</span>
                <el-input-number v-if="isEditingPort" v-model="_mockPort" size="small" class="w-20" :step="1" :min="1" :max="65536"></el-input-number>
                <span v-if="!isEditingPort" class="cursor-pointer f-sm theme-color mx-2" @click="handleChangePortEditState">修改</span>
                <span v-if="isEditingPort" class="cursor-pointer f-sm theme-color mx-2" @click="handleChangePort">确定</span>
                <span v-if="isEditingPort" class="cursor-pointer f-sm theme-color" @click="_mockPort = mockPort; isEditingPort = false">取消</span>
            </s-label-value>
            <!-- http返回状态码 -->
            <s-label-value label="HTTP返回状态码：" label-width="130px" class="mb-1" one-line>
                <span v-if="!isEditingHttpStatusCode">{{ httpStatusCode }}</span>
                <el-input-number v-if="isEditingHttpStatusCode" v-model="_httpStatusCode" size="small" class="w-20" :step="1" :min="1" :max="599"></el-input-number>
                <span v-if="!isEditingHttpStatusCode" class="cursor-pointer f-sm theme-color mx-2" @click="isEditingHttpStatusCode = true">修改</span>
                <span v-if="isEditingHttpStatusCode" class="cursor-pointer f-sm theme-color mx-2" @click="handleChangeHttpStatusCode">确定</span>
                <span v-if="isEditingHttpStatusCode" class="cursor-pointer f-sm theme-color" @click="_httpStatusCode = httpStatusCode; isEditingHttpStatusCode = false">取消</span>
            </s-label-value>
            <!-- 延迟返回(毫秒) -->
            <s-label-value label="延迟返回(毫秒)：" label-width="120px" class="mb-1" one-line>
                <span v-if="!isEditingResponseDelay">{{ responseDelay }}</span>
                <el-input-number v-if="isEditingResponseDelay" v-model="_responseDelay" size="small" class="w-20" :step="1" :min="0" :max="60000"></el-input-number>
                <span v-if="!isEditingResponseDelay" class="cursor-pointer f-sm theme-color mx-2" @click="isEditingResponseDelay = true">修改</span>
                <span v-if="isEditingResponseDelay" class="cursor-pointer f-sm theme-color mx-2" @click="handleChangeResponseDelay">确定</span>
                <span v-if="isEditingResponseDelay" class="cursor-pointer f-sm theme-color" @click="_responseDelay = responseDelay; isEditingResponseDelay = false">取消</span>
            </s-label-value>
            <el-tabs v-model="activeName">
                <el-tab-pane label="返回结果" name="response">
                    <mock-response></mock-response>
                </el-tab-pane>
                <el-tab-pane label="自定义返回头" name="header"></el-tab-pane>
            </el-tabs>
            <!-- <pre>{{ mockInfo }}</pre> -->
            <!-- <pre>{{ fullMockUrl }}</pre> -->
        </s-fieldset>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { store } from "@/store";
import { event } from "@/helper/index"
import globalConfig from "@/../config/config"
import mockResponse from "./components/mock-response.vue"

const mockServerInfo = computed(() => store.state["apidoc/mock"]);

/*
|--------------------------------------------------------------------------
| 请求url
|--------------------------------------------------------------------------
*/
const mockServer = computed(() => `http://${globalConfig.renderConfig.mock.ip}:${store.state["apidoc/mock"].mockServerPort}`);
const orginPath = computed(() => store.state["apidoc/apidoc"].apidoc.item.url.path); //原始请求路径
const customPath = ref(""); //自定义请求路径
const fullMockUrl = computed(() => `${mockServer.value}${customPath.value}`); //完整请求url
const apidocInfo = computed(() => store.state["apidoc/apidoc"].apidoc); //当前api文档信息
const handleChangeMockPath = () => {
    if (!customPath.value) {
        customPath.value = "/"
    }
}
//重置mock数据
const handleResetMockUrl = () => {
    customPath.value = orginPath.value;
}
watch(orginPath, (newVal) => {
    if (customPath.value === "") {
        customPath.value = newVal;
    }
})
watch(customPath, (newVal) => {
    const { urlMap } = store.state["apidoc/mock"];
    const matchedMockInfo = urlMap.find(v => v.id === apidocInfo.value._id);
    store.commit("apidoc/mock/changeMockUrlInfoById", {
        id: matchedMockInfo?.id,
        data: {
            ...matchedMockInfo,
            url: newVal,
        }
    })
})
/*
|--------------------------------------------------------------------------
| 端口号
|--------------------------------------------------------------------------
*/
const mockPort = computed(() => mockServerInfo.value.mockServerPort)
const _mockPort = ref(mockPort.value);
const isEditingPort = ref(false);
//改变端口编辑状态
const handleChangePortEditState = () => {
    isEditingPort.value = true;
}
//改变端口
const handleChangePort = () => {
    store.commit("apidoc/mock/changeMockServerPort", _mockPort.value);
    if (mockServerInfo.value.serverState === "connection") {
        event.emit("apidoc/mock/restartMockServer")
    }
    isEditingPort.value = false;
}
/*
|--------------------------------------------------------------------------
| HTTP状态码
|--------------------------------------------------------------------------
*/
const httpStatusCode = computed(() => store.state["apidoc/apidoc"].apidoc.mockInfo.httpStatusCode);
const _httpStatusCode = ref(httpStatusCode.value);
const isEditingHttpStatusCode = ref(false);
//改变http状态码
const handleChangeHttpStatusCode = () => {
    store.commit("apidoc/apidoc/changeMockHttpStatusCode", _httpStatusCode.value);
    isEditingHttpStatusCode.value = false;
}
/*
|--------------------------------------------------------------------------
| 返回延迟
|--------------------------------------------------------------------------
*/
const responseDelay = computed(() => store.state["apidoc/apidoc"].apidoc.mockInfo.responseDelay);
const _responseDelay = ref(responseDelay.value);
const isEditingResponseDelay = ref(false);
//改变返回时长
const handleChangeResponseDelay = () => {
    store.commit("apidoc/apidoc/changeMockResponseDelay", _responseDelay.value);
    isEditingResponseDelay.value = false;
}
/*
|--------------------------------------------------------------------------
| 返回头和返回参数
|--------------------------------------------------------------------------
*/
const activeName = ref("response");

</script>

<style lang="scss" scoped>
.mock-wrap {
    font-size: fz(15);
    height: calc(100vh - #{size(310)});
    overflow-y: auto;
    margin-left: size(20);
    margin-right: size(20);
    .dot {
        display: inline-block;
        width: size(10);
        height: size(10);
        border-radius: 50%;
        margin-right: size(5);
    }
    .text {
        display: inline-block;
        height: size(30);
        line-height: size(30);
    }
    .edit-ipt {
        padding: 0 size(3);
        height: size(22);
        line-height: size(22);
        border: none;
        border-bottom: 1px solid $gray-500;
        font-size: fz(15);
        width: size(300);
    }
    .el-tabs {
        padding: 0;
    }
}
</style>
