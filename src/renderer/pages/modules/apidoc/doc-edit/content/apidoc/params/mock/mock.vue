/*
    创建者：shuxiaokai
    创建时间：2022-06-30 22:19
    模块名称：mock配置
    备注：
*/
<template>
    <div class="mock-wrap">
        <s-fieldset title="Mock服务器基本信息" class="w-80">
            <s-label-value label="Mock地址：" label-width="90px" class="mb-1" one-line>
                <span class="text">{{ originMockUrl }}</span>
                <input v-model="customPath" type="text" class="edit-ipt">
                <el-icon v-copy="fullMockUrl" class="cursor-pointer ml-2">
                    <DocumentCopy />
                </el-icon>
            </s-label-value>
            <s-label-value label="Mock端口：" label-width="90px" class="mb-1" one-line>
                <span v-if="!isEditing">{{ mockPort }}</span>
                <el-input-number v-if="isEditing" v-model="mockPort" size="small" class="w-20" :step="1" :min="1" :max="65536"></el-input-number>
                <el-icon v-if="!isEditing" class="ml-2 cursor-pointer" @click="handleChangePortEditState">
                    <EditPen />
                </el-icon>
                <span v-if="isEditing" class="cursor-pointer theme-color mx-2" @click="handleChangePort">确定</span>
                <span v-if="isEditing" class="cursor-pointer theme-color" @click="mockPort = _mockPort; isEditing = false">取消</span>
            </s-label-value>
            <button @click="handleShutdownMockServer">关闭服务器</button>
            <button @click="handleOpenMockServer">开启服务器</button>
            <pre>{{ mockInfo }}</pre>
        </s-fieldset>
    </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { store } from "@/store";
import { EditPen, DocumentCopy } from "@element-plus/icons-vue"
import { event } from "@/helper/index"
// import { router } from "@/router";
import globalConfig from "@/../config/config"

const mockInfo = computed(() => store.state["apidoc/mock"]); //mock服务器相关数据
const mockPort = ref(mockInfo.value.mockServerPort);
const _mockPort = mockPort.value;
const isEditing = ref(false);

/*
|--------------------------------------------------------------------------
| 请求url
|--------------------------------------------------------------------------
*/
const originMockUrl = ref(`http://${globalConfig.renderConfig.mock.ip}:${store.state["apidoc/mock"].mockServerPort}`);
const orginPath = computed(() => store.state["apidoc/apidoc"].apidoc.item.url.path); //原始请求路径
const customPath = ref(orginPath); //自定义请求路径
const fullMockUrl = computed(() => `${originMockUrl.value}${customPath.value}`)

//改变端口编辑状态
const handleChangePortEditState = () => {
    isEditing.value = true;
}
//改变端口
const handleChangePort = () => {
    store.commit("apidoc/mock/changeMockServerPort", mockPort.value);
    isEditing.value = false;
}
//关闭mock服务器
const handleShutdownMockServer = () => {
    event.emit("apidoc/mock/closeMockServer")
}
//打开mock服务器
const handleOpenMockServer = () => {
    event.emit("apidoc/mock/openMockServer")
}

onBeforeUnmount(() => {
    event.off("apidoc/mock/closeMockServer")
})
</script>

<style lang="scss" scoped>
.mock-wrap {
    font-size: fz(15);
    .text {
        display: inline-block;
        height: size(30);
        line-height: size(30);
    }
    .edit-ipt {
        padding: 0 size(3);
        height: size(20);
        line-height: size(20);
        border: none;
        border-bottom: 1px solid $gray-600;
        font-size: fz(15);
    }
}
</style>
