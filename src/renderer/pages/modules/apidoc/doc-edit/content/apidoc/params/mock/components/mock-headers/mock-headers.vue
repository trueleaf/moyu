 备注：
*/
<template>
  <div>
    <s-params-tree :drag="false" show-checkbox :data="headers" :mind-params="mindHeaderParams" no-required-checkbox></s-params-tree>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref } from 'vue';
import { ApidocProperty } from '@src/types/global';
import mindHeaders from '../../../headers/mind-headers';
import { useApidoc } from '@/store/apidoc/apidoc';

const apidocStore = useApidoc()
const headers = computed(() => apidocStore.apidoc.mockInfo.responseHeaders);
const mindHeaderParams: Ref<ApidocProperty[]> = ref(mindHeaders);
</script>

<style lang="scss" scoped>

</style>
