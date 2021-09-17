/*
    创建者：shuxiaokai
    创建时间：2021-09-03 20:45
    模块名称：返回body
    备注：
*/
<template>
    <s-loading :loading="loading" class="body-view" :class="{ vertical: layout === 'vertical' }">
        <template v-if="remoteResponse.data.type">
            <!-- svg图片 -->
            <div v-if="remoteResponse.data.type.includes('image/svg+xml')">svg</div>
            <!-- json格式 -->
            <!-- <s-json-view v-else-if="remoteResponse.data.type.includes('application/json')" :data="JSON.parse(remoteResponse.data.text)">
                <div slot="header" class="operation">
                    <el-dropdown trigger="click" size="small">
                        <span>
                            <span class="gray-300 hover-gray-100 cursor-pointer">应用为响应值</span>
                            <i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item v-for="(item, index) in responseParams" :key="index" @click.native="handleApplyResponse(item)">
                                <span class="mr-1">应用为</span>
                                <span>{{ item.title }}</span>
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                    <div v-copy="jsonResponse" class="hover-gray-100 cursor-pointer">复制为json</div>
                    <div class="ml-3 hover-gray-100 cursor-pointer" @click="handleClearRemoteResponse">清空</div>
                </div>
            </s-json-view> -->
            <!-- 其他图片类型 -->
            <el-image
                v-else-if="remoteResponse.data.type.includes('image/')"
                class="img-view"
                :src="remoteResponse.data.file.url"
                :preview-src-list="[remoteResponse.data.file.url]"
                fit="scale-down"
            >
            </el-image>
            <!-- 音频类型 -->
            <!-- 视频类型 -->
            <!-- 强制下载类型 -->
            <div v-else-if="remoteResponse.data.type.includes('application/octet-stream')">
                <i class="iconicon_weizhiwenjian"></i>
                <s-download :url="remoteResponse.data.file.url" static>
                    <span class="cursor-pointer theme-color">下载</span>
                </s-download>
            </div>
            <div v-else-if="remoteResponse.data.type.includes('application/force-download')">
                <i class="iconicon_weizhiwenjian"></i>
                <s-download :url="remoteResponse.data.file.url" static>
                    <span class="cursor-pointer theme-color">下载</span>
                </s-download>
            </div>
            <!-- excel -->
            <div v-else-if="remoteResponse.data.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || remoteResponse.data.type.includes('application/vnd.ms-excel')">
                <svg class="res-icon" aria-hidden="true" title="Excel">
                    <use xlink:href="#iconexcel"></use>
                </svg>
                <s-download :url="remoteResponse.data.file.url" static>
                    <span class="cursor-pointer theme-color">下载</span>
                </s-download>
            </div>
            <!-- word -->
            <div v-else-if="remoteResponse.data.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || remoteResponse.data.type.includes('application/msword')">
                <svg class="res-icon" aria-hidden="true" title="Excel">
                    <use xlink:href="#iconWORD"></use>
                </svg>
                <s-download :url="remoteResponse.data.file.url" static>
                    <span class="cursor-pointer theme-color">下载</span>
                </s-download>
            </div>
            <!-- pdf -->
            <iframe v-else-if="remoteResponse.data.type.includes('application/pdf')" :src="remoteResponse.data.file.url" class="pdf-view"></iframe>
            <!-- xml -->
            <pre v-else-if="remoteResponse.data.type.includes('application/xml')">{{ remoteResponse.data.text }}</pre>
            <!-- javascript -->
            <pre v-else-if="remoteResponse.data.type.includes('application/javascript')">{{ remoteResponse.data.text }}</pre>
            <!-- 其他文本类型 -->
            <!-- <pre v-else-if="remoteResponse.data.type.includes('text/')">{{ beautifyHtml(remoteResponse.data.text) }}</pre> -->
            <!-- 请求错误 -->
            <div v-else-if="remoteResponse.data.type.includes('error')">{{ remoteResponse.data.text }}</div>
            <!-- HTML文本类型 -->
           
            <!-- <pre v-else-if="remoteResponse.data.type.includes('text/html')">{{ beautifyHtml(remoteResponse.data.text) }}</pre> -->
            <!-- <div v-else>
                <svg class="res-icon" aria-hidden="true" :title="remoteResponse.data">
                    <use xlink:href="#iconicon_weizhiwenjian"></use>
                </svg>
            </div> -->
        </template>
        <div v-show="remoteResponse.data.type.includes('text/html')" class="text-wrap">
            <s-raw-editor
                :model-value="htmlResponse"
                readonly
                type="text/html"
            >
            </s-raw-editor>
        </div>
        <div v-show="remoteResponse.data.type.includes('application/json')" class="text-wrap">
            <s-raw-editor
                :model-value="jsonResponse"
                readonly
                type="application/json"
            >
            </s-raw-editor>
        </div>
    </s-loading>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import beautify from "js-beautify"

export default defineComponent({
    data() {
        return {
        };
    },
    computed: {
        //远端返回数据结果
        remoteResponse() { 
            return this.$store.state["apidoc/response"]
        },
        //发送请求状态
        loading() {
            return this.$store.state["apidoc/response"].loading;
        },
        //布局
        layout() {
            return this.$store.state["apidoc/baseInfo"].layout;
        },
        //json返回参数
        jsonResponse() {
            const data = this.$store.state["apidoc/response"].data.text
            return beautify(data, { indent_size: 4 });
        },
        //HTML返回参数
        htmlResponse() {
            const data = this.$store.state["apidoc/response"].data.text;
            return beautify.html(data, { indent_size: 4 });
        },
    },
    methods: {
        //美化html文件
        beautifyHtml(str: string) {
            // return beautify.html(str, { indent_size: 4 })
            return str;
        },
    },
})
</script>

<style lang="scss">
.body-view {
    width: 100%;
    height: calc(100vh - #{size(370)});
    overflow-y: auto;
    &.vertical {
        height: 100%;
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
