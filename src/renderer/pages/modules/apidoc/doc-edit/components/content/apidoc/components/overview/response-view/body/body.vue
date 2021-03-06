/*
    创建者：shuxiaokai
    创建时间：2021-01-31 10:51
    模块名称：
    备注：
*/
<template>
    <s-loading :loading="loading" class="body-view">
        <template v-if="remoteResponse.mime">
            <!-- svg图片 -->
            <!-- eslint-disable-next-line vue/no-v-html 感觉上还是有点危险 -->
            <div v-if="remoteResponse.mime.includes('image/svg+xml')" v-html="remoteResponse.value"></div>
            <!-- json格式 -->
            <s-json-view v-else-if="remoteResponse.mime.includes('application/json')" :data="JSON.parse(remoteResponse.value)">
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
            </s-json-view>
            <!-- 其他图片类型 -->
            <el-image
                v-else-if="remoteResponse.mime.includes('image/')"
                class="img-view"
                :src="remoteResponse.value"
                :preview-src-list="[remoteResponse.value]"
                fit="scale-down"
            >
            </el-image>
            <!-- 音频类型 -->
            <!-- 视频类型 -->
            <!-- 强制下载类型 -->
            <div v-else-if="remoteResponse.mime.includes('application/octet-stream')">
                <i class="iconicon_weizhiwenjian"></i>
                <s-download :url="remoteResponse.value" static>
                    <span class="cursor-pointer theme-color">下载</span>
                </s-download>
            </div>
            <div v-else-if="remoteResponse.mime.includes('application/force-download')">
                <i class="iconicon_weizhiwenjian"></i>
                <s-download :url="remoteResponse.value" static>
                    <span class="cursor-pointer theme-color">下载</span>
                </s-download>
            </div>
            <!-- excel -->
            <div v-else-if="remoteResponse.mime.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || remoteResponse.mime.includes('application/vnd.ms-excel')">
                <svg class="res-icon" aria-hidden="true" title="Excel">
                    <use xlink:href="#iconexcel"></use>
                </svg>
                <s-download :url="remoteResponse.value" static>
                    <span class="cursor-pointer theme-color">下载</span>
                </s-download>
            </div>
            <!-- word -->
            <div v-else-if="remoteResponse.mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || remoteResponse.mime.includes('application/msword')">
                <svg class="res-icon" aria-hidden="true" title="Excel">
                    <use xlink:href="#iconWORD"></use>
                </svg>
                <s-download :url="remoteResponse.value" static>
                    <span class="cursor-pointer theme-color">下载</span>
                </s-download>
            </div>
            <!-- pdf -->
            <iframe v-else-if="remoteResponse.mime.includes('application/pdf')" :src="remoteResponse.value" class="pdf-view"></iframe>
            <!-- xml -->
            <pre v-else-if="remoteResponse.mime.includes('application/xml')">{{ remoteResponse.value }}</pre>
            <!-- javascript -->
            <pre v-else-if="remoteResponse.mime.includes('application/javascript')">{{ remoteResponse.value }}</pre>
            <!-- HTML文本类型 -->
            <pre v-else-if="remoteResponse.mime.includes('text/html')">{{ beautifyHtml(remoteResponse.value) }}</pre>
            <!-- 其他文本类型 -->
            <pre v-else-if="remoteResponse.mime.includes('text/')">{{ beautifyHtml(remoteResponse.value) }}</pre>
            <!-- 请求错误 -->
            <pre v-else-if="remoteResponse.mime.includes('error')">{{ remoteResponse.value }}</pre>
            <div v-else>
                <svg class="res-icon" aria-hidden="true" :title="remoteResponse.mime">
                    <use xlink:href="#iconicon_weizhiwenjian"></use>
                </svg>
            </div>
        </template>
        <s-empty v-else>
            <div v-if="config.isElectron">等待发送请求</div>
            <div v-else class="f-bg">
                <div class="mb-2">
                    <i slot="reference" class="el-icon-warning orange mr-2"></i>
                    <span>因浏览器限制，请在Electron环境进行请求发送</span>
                </div>
                <div>
                    <a :href="config.renderConfig.download.gitee">下载Electron</a>
                </div>
            </div>
        </s-empty>
    </s-loading>
</template>

<script>
import beautify from "js-beautify"
import mixin from "@/pages/modules/apidoc/mixin/index"

export default {
    mixins: [mixin],
    computed: {
        remoteResponse() { //远端返回数据结果
            return this.$store.state.apidoc.remoteResponse;
        },
        //发送请求状态
        loading() {
            return this.$store.state.apidoc.sendRequestLoading;
        },
        jsonResponse() { //远程json类型返回参数
            const remoteResponse = this.$store.state.apidoc.remoteResponse || {};
            return JSON.stringify(JSON.parse(remoteResponse.value), null, 4);
        },
        responseParams: { //返回参数
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.responseParams;
            },
            set(val) {
                this.$store.commit("apidoc/changeResponse", val);
            },
        },
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //应用为响应参数
        handleApplyResponse(response) {
            const convertResult = this.convertTreeDataToPlainParams(JSON.parse(this.remoteResponse.value), this.mindParams.responseParams);
            convertResult.push(this.generateProperty());
            response.values = convertResult;
        },
        //美化html文件
        beautifyHtml(str) {
            return beautify.html(str, { indent_size: 4 })
        },
        //清空远端返回
        handleClearRemoteResponse() {
            this.$store.commit("apidoc/clearRespons")
            let remoteResponse = localStorage.getItem("apidoc/remoteResponse") || "{}";
            remoteResponse = JSON.parse(remoteResponse);
            if (remoteResponse[this.currentSelectDoc._id]) {
                delete remoteResponse[this.currentSelectDoc._id];
            }
            localStorage.setItem("apidoc/remoteResponse", JSON.stringify(remoteResponse))
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.body-view {
    width: 100%;
    height: calc(100vh - #{size(400)});
    overflow-y: auto;
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
