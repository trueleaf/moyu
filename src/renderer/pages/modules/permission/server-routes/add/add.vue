/*
    创建者：shuxiaokai
    创建时间：2021-06-28 21:04
    模块名称：新增服务端路由
    备注：
*/
<template>
  <SDialog :model-value="modelValue" top="10vh" :title="t('新增服务端路由')" @close="handleClose">
    <SForm ref="form" :edit-data="formInfo">
      <SFormItem :label="t('名称')" prop="name" required one-line></SFormItem>
      <SFormItem :label="t('请求方法')" prop="method" type="select" :select-enum="requestMethodEnum" required one-line></SFormItem>
      <SFormItem :label="t('路径')" prop="path" required one-line></SFormItem>
      <SFormItem :label="t('分组名称')" prop="groupName" required one-line></SFormItem>
    </SForm>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSaveServerRoute">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'success'],
  data() {
    return {
      formInfo: {
        name: '', //------------路由名称
        path: '', //------------路由地址
        method: '', //----------请求方法
        groupName: '', //-------路由分组名称
      },
      requestMethodEnum: [] as { id: string, name: string }[], //请求方法枚举
      //=========================================================================//
      loading: false,
    };
  },
  created() {
    this.getRequestMethodEnum();
  },
  methods: {
    getRequestMethodEnum() {
      this.requestMethodEnum = this.getRequestMethodEnum().map((v) => ({
        id: v,
        name: v.toLocaleLowerCase(),
      }));
    },
    //保存路由
    handleSaveServerRoute() {
      this.form.value?.validate((valid) => {
        if (valid) {
          const { formInfo } = this.form.value as any;
          const params = {
            ...formInfo,
          };
          this.loading = true;
          this.axios.post('/api/security/server_routes', params).then(() => {
            this.$emits('success');
            this.handleClose();
          }).catch((err) => {
            console.error(err);
          }).finally(() => {
            this.loading = false;
          });
        } else {
          this.nextTick(() => {
            const input = document.querySelector('.el-form-item.is-error input');
            if (input) {
              (input as HTMLInputElement).focus();
            }
          });
          this.loading = false;
        }
      });
    },
    //关闭弹窗
    handleClose() {
      this.$emits('update:modelValue', false);
    },
  },
})
</script>

<style lang="scss" scoped>
</style>
