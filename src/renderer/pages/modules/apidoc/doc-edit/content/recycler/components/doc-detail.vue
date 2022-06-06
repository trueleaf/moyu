/*
    创建者：shuxiaokai
    创建时间：2021-09-10 22:44
    模块名称：预览界面
    备注：
*/
<template>
    <s-loading :loading="loading" class="doc-detail">
        <el-icon :size="18" class="close" @click="handleClose">
            <Close />
        </el-icon>
        <div class="params-view">
            <s-fieldset v-if="apidocInfo?.item.url" :title="$t('基本信息')">
                <s-label-value label="请求方式：" class="w-50">
                    <template v-for="(req) in validRequestMethods">
                        <span v-if="apidocInfo?.item.method.toLowerCase() === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toUpperCase() }}</span>
                    </template>
                </s-label-value>
                <s-label-value label="请求地址：" class="w-50 mt-2">
                    <span class="text-ellipsis">{{ apidocInfo?.item.url.path }}</span>
                </s-label-value>
                <s-label-value label="接口名称：" class="w-50">
                    <div>{{ apidocInfo?.info.name }}</div>
                </s-label-value>
                <s-label-value label="标签信息：" class="w-50">
                    <div v-if="apidocInfo?.info.tag && apidocInfo?.info.tag.name">
                        <span :style="{color: apidocInfo?.info.tag.color}">{{ apidocInfo?.info.tag.name }}</span>
                    </div>
                </s-label-value>
                <div v-if="apidocInfo" class="base-info">
                    <s-label-value label="维护人员：" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
                    </s-label-value>
                    <s-label-value label="创建人员：" :title="apidocInfo.info.maintainer || apidocInfo.info.creator" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ apidocInfo.info.maintainer || apidocInfo.info.creator }}</span>
                    </s-label-value>
                    <s-label-value label="更新日期：" :title="$helper.formatDate(apidocInfo.updatedAt)" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ $helper.formatDate(apidocInfo.updatedAt) }}</span>
                    </s-label-value>
                    <s-label-value label="创建日期：" :title="$helper.formatDate(apidocInfo.createdAt)" label-width="auto" class="w-50">
                        <span class="text-ellipsis">{{ $helper.formatDate(apidocInfo.createdAt) }}</span>
                    </s-label-value>
                </div>
            </s-fieldset>
            <s-fieldset v-if="!apidocInfo?.isFolder" :title="$t('请求参数')" class="mb-5">
                <template v-if="hasQueryParams">
                    <div class="title">{{ $t("Query参数") }}</div>
                    <s-params-view :data="apidocInfo?.item.queryParams" plain class="mb-3"></s-params-view>
                </template>
                <template v-if="hasPathsParams">
                    <div class="title">{{ $t("Path参数") }}</div>
                    <s-params-view :data="apidocInfo?.item.paths" plain class="mb-3"></s-params-view>
                </template>
                <template v-if="hasJsonBodyParams">
                    <div class="title">{{ $t("Body参数") }}(application/json)</div>
                    <s-json-editor :value="apidocInfo?.item.requestBody.rawJson" read-only></s-json-editor>
                    <!-- <s-params-view :data="apidocInfo?.item.requestBody.json"></s-params-view> -->
                </template>
                <template v-if="hasFormDataParams">
                    <div class="title">{{ $t("Body参数") }}(multipart/formdata)</div>
                    <s-params-view :data="apidocInfo?.item.requestBody.formdata" plain></s-params-view>
                </template>
                <template v-if="hasUrlEncodedParams">
                    <div class="title">{{ $t("Body参数") }}(x-www-form-urlencoded)</div>
                    <s-params-view :data="apidocInfo?.item.requestBody.urlencoded" plain></s-params-view>
                </template>
                <template v-if="hasRawParams">
                    <div class="title">{{ $t("Body参数") }}({{ apidocInfo?.item.requestBody.raw.dataType }})</div>
                    <pre>{{ apidocInfo?.item.requestBody.raw.data }}</pre>
                </template>
                <div v-if="!hasQueryParams && !hasPathsParams && !hasJsonBodyParams && !hasFormDataParams && !hasUrlEncodedParams && !hasRawParams">{{ $t("暂无数据") }}</div>
            </s-fieldset>
            <s-fieldset v-if="!apidocInfo?.isFolder" :title="$t('返回参数')">
                <div v-for="(item, index) in apidocInfo?.item.responseParams" :key="index" class="title">
                    <div class="mb-2">
                        <span>{{ $t("名称") }}：</span>
                        <span>{{ item.title }}</span>
                        <el-divider direction="vertical"></el-divider>
                        <span>{{ $t("状态码") }}：</span>
                        <span>{{ item.statusCode }}</span>
                        <el-divider direction="vertical"></el-divider>
                        <span>{{ $t("返回格式") }}：</span>
                        <span>{{ item.value.dataType }}</span>
                    </div>
                    <s-params-view v-if="item.value.dataType === 'application/json'" :data="item.value.json"></s-params-view>
                    <div v-if="item.value.dataType === 'application/xml' || item.value.dataType === 'text/plain' || item.value.dataType === 'text/html'" class="h-150px">
                        <s-raw-editor :data="item.value.json" :type="item.value.dataType" readonly></s-raw-editor>
                    </div>
                </div>
            </s-fieldset>
            <s-fieldset v-if="!apidocInfo?.isFolder" :title="$t('请求头')">
                <template v-if="hasHeaders">
                    <s-params-view :data="apidocInfo?.item.headers" plain class="mb-3"></s-params-view>
                </template>
                <div v-else>{{ $t("暂无数据") }}</div>
            </s-fieldset>
        </div>
    </s-loading>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, computed } from "vue"
import { Close } from "@element-plus/icons-vue"
import { ApidocDetail, Response } from "@@/global";
import { router } from "@/router/index"
import { axios } from "@/api/api"
import { store } from "@/store/index"

const emit = defineEmits(["close"])
const props = defineProps({
    id: {
        type: String,
        default: ""
    },
});
/*
|--------------------------------------------------------------------------
| 获取文档详情
|--------------------------------------------------------------------------
*/
const docDetail: Ref<ApidocDetail | null> = ref(null); //文档详情
const projectId = router.currentRoute.value.query.id as string;
const loading = ref(false); //数据加载
//获取文档详情
const getDocDetail = () => {
    loading.value = true;
    const params = {
        _id: props.id,
        projectId,
    };
    axios.get<Response<ApidocDetail>, Response<ApidocDetail>>("/api/project/doc_detail", { params }).then((res) => {
        docDetail.value = res.data
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
}
onMounted(() => {
    getDocDetail();
})
/*
|--------------------------------------------------------------------------
| 参数是否存在判断
|--------------------------------------------------------------------------
*/
const apidocInfo = computed(() => docDetail.value);
//是否存在查询参数
const hasQueryParams = computed(() => {
    if (!docDetail.value) {
        return false;
    }
    const { queryParams } = docDetail.value.item;
    return queryParams.filter(p => p.select).some((data) => data.key);
})
//是否存在path参数
const hasPathsParams = computed(() => {
    if (!docDetail.value) {
        return false;
    }
    const { paths } = docDetail.value.item;
    return paths.some((data) => data.key);
})
//是否存在body参数
const hasJsonBodyParams = computed(() => {
    if (!docDetail.value) {
        return false;
    }
    const { contentType } = docDetail.value.item;
    const { mode } = docDetail.value.item.requestBody;
    return contentType === "application/json" && mode === "json";
})
//是否存在formData参数
const hasFormDataParams = computed(() => {
    if (!docDetail.value) {
        return false;
    }
    const { contentType } = docDetail.value.item;
    return contentType === "multipart/form-data";
})
//是否存在formData参数
const hasUrlEncodedParams = computed(() => {
    if (!docDetail.value) {
        return false;
    }
    const { contentType } = docDetail.value.item;
    return contentType === "application/x-www-form-urlencoded";
})
//raw类型返回参数
const hasRawParams = computed(() => {
    if (!docDetail.value) {
        return false;
    }
    const { mode, raw } = docDetail.value.item.requestBody;
    return mode === "raw" && raw.data;
})
//是否存在headers
const hasHeaders = computed(() => {
    if (!docDetail.value) {
        return false;
    }
    const { headers } = docDetail.value.item;
    return headers.filter(p => p.select).some((data) => data.key);
})
const validRequestMethods = computed(() => store.state["apidoc/baseInfo"].rules.requestMethods)

/*
|--------------------------------------------------------------------------
| 其他操作
|--------------------------------------------------------------------------
*/

//关闭弹窗
const handleClose = () => {
    emit("close");
}

</script>

<style lang="scss">
.doc-detail {
    width: size(800);
    overflow: hidden;
    position: relative;
    .params-view {
        max-height: 65vh;
        overflow-y: auto;
        padding: 0 size(10);
        margin-top: size(30);
        .copy-json {
            cursor: pointer;
            &:hover {
                color: lighten($gray-300, 20%);
            }
        }
    }
    .close {
        @include rt-close;
        font-size: fz(22);
    }
}
</style>
