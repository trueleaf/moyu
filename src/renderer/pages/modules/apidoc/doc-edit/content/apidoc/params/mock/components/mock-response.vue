/*
    创建者：shuxiaokai
    模块名称：自定义mock返回值
    备注：
*/
<template>
    <div class="mock-response">
        <!-- 返回数据类型 -->
        <s-label-value label="类型：" label-width="50px" class="mb-1" one-line>
            <el-radio-group v-model="responseType">
                <el-radio label="json" size="small">JSON</el-radio>
                <el-radio label="image" size="small">图片</el-radio>
                <el-radio label="file" size="small">文件</el-radio>
                <el-radio label="text" size="small">Text</el-radio>
            </el-radio-group>
        </s-label-value>
        <div v-show="responseType === 'json'" class="editor-wrap">
            <s-json-editor v-model="jsonValue"></s-json-editor>
        </div>
        <div v-if="responseType === 'image'" class="img-wrap">
            <s-label-value label-width="50px" label="格式：" one-line>
                <el-radio-group v-model="imageType">
                    <el-radio label="png" size="small">PNG</el-radio>
                    <el-radio label="jpg" size="small">JPG/JPEG</el-radio>
                    <el-radio label="gif" size="small">GIF</el-radio>
                    <el-radio label="svg" size="small">SVG</el-radio>
                </el-radio-group>
            </s-label-value>
            <s-label-value label-width="100px" label="图片宽度：" width="40%">
                <el-input-number v-model="imageWidth" size="small" controls-position="right" :min="20" :max="9999" :step="10"></el-input-number>
            </s-label-value>
            <s-label-value label-width="150px" label="图片高度：" width="40%">
                <el-input-number v-model="imageHeight" size="small" controls-position="right" :min="20" :max="9999" :step="10"></el-input-number>
            </s-label-value>
            <s-label-value label-width="100px" label="文字大小：" width="40%">
                <el-input-number v-model="imageFontSize" size="small" controls-position="right" :min="12" :max="100" :step="1"></el-input-number>
            </s-label-value>
            <s-label-value label-width="150px" label="增大图片体积(KB)：" width="40%">
                <el-input-number v-model="imageSize" size="small" controls-position="right" :min="0" :step="100" :max="1024 * 1024 * 1024"></el-input-number>
            </s-label-value>
            <s-label-value label-width="100px" label="背景颜色：" width="30%">
                <el-color-picker v-model="imageBackgroundColor" />
            </s-label-value>
            <s-label-value label-width="100px" label="文字颜色：" width="30%">
                <el-color-picker v-model="imageTextColor" />
            </s-label-value>
            <!-- <img :src="dataUrl" alt="mock图片" class="d-flex"> -->
            <div ref="image" class="image-demo" :style="{ backgroundColor: imageBackgroundColor, width: imageWidth + 'px', height: imageHeight + 'px' }">
                <div :style="{color: imageTextColor, fontSize: imageFontSize + 'px'}">{{ imageWidth }} x {{ imageHeight }}</div>
                <div :style="{color: imageTextColor, fontSize: imageFontSize / 1.2 + 'px'}">{{ formatBytes(realImageSize) }}</div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, WatchStopHandle, nextTick } from "vue";
import html2canvas from "html2canvas";
import { store } from "@/store";
import { formatBytes } from "@/helper/index"
import { ApidocDetail } from "@@/global";
/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| 返回数据类型
|--------------------------------------------------------------------------
*/
const responseType = computed<ApidocDetail["mockInfo"]["responseType"]>({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.responseType;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockResponseType", val)
    },
})
/*
|--------------------------------------------------------------------------
| json数据类型
|--------------------------------------------------------------------------
*/
const jsonValue = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.json;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockJsonValue", val)
    },
})
/*
|--------------------------------------------------------------------------
| 图片相关
|--------------------------------------------------------------------------
*/
const image = ref<HTMLElement | null>(null);
const dataUrl = ref("")
const realImageSize = ref(0);
const imageType = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.image.type;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockImageType", val)
    },
})
const imageWidth = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.image.width;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockImageWidth", val)
    },
})
const imageHeight = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.image.height;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockImageHeight", val)
    },
})
const imageSize = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.image.size;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockImageSize", val)
    },
})
const imageTextColor = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.image.color;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockImageColor", val)
    },
})
const imageBackgroundColor = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.image.backgroundColor;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockImageBackgroundColor", val)
    },
})
const imageFontSize = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.image.fontSize;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockImageFontSize", val)
    },
})
const watchFlag = ref<WatchStopHandle | null>(null);

onMounted(() => {
    watchFlag.value = watch([imageWidth, imageHeight, imageTextColor, imageBackgroundColor, imageFontSize, imageSize], () => {
        console.log(html2canvas, nextTick, dataUrl)
        realImageSize.value = imageSize.value * 1024
    }, {
        deep: true,
        immediate: true
    })
})
onBeforeUnmount(() => {
    if (watchFlag.value) {
        watchFlag.value();
    }
})

</script>

<style lang="scss" scoped>
.mock-response {
    .editor-wrap {
        height: calc(100vh - #{size(580)});
        min-height: size(200);
        border: 1px solid $gray-500;
        display: flex;
        .mock-json-editor {
            height: 100%;
            border-right: 1px solid $gray-500;
        }
    }
    .img-wrap {
        // height: calc(100vh - #{size(620)});
        min-height: size(200);
    }
    .image-demo {
        // position: fixed;
        // left: -99999px;
        // top: -99999px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
}
</style>
