/*
    创建者：shuxiaokai
    创建时间：2020-11-25 17:25
    模块名称：配置页面
    备注：xxxx
*/
<template>
    <div class="config">
        <el-tabs v-model="activeName" tab-position="left">
            <el-tab-pane label="接口限制" name="s-a">
                <s-api-rule></s-api-rule>
            </el-tab-pane>
            <el-tab-pane label="权限管理" name="s-b"></el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import apiRule from "./components/api-rule.vue"

export default {
    components: {
        "s-api-rule": apiRule,
    },
    data() {
        return {
            activeName: "s-a",
        };
    },
    created() {},
    methods: {},
};
</script>

<style lang="scss">
.config {
    width: 90%;
    min-width: size(768);
    margin: 0 auto;
    border-radius: $border-radius-sm;
    height: calc(100vh - #{size(100)});
    padding: size(10) size(0) size(10) size(20);
    .el-tabs {
        height: 100%;
    }
    .el-form-item {
        width: size(768);
        margin-bottom: 0;
    }
    .el-form-item__content {
        line-height: size(28);
    }
    .el-form-item__label {
        color: $gray-600;
    }
}
</style>
