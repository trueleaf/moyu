<template>
  <div class="empty-response-body" role="status" data-testid="response-body-empty">
    <FileX2 class="empty-response-icon" :size="32" :stroke-width="1.5" aria-hidden="true" />
    <div class="empty-response-title">{{ t('响应体为空') }}</div>
    <p class="empty-response-description">{{ t('服务器已完成响应，未返回正文内容。') }}</p>
  </div>
</template>

<script setup lang="ts">
import { FileX2 } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.empty-response-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
}
.empty-response-icon {
  color: var(--text-tertiary);
}
.empty-response-title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}
.empty-response-description {
  max-width: 320px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}
</style>
