<template>
  <section class="panel">
    <div class="panel-header">
      <h3>{{ t('大模型配置') }}</h3>
      <p>{{ t('选择官方厂商后只需填写 Key，也可以使用自定义服务') }}</p>
    </div>
    <LLMConfigForm v-slot="{ config, valid }">
      <el-button :loading="isLoading && !isStreaming" :disabled="!valid || isLoading" data-testid="llm-test-send" @click="$emit('send', config)">{{ t('发送') }}</el-button>
      <el-button :loading="isStreaming" :disabled="!valid || isLoading" data-testid="llm-test-stream" @click="$emit('streamSend', config)">{{ t('流式发送') }}</el-button>
      <el-button v-if="isLoading" type="danger" @click="$emit('cancel')">{{ t('取消') }}</el-button>
    </LLMConfigForm>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LLMConfigForm from '@/components/common/llmConfig/LLMConfigForm.vue'
import type { LLMProviderSetting } from '@src/types/ai/agent.type'
defineProps<{ isLoading: boolean; isStreaming: boolean }>()
defineEmits<{ send: [config: LLMProviderSetting]; streamSend: [config: LLMProviderSetting]; cancel: [] }>()
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.panel { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: 16px; padding: 24px; height: 100%; display: flex; flex-direction: column; box-sizing: border-box; }
.panel-header { margin-bottom: 20px; }
.panel-header h3 { margin: 0 0 6px; font-size: 20px; color: var(--text-primary); }
.panel-header p { margin: 0; font-size: 14px; color: var(--text-secondary); }
</style>
