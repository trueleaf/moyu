/*
    创建者：shuxiaokai
    创建时间：2020-10-19 15:05
    模块名称：请求头
    备注：xxxx
*/
<template>
    <s-collapse-card ref="collapse" title="请求头" class="header-params" fold>
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
        //=====================================数据请求====================================//
    },
};
</script>

<style lang="scss">
.header-params {
    .operation {
        display: flex;
        align-items: center;
        margin-left: size(20);
    }
}
</style>
