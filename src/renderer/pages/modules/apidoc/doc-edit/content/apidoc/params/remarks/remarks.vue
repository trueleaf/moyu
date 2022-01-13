/*
    创建者：shuxiaokai
    创建时间：2021-12-02 21:22
    模块名称：
    备注：
*/
<template>
    <el-input v-model="description" :size="config.renderConfig.layout.size" rows="4" type="textarea" show-word-limit name="name" placeholder="在此处输入备注信息" class="w-100" maxlength="255" clearable></el-input>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { store } from "@/store/index"

const description = computed({
    get() {
        return store.state["apidoc/apidoc"].apidoc.info.description
    },
    set(val: string) {
        store.commit("apidoc/apidoc/changeDescription", val)
    }
})
</script>

<style lang="scss">

</style>
