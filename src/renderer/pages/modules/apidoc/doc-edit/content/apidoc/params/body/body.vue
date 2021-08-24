/*
    创建者：shuxiaokai
    创建时间：2021-08-20 22:42
    模块名称：body参数
    备注：
*/
<template>
    <div class="body-params">
        <!-- <pre>{{ bodyType }}</pre> -->
        <div class="d-flex a-center">
            <!-- body类型选择 -->
            <el-radio-group v-model="bodyType" @change="handleChangeBodyType">
                <el-radio label="json">json</el-radio>
                <el-radio label="form-data">form-data</el-radio>
                <el-radio label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
                <el-radio label="raw">raw</el-radio>
                <el-radio label="none">none</el-radio>
            </el-radio-group>
            <div class="operation">
                <div class="active cursor-pointer">导入参数</div>
                <el-divider direction="vertical"></el-divider>
                <div class="cursor-pointer">应用模板 </div>
                <el-divider direction="vertical"></el-divider>
                <div class="cursor-pointer">保存为模板 </div>
                <el-divider direction="vertical"></el-divider>
                <div class="cursor-pointer">预览参数 </div>
            </div>
        </div>
        <s-params-tree v-if="bodyType === 'json'" nest show-checkbox :data="jsonBodyData"></s-params-tree>
    </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"
import { ApidocBodyMode } from "@@/global"


/*
|--------------------------------------------------------------------------
| json类型的body参数
|--------------------------------------------------------------------------
*/
//json格式body参数
const jsonBodyData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.requestBody.json;
})
//body类型
const bodyType = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.item.requestBody.mode;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeBodyMode", val);
    },
});
//改变body参数类型
const handleChangeBodyType = (type: ApidocBodyMode) => {
    // if (type === "json") {
    //     const keys: string[] = [];
    //     forEachForest(jsonBodyData.value, (value) => {
    //         keys.push(value._id);
    //     });
    //     // console.log(keys)
    //     jsonExpandKeys.value = keys
    // }
    console.log(type)
}
</script>

<style lang="scss">
.body-params {
    .operation {
        margin-top: size(-3);
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
}
</style>
