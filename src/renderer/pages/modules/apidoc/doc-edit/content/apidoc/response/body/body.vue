/*
    创建者：shuxiaokai
    创建时间：2021-09-03 20:45
    模块名称：返回body
    备注：
*/
<template>
    <div class="body-view" :class="{ vertical: layout === 'vertical' }">
        <template v-if="remoteResponse.data.type">
            <!-- 图片类型 -->
            <el-image
                v-if="remoteResponse.data.type.includes('image/')"
                class="img-view"
                :src="remoteResponse.data.file.url"
                :preview-src-list="[remoteResponse.data.file.url]"
                fit="scale-down"
            >
            </el-image>
            <!-- 音频类型 -->
            <!-- 视频类型 -->
            <!-- 强制下载类型 -->
            <div v-else-if="remoteResponse.data.type.includes('application/octet-stream')" class="d-flex flex-column a-center">
                <svg class="svg-icon" aria-hidden="true" :title="$t('下载文件')">
                    <use xlink:href="#iconicon_weizhiwenjian"></use>
                </svg>
                <div>{{ remoteResponse.data.type }}</div>
                <el-button link type="primary" text @click="handleDownload">{{ $t("下载文件") }}</el-button>
            </div>
            <div v-else-if="remoteResponse.data.type.includes('application/force-download')" class="d-flex flex-column j-center">
                <svg class="svg-icon" aria-hidden="true" :title="$t('下载文件')">
                    <use xlink:href="#iconicon_weizhiwenjian"></use>
                </svg>
                <div>{{ remoteResponse.data.type }}</div>
                <el-button link type="primary" text @click="handleDownload">{{ $t("下载文件") }}</el-button>
            </div>
            <!-- excel -->
            <div v-else-if="remoteResponse.data.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || remoteResponse.data.type.includes('application/vnd.ms-excel')" class="d-flex flex-column j-center">
                <svg class="svg-icon" aria-hidden="true" :title="$t('下载文件')">
                    <use xlink:href="#iconexcel"></use>
                </svg>
                <div>{{ remoteResponse.data.type }}</div>
                <el-button link type="primary" text @click="handleDownload">{{ $t("下载文件") }}</el-button>
            </div>
            <!-- word -->
            <div v-else-if="remoteResponse.data.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || remoteResponse.data.type.includes('application/msword')" class="d-flex flex-column j-center">
                <svg class="svg-icon" aria-hidden="true" :title="$t('下载文件')">
                    <use xlink:href="#iconWORD"></use>
                </svg>
                <div>{{ remoteResponse.data.type }}</div>
                <el-button link type="primary" text @click="handleDownload">{{ $t("下载文件") }}</el-button>
            </div>
            <!-- pdf -->
            <iframe v-else-if="remoteResponse.data.type.includes('application/pdf')" :src="remoteResponse.data.file.url" class="pdf-view"></iframe>
            <!-- xml -->
            <pre v-else-if="remoteResponse.data.type.includes('application/xml')">{{ remoteResponse.data.text }}</pre>
            <!-- javascript -->
            <pre v-else-if="remoteResponse.data.type.includes('application/javascript')">{{ remoteResponse.data.text }}</pre>
            <!-- 请求错误 -->
            <div v-else-if="remoteResponse.data.type.includes('error')" class="red">{{ remoteResponse.data.text }}</div>
            <!-- html -->
            <div v-else-if="remoteResponse.data.type.includes('text/html')" class="text-wrap">
                <s-raw-editor :model-value="htmlResponse" readonly type="text/plain"></s-raw-editor>
            </div>
            <!-- 纯文本 -->
            <div v-else-if="remoteResponse.data.type.includes('text/plain')" class="text-wrap">
                <s-raw-editor
                    :model-value="textResponse"
                    readonly
                    type="text/plain"
                >
                </s-raw-editor>
            </div>
            <!-- 未知文件 -->
            <div v-else-if="!remoteResponse.data.type.includes('application/json')">
                <svg class="svg-icon" aria-hidden="true" :title="$t('下载文件')">
                    <use xlink:href="#iconicon_weizhiwenjian"></use>
                </svg>
                <div>{{ remoteResponse.data.type }}</div>
                <el-button link type="primary" text @click="handleDownload">{{ $t("下载文件") }}</el-button>
            </div>
            <!-- json -->
            <div v-show="remoteResponse.data.type.includes('application/json')">
                <div class="json-wrap">
                    <!-- <pre>{{ jsonResponse }}</pre> -->
                    <!-- <s-json-editor :model-value="jsonResponse" read-only></s-json-editor>
                    <div class="tip">由于性能原因，只能展示5kb(1024*5个字符)数据</div> -->
                    <s-raw-editor :model-value="jsonResponse" readonly type="application/json"></s-raw-editor>
                    <div v-show="showTip" class="tip">
                        <span>由于性能原因，只能展示40kb数据</span>
                        <span v-show="!couldShowAllJsonStr" class="white cursor-pointer ml-3" @click="couldShowAllJsonStr = !couldShowAllJsonStr">显示全部</span>
                        <span v-show="couldShowAllJsonStr" class="white cursor-pointer ml-3" @click="couldShowAllJsonStr = !couldShowAllJsonStr">显示部分</span>
                    </div>
                </div>
            </div>
        </template>
        <div v-show="showProcess" class="d-flex j-center w-100">
            <span>{{ $t("总大小") }}：{{ $helper.formatBytes(process.total) }}</span>
            <el-divider direction="vertical"></el-divider>
            <span>{{ $t("已传输") }}：{{ $helper.formatBytes(process.transferred) }}</span>
            <el-divider direction="vertical"></el-divider>
            <span>{{ $t("进度") }}：{{ (process.percent * 100 ).toFixed(2) + "%" }}</span>
        </div>
        <!-- <div v-show="remoteResponse.data.type.includes('application/json')" class="apply-response">应用为响应值</div> -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import beautify from "js-beautify"
import { ApidocProperty } from "@@/global";

type ResponseApplyEnum = {
    index: number,
    title: string,
    contentType: string,
}

export default defineComponent({
    data() {
        return {
            couldShowAllJsonStr: false,
        };
    },
    computed: {
        //远端返回数据结果
        remoteResponse() {
            return this.$store.state["apidoc/response"]
        },
        //数据是否完全返回
        loading() {
            return this.$store.state["apidoc/response"].loading
        },
        //数据加载进度
        process() {
            return this.$store.state["apidoc/response"].process
        },
        //是否展示数据加载进度
        showProcess() {
            const remoteResponse = this.$store.state["apidoc/response"];
            const dataType = remoteResponse.data.type;
            if (!dataType) { //没有返回类型，不显示进度
                return false;
            }
            const isError = dataType.includes("error");
            const isText = dataType.includes("text");
            const isJson = dataType.includes("application/json");
            // const isPdf = dataType.includes("application/pdf");
            const isXml = dataType.includes("application/xml");
            const isJavascript = dataType.includes("application/javascript");
            return !isError && !isText && !isJson && !isXml && !isJavascript;
        },
        //布局
        layout() {
            return this.$store.state["apidoc/baseInfo"].layout;
        },
        //json返回参数
        jsonResponse() {
            const data = this.$store.state["apidoc/response"].data.text;
            const formatCode = beautify(data, { indent_size: 4 });
            if (this.couldShowAllJsonStr) {
                return formatCode;
            }
            if (formatCode.length > 1024 * 40) {
                return formatCode.slice(0, 1024 * 40);
            }
            return JSON.stringify(JSON.parse(formatCode), null, 4);
        },
        //json数据过大是否显示提示
        showTip() {
            const data = this.$store.state["apidoc/response"].data.text;
            const formatCode = beautify(data, { indent_size: 4 });
            return formatCode.length > 1024 * 40
        },
        //HTML返回参数
        htmlResponse() {
            const data = this.$store.state["apidoc/response"].data.text;
            return beautify.html(data, { indent_size: 4 });
        },
        //HTML返回时预览
        htmlPreview() {
            const data = this.$store.state["apidoc/response"].data.text;
            const blob = new Blob([data], {
                type: "text/html"
            });
            const url = URL.createObjectURL(blob);
            return url;
        },
        //纯文本返回参数
        textResponse() {
            const data = this.$store.state["apidoc/response"].data.text;
            return data;
        },
        //返回值类型
        responseApplyEnum() {
            return this.$store.state["apidoc/apidoc"].apidoc.item.responseParams.filter(v => v.value.dataType === "application/json").map((v, index) => ({
                index,
                title: v.title,
                contentType: v.value.dataType
            }));
        },
    },
    methods: {
        //美化html文件
        beautifyHtml(str: string) {
            return str;
        },
        //应用为响应值
        handleApplyResponse(item: ResponseApplyEnum, index: number) {
            const convertData = this.$helper.apidocConvertJsonDataToParams(JSON.parse(this.jsonResponse), (p: ApidocProperty) => {
                const mindData = this.$store.state["apidoc/baseInfo"].mindParams.filter(v => v.paramsPosition === "responseParams");
                const matchedData = mindData.find(v => v.key === p.key);
                if (matchedData) {
                    p.description = matchedData.description;
                    // p.value = matchedData.value;
                }
                return "";
            }, true);
            this.$store.commit("apidoc/apidoc/changeResponseByIndex", { index, value: convertData })
        },
        //下载文件
        handleDownload() {
            const fileInfo = this.remoteResponse.data.file
            const downloadElement = document.createElement("a");
            downloadElement.href = fileInfo.url;
            downloadElement.download = fileInfo.name || this.$t("未命名"); //下载后文件名
            document.body.appendChild(downloadElement);
            downloadElement.click(); //点击下载
            document.body.removeChild(downloadElement); //下载完成移除元素
            window.URL.revokeObjectURL(fileInfo.url); //释放掉blob对象
            console.log(this.remoteResponse)
        }
    },
})
</script>

<style lang="scss">
.body-view {
    width: 100%;
    height: calc(100vh - #{size(370)});
    overflow-y: auto;
    position: relative;
    &.vertical {
        height: 100%;
    }
    .json-wrap {
        height: calc(100vh - #{size(400)});
        position: relative;
        .tip {
            width: 100%;
            padding: size(5) size(10);
            background-color: $orange;
            position: absolute;
            bottom: -size(30);
            z-index: $zIndex-contextmenu;
            color: $white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
    .apply-response {
        position: absolute;
        cursor: pointer;
        right: size(15);
        top: size(0);
        z-index: $zIndex-contextmenu;
    }
    .text-wrap {
        height: 100%;
    }
    .operation {
        height: size(30);
        padding: 0 size(20);
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: $gray-300;
    }
    .img-view {
        width: size(200);
        height: size(200);
    }
    .pdf-view {
        width: 100%;
        height: size(300);
    }
    .res-icon {
        width: size(200);
        height: size(200);
    }
}
</style>
