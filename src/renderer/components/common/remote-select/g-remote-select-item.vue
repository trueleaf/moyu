/*
    创建者：shuxiaokai
    创建时间：2021-07-13 22:31
    模块名称：远程搜索item
    备注：
*/
<template>
    <div class="remote-select-item">
        <slot />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
        };
    },
    methods: {
    },
})
</script>

<style lang="scss">
.remote-select-item {
    height: size(38);
    display: flex;
    align-items: center;
    padding: 0 size(20);
    cursor: pointer;
    &:hover {
        background: mix($white, $theme-color, 90%);
    }
}
</style>
