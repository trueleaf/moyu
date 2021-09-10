/*
    创建者：shuxiaokai
    创建时间：2021-09-03 20:45
    模块名称：返回header
    备注：
*/
<template>
    <div class="header-view" :class="{ vertical: layout === 'vertical' }">
        <el-table :data="headers" stripe border size="mini">
            <el-table-column align="center" prop="key" label="名称"></el-table-column>
            <el-table-column align="center" prop="value" label="值"></el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
        };
    },
    computed: {
        headers() {
            const { header } = this.$store.state["apidoc/response"];
            const result: { key: string, value: string }[] = [];
            Object.keys(header).forEach(key => {
                result.push({
                    key,
                    value: header[key] as string,
                });
            })
            return result
        },
        //布局
        layout() {
            return this.$store.state["apidoc/baseInfo"].layout;
        },
    },
    methods: {
    },
})
</script>

<style lang="scss">
.header-view {
    width: 100%;
    height: calc(100vh - #{size(370)});
    overflow-y: auto;
    &.vertical {
        height: 100%;
    }
}
</style>
