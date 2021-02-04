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
            <div v-if="remoteResponse.mime.includes('image/svg+xml')" v-html="remoteResponse.value"></div>
            <!-- json格式 -->
            <s-json-view v-else-if="remoteResponse.mime.includes('application/json')" :data="JSON.parse(remoteResponse.value)" @export="handleExport"></s-json-view>
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
            </div>
            <!-- excel -->
            <div v-else-if="remoteResponse.mime.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || remoteResponse.mime.includes('application/vnd.ms-excel')">
                <svg class="res-icon" aria-hidden="true" title="Excel">
                    <use xlink:href="#iconexcel"></use>
                </svg>
            </div>
            <!-- word -->
            <div v-else-if="remoteResponse.mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || remoteResponse.mime.includes('application/msword')">
                <svg class="res-icon" aria-hidden="true" title="Excel">
                    <use xlink:href="#iconWORD"></use>
                </svg>
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
            <div v-if="!config.isElectron">等待发送请求</div>
            <div v-else class="f-bg">
                <div class="mb-2">
                    <i slot="reference" class="el-icon-warning orange mr-2"></i>
                    <span>因浏览器限制，请在Electron环境进行请求发送</span>
                </div>
                <div>
                    <a href="https://gitee.com/shuzhikai/moyu/attach_files/573739/download/Setup.0.1.3.exe">下载Electron</a>
                </div>
            </div>
        </s-empty>
    </s-loading>
</template>

<script>
import beautify from "js-beautify"

export default {
    computed: {
        remoteResponse() { //远端返回数据结果
            return this.$store.state.apidoc.remoteResponse;
        },
        //发送请求状态
        loading() {
            return this.$store.state.apidoc.sendRequestLoading;
        },
    },
    data() {
        return {
            //=================================表单与表格参数================================//

            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //导出数据
        handleExport(data) {
            const copyData = JSON.parse(JSON.stringify(data))
            this.$helper.dfsForest(copyData, {
                rCondition(value) {
                    return value.children;
                },
                rKey: "children",
                hooks: (val) => {
                    if (!val.description) {
                        this.$set(val, "description", "");
                    }
                    Object.assign(val, {
                        id: this.$helper.uuid(),
                        required: true, //-------是否必填
                    })
                },
            });
            copyData.push(this.generateParams());
            this.requestData.responseParams = copyData
        },
        //美化html文件
        beautifyHtml(str) {
            return beautify.html(str, { indent_size: 4 })
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
