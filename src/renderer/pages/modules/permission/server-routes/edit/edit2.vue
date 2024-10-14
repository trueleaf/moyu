/*
    创建者：shuxiaokai
    创建时间：2021-06-28 21:04
    模块名称：批量修改服务端路由类型
    备注：
*/
<template>
  <SDialog :model-value="modelValue" top="10vh" :title="t('批量修改服务端路由类型')" @close="handleClose">
    <SForm ref="form">
      <SFormItem :label="t('分组名称')" prop="groupName" required one-line></SFormItem>
    </SForm>
    <template #footer>
      <el-button :loading="loading" type="primary" @click="handleSaveServerRoute">{{ t("确定") }}</el-button>
      <el-button type="warning" @click="handleClose">{{ t("取消") }}</el-button>
    </template>
  </SDialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { PermissionServerRoute } from '@src/types/global'
import SDialog from '@/components/common/dialog/g-dialog.vue'
import SForm from '@/components/common/forms/form/g-form.vue'
import SFormItem from '@/components/common/forms/form/g-form-item.vue'
export default defineComponent({
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object as PropType<PermissionServerRoute[]>,
      default: () => ({})
    },
  },
  emits: ['update:modelValue', 'success'],
  data() {
    return {
      //=========================================================================//
      loading: false,
    };
  },
  methods: {
    handleSaveServerRoute() {
      this.form.value?.validate((valid) => {
        if (valid) {
          const { formInfo } = this.form.value as any;
          const params = {
            ids: this.editData.map((v) => v._id),
            groupName: formInfo.groupName,
          };
          this.loading = true;
          this.axios.put('/api/security/server_routes_type', params).then(() => {
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
