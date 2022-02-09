/*
    创建者：shuxiaokai
    创建时间：2021-12-25 13:15
    模块名称：全局设置
    备注：
*/
<template>
    <s-loading :loading="loading" class="config">
        <el-form ref="form" v-flex1="20" :model="copyApiRules" class="api-rule" label-width="220px">
            <!-- 基础配置 -->
            <s-fieldset title="基础配置">
                <s-config label="单个目录最大允许文档数量" :has-check="false" description="限制单个目录下文档个数，提高可阅读性">
                    <el-input-number v-model="copyApiRules.fileInFolderLimit" :controls="false" size="default" :step="1" class="w-60" :min="1" :max="255"></el-input-number>
                </s-config>
                <s-config label="每个项目限制配置域名个数" :has-check="false" description="提高可阅读性">
                    <el-input-number v-model="copyApiRules.dominLimit" size="default" :controls="false" :step="1" class="w-60" :min="1" :max="255"></el-input-number>
                </s-config>
                <s-config label="参数备注是否必填" :has-check="false" description="开启后将会对录入参数备注进行非空校验">
                    <el-radio-group v-model="copyApiRules.requireDescription">
                        <el-radio :label="true">必填</el-radio>
                        <el-radio :label="false">非必填</el-radio>
                    </el-radio-group>
                </s-config>
                <s-config label="参数值是否必填" :has-check="false" description="开启后将会对录入参数值进行非空校验">
                    <el-radio-group v-model="copyApiRules.requireValue">
                        <el-radio :label="true">必填</el-radio>
                        <el-radio :label="false">非必填</el-radio>
                    </el-radio-group>
                </s-config>
                <!-- <s-config label="是否开启折叠动画" :has-check="false" description="开启后将会对性能产生一定的影响">
                    <el-radio-group v-model="copyApiRules.enableCollapseAnimation">
                        <el-radio :label="true">开启</el-radio>
                        <el-radio :label="false">关闭</el-radio>
                    </el-radio-group>
                </s-config> -->
            </s-fieldset>
            <!-- 请求方式 -->
            <s-fieldset title="请求方式配置">
                <s-collapse-card v-for="(item, index) in copyApiRules.requestMethods" :key="index" :fold="true" class="w-100">
                    <template #head>
                        <span :style="{color: item.iconColor}" class="w-130px">
                            <span class="mr-2">{{ item.name }}</span>
                            <span v-if="item.enabled" class="ml-auto green">(已启用)</span>
                            <span v-else class="ml-auto gray-500">(已禁用)</span>
                        </span>
                    </template>
                    <template #operation>
                        <div>
                            <span class="gray-800">支持传参方式：</span>
                            <span v-for="(ct, i) in item.enabledContenTypes" :key="ct" class="gray-600">
                                <span>{{ ct }}</span>
                                <el-divider v-if="i !== item.enabledContenTypes.length - 1" direction="vertical"></el-divider>
                            </span>
                        </div>
                    </template>
                    <s-config :has-check="false" label="是否启用" :description="`禁用后则无法录入${item.name}请求`">
                        <el-radio-group v-model="item.enabled">
                            <el-radio :label="true">启用</el-radio>
                            <el-radio :label="false">禁用</el-radio>
                        </el-radio-group>
                    </s-config>
                    <s-config :has-check="false" label="允许传参方式" description="">
                        <el-checkbox-group v-model="item.enabledContenTypes">
                            <el-checkbox v-for="(ct) in paramTypes" :key="ct" :label="ct" :disabled="item.name.toLowerCase() === 'get'">{{ ct }}</el-checkbox>
                        </el-checkbox-group>
                    </s-config>
                    <s-config :has-check="false" label="图标颜色" description="">
                        <div class="d-flex a-center">
                            <el-color-picker v-model="item.iconColor" :size="config.renderConfig.layout.size"></el-color-picker>
                            <div class="tabs ml-2">
                                <span :style="{color: item.iconColor}">{{ item.name }}</span>
                                <span class="item-text">示例{{ item.name }}接口</span>
                            </div>
                        </div>
                    </s-config>
                </s-collapse-card>
            </s-fieldset>
            <div class="w-100 d-flex j-center mt-2">
                <el-button type="success" :loading="loading" @click="saveConfig">保存配置</el-button>
            </div>
        </el-form>
    </s-loading>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted } from "vue"
import { ApidocRequestParamTypes } from "@@/global"
import { ApidocProjectRules, ApidocProjectBaseInfoState } from "@@/store";
import { axios } from "@/api/api"
import { store } from "@/store/index"
import { router } from "@/router/index"
import { event, apidocGenerateRequestParamTypes } from "@/helper/index"

const copyApiRules: Ref<ApidocProjectRules> = ref({
    requireValue: true,
    requireDescription: true,
    fileInFolderLimit: 8,
    enableCollapseAnimation: true,
    dominLimit: 8,
    requestMethods: [],
});
const paramTypes: Ref<ApidocRequestParamTypes> = ref(apidocGenerateRequestParamTypes());
const loading = ref(false); //加载效果
const projectId = router.currentRoute.value.query.id; //项目id

//保存配置信息
const saveConfig = () => {
    loading.value = true;
    const params = {
        projectId,
        ...copyApiRules.value,
    };
    axios.put("/api/apidoc/project/project_rules", params).then(() => {
        store.commit("apidoc/baseInfo/changeProjectRules", JSON.parse(JSON.stringify(copyApiRules.value)))
    }).catch((err) => {
        console.error(err)
    }).finally(() => {
        loading.value = false;
    });
}

event.on("apidoc/getBaseInfo", (data) => {
    copyApiRules.value = (JSON.parse(JSON.stringify(data)) as ApidocProjectBaseInfoState).rules;
})
onMounted(() => { //当组件还未创建时候，通过mounted生命周期确保获取到数据
    copyApiRules.value = JSON.parse(JSON.stringify(store.state["apidoc/baseInfo"].rules));
})

</script>

<style lang="scss" scoped>
.config {
    width: 90%;
    min-width: size(768);
    margin: 0 auto;
    border-radius: $border-radius-sm;
    height: calc(100vh - #{size(100)});
    padding: size(10) size(0) size(10) size(20);
    .api-rule {
        .tabs {
            @include tabs;
        }
        .el-form-item {
            margin-bottom: 0;
        }
        .request-config {
            .el-form-item {
                border-bottom: 1px solid $gray-200;
            }
        }
    }
}
</style>
