/*
    创建者：shuxiaokai
    创建时间：2022-06-30 22:19
    模块名称：mock配置
    备注：
*/
<template>
    <div>
        <s-fieldset title="mock服务器基本信息" class="w-50">
            <div class="d-flex a-center">
                <span>端口：</span>
                <span v-if="!isEditing">{{ mockPort }}</span>
                <el-input-number v-if="isEditing" v-model="mockPort" size="small" class="w-20" :step="1" :min="1" :max="65536"></el-input-number>
                <el-icon v-if="!isEditing" class="ml-2 cursor-pointer" @click="handleChangePortEditState">
                    <EditPen />
                </el-icon>
                <span v-if="isEditing" class="cursor-pointer theme-color mx-2" @click="handleChangePort">确定</span>
                <span v-if="isEditing" class="cursor-pointer theme-color" @click="mockPort = _mockPort; isEditing = false">取消</span>
            </div>
            <button @click="handleShutdownMockServer">关闭服务器</button>
            <pre>{{ mockInfo }}</pre>
        </s-fieldset>
    </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { store } from "@/store";
import { EditPen } from "@element-plus/icons-vue"
import { event } from "@/helper/index"

const mockInfo = computed(() => store.state["apidoc/mock"]); //mock服务器相关数据
const mockPort = ref(mockInfo.value.mockServerPort);
const _mockPort = mockPort.value;
const isEditing = ref(false);

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
    event.emit("apidoc/mock/restartMock")
}

onBeforeUnmount(() => {
    event.off("apidoc/mock/restartMock")
})
</script>

<style lang="scss">

</style>
