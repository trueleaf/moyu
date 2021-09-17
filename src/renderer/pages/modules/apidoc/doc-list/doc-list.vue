/*
    创建者：shuxiaokai
    创建时间：2021-07-13 21:24
    模块名称：文档列表
    备注：
*/
<template>
    <div class="doc-list">
        <el-tabs v-model="activeName">
            <el-tab-pane name="tab-a">
                <template #label>
                    <span>
                        <i class="el-icon-tickets"></i>
                        <span>项目列表</span>
                    </span>
                </template>
            </el-tab-pane>
            <el-tab-pane name="tab-b">
                <template #label>
                    <span>
                        <i class="el-icon-user"></i>
                        <span>团队管理</span>
                    </span>
                </template>
            </el-tab-pane>
        </el-tabs>
        <component :is="activeName"></component>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import tabA from "./tab-a/tab-a.vue"

export default defineComponent({
    components: {
        "tab-a": tabA,
    },
    data() {
        return {
            activeName: "tab-a", //当前激活选项卡
        };
    },
    methods: {
    },
})
</script>

<style lang="scss">
.doc-list {
    width: 70%;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
    @media only screen and (max-width: 1199px) {
        width: 100%;
        padding: 0 20px;
    }
}
</style>
