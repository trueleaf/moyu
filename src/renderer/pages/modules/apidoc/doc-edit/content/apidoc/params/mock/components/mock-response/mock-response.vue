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
                <el-radio label="customJson" size="small">自定义返回逻辑</el-radio>
            </el-radio-group>
        </s-label-value>
        <div v-if="responseType === 'json'" class="editor-wrap">
            <s-json-editor ref="jsonComponent" v-model="jsonValue"></s-json-editor>
            <el-button class="mock" text @click.stop="showMockTip = !showMockTip">
                <el-popover
                    :visible="showMockTip"
                    placement="top-start"
                    trigger="manual"
                    width="auto"
                >
                    <s-mock auto-copy @select="handleSelectMockStr"></s-mock>
                    <template #reference>
                        <span>Mock语法</span>
                    </template>
                </el-popover>
            </el-button>
            <el-button type="primary" text class="format-btn" @click="handleFormat">格式化</el-button>
            <div v-if="isShowJsonTip" class="tip">
                <span>若不填写任何数据，mock结果会取返回参数数据，反之则会以填写数据作为mock结果</span>
                <span class="cursor-pointer d-flex a-center" @click="handleCloseTip">不再显示</span>
            </div>
        </div>
        <div v-if="responseType === 'image'" class="img-wrap">
            <s-label-value label-width="50px" label="格式：" one-line>
                <el-radio-group v-model="imageType">
                    <el-radio label="png" size="small">PNG</el-radio>
                    <el-radio label="jpg" size="small">JPG/JPEG</el-radio>
                    <el-radio label="gif" size="small">GIF</el-radio>
                    <el-radio label="svg" size="small" disabled title="还未实现">SVG</el-radio>
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
        <div v-if="responseType === 'file'" class="download-wrap">
            <div class="item" :class="{active: selectedType === 'doc'}" @click="selectedType = 'doc'">
                <svg class="svg-icon" aria-hidden="true">
                    <use xlink:href="#iconWORD"></use>
                </svg>
                <div class="mt-1">DOC</div>
            </div>
            <div class="item" :class="{active: selectedType === 'docx'}" @click="selectedType = 'docx'">
                <svg class="svg-icon" aria-hidden="true">
                    <use xlink:href="#iconWORD"></use>
                </svg>
                <div class="mt-1">DOCX</div>
            </div>
            <div class="item" :class="{active: selectedType === 'xls'}" @click="selectedType = 'xls'">
                <svg class="svg-icon" aria-hidden="true">
                    <use xlink:href="#iconexcel"></use>
                </svg>
                <div class="mt-1">XLS</div>
            </div>
            <div class="item" :class="{active: selectedType === 'xlsx'}" @click="selectedType = 'xlsx'">
                <svg class="svg-icon" aria-hidden="true">
                    <use xlink:href="#iconexcel"></use>
                </svg>
                <div class="mt-1">XLSX</div>
            </div>
            <div class="item" :class="{active: selectedType === 'pdf'}" @click="selectedType = 'pdf'">
                <svg class="svg-icon" aria-hidden="true">
                    <use xlink:href="#iconpdfwenjian"></use>
                </svg>
                <div class="mt-1">PDF</div>
            </div>
            <div class="item" :class="{active: selectedType === 'zip'}" @click="selectedType = 'zip'">
                <svg class="svg-icon" aria-hidden="true">
                    <use xlink:href="#iconyasuobao"></use>
                </svg>
                <div class="mt-1">ZIP</div>
            </div>
            <div class="item" :class="{active: selectedType === 'custom'}" @click="selectedType = 'custom'">
                <img src="@/assets/imgs/logo.png" alt="moyu" class="img">
                <div class="mt-1">自定义</div>
            </div>
        </div>
        <div v-if="responseType === 'text'" class="raw-editor-wrap">
            <s-raw-editor v-model="rawText"></s-raw-editor>
        </div>
        <div v-if="responseType === 'customJson'" class="editor-wrap">
            <s-custom-editor v-model="customResponseScript"></s-custom-editor>
        </div>
        <el-upload
            v-if="responseType === 'file' && selectedType === 'custom'"
            ref="uploadInstance"
            :auto-upload="false"
            class="mt-3"
            action="/"
            :limit="1"
            :on-exceed="handleExceed"
            :before-upload="handleCheckSize"
            @change="handleSelectFile"
        >
            <template #trigger>
                <div>
                    <el-button type="primary">选择文件</el-button>
                </div>
            </template>
            <template #tip>
                <div>若自定义文件大小超过20kb，则无法保存到服务端，并且只会在本地生效</div>
                <div>文件名称：{{ fileInfo.name }}</div>
                <div>文件大小：{{ formatBytes(fileInfo.size) }}</div>
                <div>文件路径：{{ filePath }}</div>
            </template>
            <template #file>&nbsp;</template>
        </el-upload>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, onBeforeUnmount, WatchStopHandle, Ref } from "vue";
import { ElMessage } from "element-plus"
import { genFileId, UploadInstance, UploadProps, UploadRawFile } from "element-plus/lib/components/upload/src/upload";
import { UploadFile } from "element-plus/es/components";
import { store } from "@/store";
import { formatBytes } from "@/helper/index"
import { ApidocDetail } from "@@/global";
import { apidocCache } from "@/cache/apidoc";
import sCustomEditor from "./components/custom-editor.vue"

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
const isShowJsonTip = ref(apidocCache.getIsShowApidocMockParamsJsonTip());
const jsonValue = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.json;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockJsonValue", val)
    },
})
//不再显示提示
const handleCloseTip = () => {
    apidocCache.setIsShowApidocMockParamsJsonTip(false);
    isShowJsonTip.value = false;
}
//是否显示mock提示
const showMockTip = ref(false)
//选中mock数据
const handleSelectMockStr = () => {
    showMockTip.value = false;
}
const jsonComponent: Ref<null | {
    format: () => void,
}> = ref(null)
//格式化数据
const handleFormat = () => {
    jsonComponent.value?.format();
}
/*
|--------------------------------------------------------------------------
| 图片相关
|--------------------------------------------------------------------------
*/
const image = ref<HTMLElement | null>(null);
// const dataUrl = ref("")
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
/*
|--------------------------------------------------------------------------
| 文件相关
|--------------------------------------------------------------------------
*/
//选中的文件类型
const selectedType = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.file.type
    },
    set(type) {
        store.commit("apidoc/apidoc/changeMockFileType", type)
    }
})
const filePath = computed(() => store.state["apidoc/apidoc"].apidoc.mockInfo.file.filePath)
const fileInfo = ref({
    name: "",
    size: 0,
    type: "",
});
const uploadInstance = ref<UploadInstance>()
//选择文件
const handleSelectFile = async (file: UploadFile) => {
    store.commit("apidoc/apidoc/changeCustomFile", (file.raw as File).path)
    fileInfo.value.name = file.name;
    fileInfo.value.size = file.size || 0;
}
//检查文件大小
const handleCheckSize: UploadProps["beforeUpload"] = (rawFile) => {
    if (rawFile.size > 2 * 1024 * 10) {
        ElMessage.warning("超过20KB文件仅支持本地mock")
    }
    return true
}
//覆盖文件
const handleExceed: UploadProps["onExceed"] = (files) => {
    uploadInstance.value?.clearFiles()
    const file = files[0] as UploadRawFile
    file.uid = genFileId()
    uploadInstance.value?.handleStart(file)
}
/*
|--------------------------------------------------------------------------
| raw类型文本数据
|--------------------------------------------------------------------------
*/
const rawText = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.text;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeMockTextValue", val);
    }
})
/*
|--------------------------------------------------------------------------
| 自定义返回数据逻辑
|--------------------------------------------------------------------------
*/
const customResponseScript = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.mockInfo.customResponseScript;
    },
    set(val) {
        store.commit("apidoc/apidoc/changeCustomResponseScript", val);
    }
})
const watchFlag = ref<WatchStopHandle | null>(null);
onMounted(() => {
    document.body.addEventListener("click", () => {
        showMockTip.value = false;
    })
    watchFlag.value = watch([imageWidth, imageHeight, imageTextColor, imageBackgroundColor, imageFontSize, imageSize], () => {
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
        height: calc(100vh - #{size(610)});
        min-height: size(200);
        border: 1px solid $gray-500;
        display: flex;
        position: relative;
        .mock-json-editor {
            height: 100%;
            border-right: 1px solid $gray-500;
        }
        .tip {
            width: 100%;
            bottom: size(0);
            height: size(25);
            display: flex;
            align-items: center;
            background-color: $orange;
            color: $white;
            position: absolute;
            text-indent: 1em;
        }
        .mock {
            position: absolute;
            top: size(0);
            right: size(70);
            z-index: 1;
            background-color: $white;
            color: $theme-color;
            cursor: pointer;
        }
        .format-btn {
            position: absolute;
            right: size(10);
            top: size(0);
        }
    }
    .raw-editor-wrap {
        height: calc(100vh - #{size(610)});
        min-height: size(200);
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
    .download-wrap {
        display: flex;
        .item {
            width: size(70);
            height: size(70);
            padding: size(10);
            margin-right: size(20);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            border: 1px solid transparent;
            &.active {
                border: 1px solid $gray-400;
                box-shadow: $box-shadow-sm;
            }
            &:hover {
                border: 1px solid $gray-400;
            }
            .svg-icon {
                width: size(40);
                height: size(40);
            }
            .img {
                width: size(28);
                height: size(28);
            }
        }
    }
}
</style>
