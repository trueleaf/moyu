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
            <s-label-value label-width="50px" label="宽度：" one-line>
                <el-input-number v-model="imageWidth" size="small" :controls="false" :min="20" :max="9999" :step="1"></el-input-number>
            </s-label-value>
            <s-label-value label-width="50px" label="高度：" one-line>
                <el-input-number v-model="imageHeight" size="small" :controls="false" :min="20" :max="9999" :step="1"></el-input-number>
            </s-label-value>
        </div>
        <div ref="image" class="image-demo w-200px h-200px bg-orange">
            <svg>
                <text x="0" y="0">300 x 400</text>
            </svg>
        </div>
        <!-- <img :src="dataUrl" alt=""> -->
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import html2canvas from "html2canvas";
import { store } from "@/store";
/*
|--------------------------------------------------------------------------
| 生命周期
|--------------------------------------------------------------------------
*/
const image = ref<HTMLElement | null>(null);
const dataUrl = ref("")
onMounted(() => {
    if (image.value) {
        html2canvas(image.value, {
            logging: false,
        }).then(canvas => {
            dataUrl.value = canvas.toDataURL();
            // console.log(123, canvas.toDataURL())
        }).catch(err => {
            console.error(err);
        });
    }
})
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
</script>

<style lang="scss" scoped>
.mock-response {
    .editor-wrap {
        height: calc(100vh - #{size(620)});
        min-height: size(200);
        border: 1px solid $gray-500;
    }
    .img-wrap {
        height: calc(100vh - #{size(620)});
        min-height: size(200);
    }
    .image-demo {
        // position: fixed;
        // left: -99999;
        // top: -99999;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
