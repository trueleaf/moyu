/*
    创建者：shuxiaokai
    创建时间：2020-10-19 15:05
    模块名称：请求头
    备注：xxxx
*/
<template>
    <s-collapse-card ref="collapse" title="请求头" class="header-params" fold>
        <div slot="operation">
            <div v-if="cookies.length > 0">
                <el-popover ref="cookiePopover" placement="right-end" width="450">
                    <div class="inject-cookie">
                        <div class="mb-1">1.当前cookie将被注入到请求头</div>
                        <div class="mb-2">2.自定义cookie将会覆盖自动生成的cookie</div>
                        <span class="clear-cookie" @click="handleClearCookie">清空cookie</span>
                        <el-table :data="cookies" stripe border size="mini">
                            <el-table-column prop="name" label="名称" align="left" width="120px"></el-table-column>
                            <el-table-column label="值" align="left">
                                <template slot-scope="scope">
                                    <s-ellipsis-content :value="scope.row.value" copy max-width="100%"></s-ellipsis-content>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <span slot="reference">
                        <span class="orange cursor-pointer">
                            <span>cookie</span>
                            <span>({{ cookies.length }})</span>
                        </span>
                    </span>
                </el-popover>
            </div>
        </div>
        <s-params-tree
            ref="paramsTree"
            :tree-data="headers"
            :nest="false"
            :enable-form-data="false"
            showCheckbox
            :mindParams="mindParams"
        >
        </s-params-tree>
    </s-collapse-card>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数

export default {
    mixins: [mixin],
    computed: {
        headers: { //请求参数
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.headers;
            },
            set(val) {
                this.$store.commit("apidoc/changeHeaders", val);
            },
        },
        cookies() {
            return this.$store.state.apidoc.cookies;
        },
    },
    props: {
        request: { //---------------请求参数
            type: Object,
            default() {
                return {}
            },
        },
        dataReady: { //------------数据是否请求完毕
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            mindParams: [],
            //=====================================其他参数====================================//
        };
    },
    created() {
    },
    methods: {
        //选中_select为true的参数
        selectChecked() {
            return new Promise((resolve, reject) => {
                this.$refs.paramsTree.selectChecked().then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err)
                });
            })
        },
        //清空cookie
        handleClearCookie() {
            let localCookies = localStorage.getItem("apidoc/cookies") || "{}";
            localCookies = JSON.parse(localCookies);
            if (!localCookies[this.$route.query.id]) {
                localCookies[this.$route.query.id] = [];
            }
            localStorage.setItem("apidoc/cookies", JSON.stringify(localCookies));
            this.$store.commit("apidoc/changeCookies", []);
            this.$refs.cookiePopover.doClose();
        },
        //=====================================数据请求====================================//
    },
};
</script>

<style lang="scss">
.inject-cookie {
    .clear-cookie {
        position: absolute;
        right: size(20);
        top: size(10);
        color: $red;
        cursor: pointer;
    }
}
</style>
