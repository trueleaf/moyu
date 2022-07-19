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
        <div v-if="responseType === 'json'" class="editor-wrap">
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
            <s-label-value label-width="50px" label="宽度：" width="30%">
                <el-input-number v-model="imageWidth" size="small" controls-position="right" :min="20" :max="9999" :step="10"></el-input-number>
            </s-label-value>
            <s-label-value label-width="50px" label="高度：" width="30%">
                <el-input-number v-model="imageHeight" size="small" controls-position="right" :min="20" :max="9999" :step="10"></el-input-number>
            </s-label-value>
            <s-label-value label-width="100px" label="文字大小：" width="30%">
                <el-input-number v-model="imageFontSize" size="small" controls-position="right" :min="12" :max="100" :step="1"></el-input-number>
            </s-label-value>
            <s-label-value label-width="100px" label="背景颜色：" width="30%">
                <el-color-picker v-model="imageBackgroundColor" />
            </s-label-value>
            <s-label-value label-width="100px" label="文字颜色：" width="30%">
                <el-color-picker v-model="imageTextColor" />
            </s-label-value>
            <img :src="dataUrl" alt="mock图片" class="d-flex">
        </div>
        <div ref="image" class="image-demo" :style="{ backgroundColor: imageBackgroundColor, width: imageWidth + 'px', height: imageHeight + 'px' }">
            <div :style="{color: imageTextColor, fontSize: imageFontSize + 'px'}">{{ imageWidth }} x {{ imageHeight }}</div>
            <div :style="{color: imageTextColor, fontSize: imageFontSize / 1.2 + 'px'}">{{ formatBytes(imageSize) }}</div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, WatchStopHandle } from "vue";
import html2canvas from "html2canvas";
import { store } from "@/store";
import { formatBytes } from "@/helper/index"
import { nextTick } from "process";
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
const responseType = computed({
    get() {
        return store.state["apidoc/mock"].responseType;
    },
    set(val) {
        store.commit("apidoc/mock/changeResponseType", val)
    },
})
/*
|--------------------------------------------------------------------------
| json数据类型
|--------------------------------------------------------------------------
*/
const jsonValue = computed({
    get() {
        return store.state["apidoc/mock"].json;
    },
    set(val) {
        store.commit("apidoc/mock/changeJsonValue", val)
    },
})
/*
|--------------------------------------------------------------------------
| 图片相关
|--------------------------------------------------------------------------
*/
const image = ref<HTMLElement | null>(null);
const dataUrl = ref("")
const imageType = computed({
    get() {
        return store.state["apidoc/mock"].image.type;
    },
    set(val) {
        store.commit("apidoc/mock/changeImageType", val)
    },
})
const imageWidth = computed({
    get() {
        return store.state["apidoc/mock"].image.width;
    },
    set(val) {
        store.commit("apidoc/mock/changeImageWidth", val)
    },
})
const imageHeight = computed({
    get() {
        return store.state["apidoc/mock"].image.height;
    },
    set(val) {
        store.commit("apidoc/mock/changeImageHeight", val)
    },
})
const imageSize = computed({
    get() {
        return store.state["apidoc/mock"].image.size;
    },
    set(val) {
        store.commit("apidoc/mock/changeImageSize", val)
    },
})
const imageTextColor = computed({
    get() {
        return store.state["apidoc/mock"].image.color;
    },
    set(val) {
        store.commit("apidoc/mock/changeImageColor", val)
    },
})
const imageBackgroundColor = computed({
    get() {
        return store.state["apidoc/mock"].image.backgroundColor;
    },
    set(val) {
        store.commit("apidoc/mock/changeImageBackgroundColor", val)
    },
})
const imageFontSize = computed({
    get() {
        return store.state["apidoc/mock"].image.fontSize;
    },
    set(val) {
        store.commit("apidoc/mock/changeImageFontSize", val)
    },
})
const watchFlag = ref<WatchStopHandle | null>(null);

onMounted(() => {
    watchFlag.value = watch([imageWidth, imageHeight, imageTextColor, imageBackgroundColor, imageFontSize], () => {
        nextTick(() => {
            if (image.value) {
                html2canvas(image.value, {
                    logging: true,
                }).then(canvas => {
                    store.commit("apidoc/mock/changeImageSize", dataUrl.value.length)
                    dataUrl.value = canvas.toDataURL();
                }).catch(err => {
                    console.error(err);
                });
            }
        })
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
        height: calc(100vh - #{size(620)});
        min-height: size(200);
        border: 1px solid $gray-500;
    }
    .img-wrap {
        // height: calc(100vh - #{size(620)});
        min-height: size(200);
    }
    .image-demo {
        position: fixed;
        left: -99999px;
        top: -99999px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
}
</style>
