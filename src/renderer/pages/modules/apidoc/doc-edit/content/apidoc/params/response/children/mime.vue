/*
    创建者：shuxiaokai
    创建时间：2021-11-30 17:02
    模块名称：返回格式popover
    备注：
*/
<template>
    <div class="status">
        <template v-for="(item, index) in mimeTypes" :key="index">
            <div class="text-bold mt-1">{{ item.title }}</div>
            <div class="px-3 d-flex flex-wrap">
                <el-tooltip v-for="(mime, index2) in item.values" :key="index2" :show-after="800" :content="mime.mimeType" placement="top" :effect="Effect.LIGHT">
                    <div class="item" @click="handleSelect(mime.mimeType)">{{ mime.alias }}</div>
                </el-tooltip>
            </div>
        </template>
        <div class="close" @click="emit('close')">
            <el-icon>
                <Close />
            </el-icon>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { Effect } from "element-plus";
import { Close } from "@element-plus/icons-vue"
import mimeTypes from "./mime"

const emit = defineEmits(["close", "select"]);
const handleSelect = (mimeType: string) => {
    emit("select", mimeType);
    emit("close");
}
</script>

<style lang="scss">
.status {
    position: relative;
    .item {
        padding: size(1) size(8);
        border: 1px solid $gray-400;
        border-radius: size(2);
        margin-right: size(10);
        cursor: pointer;
        margin-top: size(5);
        margin-bottom: size(10);
        &:hover {
            color: $white;
            background-color: $theme-color;
        }
    }
    .close {
        @include rt-close;
    }
}
</style>
