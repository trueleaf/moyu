/*
    创建者：shuxiaokai
    创建时间：2021-06-08 19:36
    模块名称：test页面
    备注：
*/
<template>
    <div class="wrap">
        <s-json-editor v-model="data"></s-json-editor>
        <pre class="w-200px">{{ data }}</pre>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
            data: ""
        };
    },
    methods: {
    },
})
</script>

<style lang="scss">
.wrap {
    display: flex;
    width: 80vw;
    height: calc(100vh - 100px);
    border: 1px solid $gray-400;
}
</style>
