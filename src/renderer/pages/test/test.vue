/*
    创建者：shuxiaokai
    创建时间：2021-06-08 19:36
    模块名称：test页面
    备注：
*/
<template>
    <div class="wrap">
        <apiflow />
    </div>
</template>

<script lang="ts" setup>
import apiflow from "../modules/apidoc/doc-edit/content/apiflow/apiflow.vue";

</script>

<style lang="scss">
.wrap {
   width: 80vw;
   height: 80vh;
   background-color: #f2f2f2;
   position: absolute;
   top: 10vh;
   left: 10vw;
}
</style>
