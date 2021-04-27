/*
    创建者：shuxiaokai
    创建时间：2020-12-21 21:53
    模块名称：返回值展示组件
    备注：xxxx
*/
<template>
    <div>
        <div class="d-flex a-center">
            <div class="flex0">
                <span>状态码：</span>
                <template v-if="remoteResponse.statusCode">
                    <span v-show="remoteResponse.statusCode >= 100 && remoteResponse.statusCode < 300" class="green">{{ remoteResponse.statusCode }}</span>
                    <span v-show="remoteResponse.statusCode >= 300 && remoteResponse.statusCode < 400" class="orange">{{ remoteResponse.statusCode }}</span>
                    <span v-show="remoteResponse.statusCode >= 400" class="red">{{ remoteResponse.statusCode }}</span>
                </template>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div class="flex0">
                <span>时长：</span>
                <template v-if="remoteResponse.rt">
                    <span v-show="remoteResponse.rt >= 0 && remoteResponse.rt < 2000" class="green">{{ formatMs }}</span>
                    <span v-show="remoteResponse.rt >= 2000 && remoteResponse.rt < 5000" class="orange">{{ formatMs }}</span>
                    <span v-show="remoteResponse.rt >= 5000" class="red">{{ formatMs }}</span>
                </template>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div class="flex0">
                <span>大小：</span>
                <template v-if="remoteResponse.size">
                    <span v-show="remoteResponse.size >= 0 && remoteResponse.size < 10000" class="green">{{ formatBytes }}</span>
                    <span v-show="remoteResponse.size >= 10000 && remoteResponse.size < 15000" class="orange">{{ formatBytes }}</span>
                    <span v-show="remoteResponse.size >= 15000" class="red">{{ formatBytes }}</span>
                </template>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div class="flex0 d-flex a-center j-center">
                <span>格式：</span>
                <s-ellipsis-content v-if="remoteResponse.mime" :value="remoteResponse.mime" max-width="200px"></s-ellipsis-content>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
        </div>
        <el-tabs v-model="activeName">
            <el-tab-pane label="返回值" name="s-a">
                <s-body></s-body>
            </el-tab-pane>
            <el-tab-pane name="s-b">
                <div slot="label">
                    <span>Cookie&nbsp;</span>
                    <span v-if="cookieLength > 0" class="orange">({{ cookieLength }})</span>
                </div>
                <!-- fix: 文字隐藏组件获取dom宽度失败 -->
                <s-cookie v-if="activeName === 's-b'"></s-cookie>
            </el-tab-pane>
            <el-tab-pane name="s-c">
                <div slot="label">
                    <span>Headers&nbsp;</span>
                    <span v-if="headerLength > 0" class="orange">({{ headerLength }})</span>
                </div>
                <s-headers></s-headers>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import cookie from "./cookie/cookie.vue"
import headers from "./headers/headers.vue"
import body from "./body/body.vue"

export default {
    components: {
        "s-cookie": cookie,
        "s-headers": headers,
        "s-body": body,
    },
    data() {
        return {
            activeName: "s-a",
        };
    },
    computed: {
        //远端返回数据结果
        remoteResponse() {
            return this.$store.state.apidoc.remoteResponse;
        },
        formatBytes() {
            return this.$helper.formatBytes(this.remoteResponse.size);
        },
        formatMs() {
            return this.$helper.formatMs(this.remoteResponse.rt);
        },
        //远端cookies长度
        cookieLength() {
            const setCookie = this.$store.state.apidoc.remoteResponse?.headers["set-cookie"] || [];
            return setCookie.length;
        },
        //远端返回headers长度
        headerLength() {
            const responseHeaders = this.$store.state.apidoc.remoteResponse?.headers || {};
            return Object.keys(responseHeaders).length;
        },
    },
    created() {
        this.initEvent(); //初始化全局事件
    },
    methods: {
        initEvent() {
            this.$event.on("apidoc/sendRequest", () => {
                this.activeName = "s-a";
            })
        },
    },
};
</script>

<style lang="scss">

</style>
