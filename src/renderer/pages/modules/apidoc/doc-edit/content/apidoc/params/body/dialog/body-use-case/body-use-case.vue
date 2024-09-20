/*
    创建者：shuxiaokai
    模块名称：body参数用例
    备注：
*/
<template>
  <s-dialog :model-value="modelValue" width="30%" title="保存用例" @close="handleClose">
    <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px" :inline="false">
      <el-form-item label="用例名称：" prop="name">
        <el-input v-model="formInfo.name" v-focus-select></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSave">{{ t("保存") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </s-dialog>
</template>

<script lang="ts" setup>
import { ref, Ref, nextTick } from 'vue'
import { router } from '@/router';
import { store } from '@/store';
import { FormInstance, FormRules } from 'element-plus';
import axios from 'axios';

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(['update:modelValue'])
const loading = ref(false);
const formInfo = ref({ name: '' });
const rules: Ref<FormRules> = ref({
  name: [
    { required: true, message: '请填写用例名称', trigger: 'blur' },
  ],
});
const formInstance: Ref<(FormInstance & { fomrInfo: Record<string, unknown> }) | null> = ref(null);
//关闭弹窗
const handleClose = () => {
  emits('update:modelValue', false);
}
//保存为用例
const handleSave = () => {
  formInstance.value?.validate((valid) => {
    if (valid) {
      const bodyParams = store.state['apidoc/apidoc'].apidoc.item.requestBody.rawJson
      const params = {
        name: formInfo.value.name,
        presetParamsType: 'bodyParams',
        projectId: router.currentRoute.value.query.id,
        items: bodyParams,
      };
      loading.value = true;
      axios.post('/api/project/doc_preset_params', params).then((res) => {
        store.commit('apidoc/baseInfo/addParamsTemplate', res.data);
        handleClose();
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        loading.value = false;
      });
      nextTick(() => {
        const input = document.querySelector('.el-form-item.is-error input');
        if (input) {
          (input as HTMLElement).focus();
        }
      });
    }
  });
}
</script>

<style lang="scss">

</style>
