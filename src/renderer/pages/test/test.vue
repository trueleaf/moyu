/*
    创建者：shuxiaokai
    创建时间：2021-06-08 19:36
    模块名称：test页面
    备注：
*/
<template>
  <div class="container-test">
    <apiflow />
  </div>
</template>

<script lang="ts" setup>
import apiflow from '../modules/apidoc/doc-edit/content/apiflow/apiflow.vue';

</script>

<style lang="scss" scoped>
.container-test {
   width: 80vw;
   height: 80vh;
   background-color: #fefefe;
   position: absolute;
   top: 10vh;
   left: 10vw;
}
</style>
