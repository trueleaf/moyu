/*
    创建者：shuxiaokai
    创建时间：2020-12-21 21:53
    模块名称：返回值展示组件
    备注：xxxx
*/
<template>
    <div class="response-view">
        <div class="d-flex a-center mb-2">
            <div>
                <span>状态码：</span>
                <template v-if="response.statusCode">
                    <span v-show="response.statusCode >= 100 && response.statusCode < 300" class="green">{{ response.statusCode }}</span>
                    <span v-show="response.statusCode >= 300 && response.statusCode < 400" class="orange">{{ response.statusCode }}</span>
                    <span v-show="response.statusCode >= 400" class="red">{{ response.statusCode }}</span>
                </template>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div>
                <span>时长：</span>
                <template v-if="response.rt">
                    <span v-show="response.rt >= 0 && response.rt < 2000" class="green">{{ formatMs }}</span>
                    <span v-show="response.rt >= 2000 && response.rt < 5000" class="orange">{{ formatMs }}</span>
                    <span v-show="response.status >= 5000" class="red">{{ formatMs }}</span>
                </template>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div>
                <span>大小：</span>
                <template v-if="response.size">
                    <span v-show="response.size >= 0 && response.size < 10000" class="green">{{ formatBytes }}</span>
                    <span v-show="response.size >= 10000 && response.size < 15000" class="orange">{{ formatBytes }}</span>
                    <span v-show="response.status >= 15000" class="red">{{ formatBytes }}</span>
                </template>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div class="d-flex a-center j-center">
                <span>格式：</span>
                <s-ellipsis-content v-if="response.mime" :value="response.mime" max-width="200px"></s-ellipsis-content>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
        </div>
        <el-tabs v-model="activeName">
            <el-tab-pane label="返回值" name="s-a">
                <div v-if="response.mime">
                    <!-- svg图片 -->
                    <div v-if="response.mime.includes('image/svg+xml')" v-html="response.value"></div>
                    <!-- json格式 -->
                    <s-json v-else-if="response.mime.includes('application/json')" :data="JSON.parse(response.value)"></s-json>
                    <!-- 其他图片类型 -->
                    <el-image 
                        v-else-if="response.mime.includes('image/')"
                        class="img-view"
                        :src="response.value"
                        :preview-src-list="[response.value]"
                        fit="scale-down"
                    >
                    </el-image>
                    <!-- 音频类型 -->
                    <!-- 视频类型 -->
                    <!-- 强制下载类型 -->
                    <div v-else-if="response.mime.includes('application/octet-stream')">
                        <i class="iconicon_weizhiwenjian"></i>
                    </div>
                    <!-- excel -->
                    <div v-else-if="response.mime.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || response.mime.includes('application/vnd.ms-excel')">
                        <svg class="res-icon" aria-hidden="true" title="Excel">
                            <use xlink:href="#iconexcel"></use>
                        </svg> 
                    </div>
                    <!-- word -->
                    <div v-else-if="response.mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || response.mime.includes('application/msword')">
                        <svg class="res-icon" aria-hidden="true" title="Excel">
                            <use xlink:href="#iconWORD"></use>
                        </svg> 
                    </div>
                    <!-- pdf -->
                    <iframe v-else-if="response.mime.includes('application/pdf')" :src="response.value" class="pdf-view"></iframe>
                    <!-- xml -->
                    <pre v-else-if="response.mime.includes('application/xml')">{{ response.value }}</pre>
                    <!-- javascript -->
                    <pre v-else-if="response.mime.includes('application/javascript')">{{ response.value }}</pre>
                    <!-- 文本类型 -->
                    <pre v-else-if="response.mime.includes('text/')">{{ response.value }}</pre>
                    <div v-else>
                        <svg class="res-icon" aria-hidden="true" :title="response.mime">
                            <use xlink:href="#iconicon_weizhiwenjian"></use>
                        </svg> 
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="Cookie" name="s-b"> </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
export default {
    props: {
        response: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    computed: {
        formatBytes() {
            return this.$helper.formatBytes(this.response.size);
        },
        formatMs() {
            return this.$helper.formatMs(this.response.rt);
        },
        // responseParams() { //返回参数(对象类型)
        //     const copyData = JSON.parse(JSON.stringify(this.requestData.responseParams)); //扁平数据拷贝
        //     const result = this.convertPlainParamsToTreeData(copyData);
        //     return result;
        // },
    },
    data() {
        return {
            activeName: "s-a"
        };
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.response-view {
    padding: size(10);
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
