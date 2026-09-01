<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <h3>{{ t('调试测试') }}</h3>
        <p>{{ t('测试当前 API 配置是否可用') }}</p>
      </div>
      <div v-if="requestMeta" class="request-summary" data-testid="llm-request-summary">
        <el-tag effect="plain" size="small">{{ providerLabel }}</el-tag>
        <el-tag effect="plain" size="small">{{ requestMeta.model }}</el-tag>
        <el-tag effect="plain" size="small">{{ requestMeta.stream ? t('流式') : t('普通') }}</el-tag>
        <el-tag effect="plain" size="small">{{ thinkingModeLabel }}</el-tag>
        <el-tag v-if="responseTime !== null" effect="plain" size="small">{{ responseTime }}ms</el-tag>
      </div>
    </div>
    <div class="panel-body">
      <el-tabs v-model="activeTab" class="debug-tabs" data-testid="llm-debug-tabs" @tab-click="handleTabClick">
        <el-tab-pane name="response">
          <template #label>
            <span class="tab-label"><MessageSquareText :size="15" />{{ t('响应结果') }}</span>
          </template>
          <div class="tab-panel response-panel">
            <div class="response-content" :class="{ 'has-error': hasError }">
              <div v-if="isLoading && !isStreaming" class="panel-empty">
                <LoaderCircle class="loading-icon" :size="20" />
                <span>{{ t('正在请求...') }}</span>
              </div>
              <div v-else-if="responseContent && useMarkdown" class="markdown-content">
                <VueMarkdownRender :source="responseContent" :options="markdownOptions" />
              </div>
              <div v-else-if="responseContent" class="response-text">
                {{ responseContent }}
              </div>
              <div v-else class="panel-empty">
                <MessageSquareText :size="24" />
                <span>{{ t('发送消息以测试 API 配置') }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane name="reasoning">
          <template #label>
            <span class="tab-label"><Brain :size="15" />{{ t('思考过程') }}<span v-if="reasoningContent" class="content-dot" /></span>
          </template>
          <div class="tab-panel reasoning-panel">
            <div v-if="reasoningContent" class="reasoning-content">
              <VueMarkdownRender :source="reasoningContent" :options="markdownOptions" />
            </div>
            <div v-else class="panel-empty">
              <Brain :size="24" />
              <span>{{ reasoningEmptyText }}</span>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane name="request">
          <template #label>
            <span class="tab-label"><FileJson :size="15" />{{ t('请求详情') }}</span>
          </template>
          <div class="tab-panel request-panel">
            <pre v-if="requestBody" class="request-json">{{ formattedRequestBody }}</pre>
            <div v-else class="panel-empty">
              <FileJson :size="24" />
              <span>{{ t('发送请求后展示实际请求体') }}</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Brain, FileJson, LoaderCircle, MessageSquareText } from 'lucide-vue-next'
import VueMarkdownRender from 'vue-markdown-render'
import type { LLMThinkingMode, LLMVendor } from '@src/types/ai/agent.type'
const { t } = useI18n()
const props = defineProps<{
  responseContent: string
  reasoningContent: string
  isLoading: boolean
  isStreaming: boolean
  hasError: boolean
  responseTime: number | null
  useMarkdown: boolean
  requestBody: Record<string, unknown> | null
  requestMeta: { vendor: LLMVendor; model: string; stream: boolean; thinkingMode: LLMThinkingMode } | null
}>()
const activeTab = ref<'response' | 'reasoning' | 'request'>('response')
const hasManualTabSelection = ref(false)
const formattedRequestBody = computed(() => props.requestBody ? JSON.stringify(props.requestBody, null, 2) : '')
const providerLabel = computed(() => {
  if (!props.requestMeta) return ''
  if (props.requestMeta.vendor === 'deepseek') return t('DeepSeek')
  if (props.requestMeta.vendor === 'qwen') return t('通义千问（阿里云百炼）')
  return t('自定义（OpenAI Compatible）')
})
const thinkingModeLabel = computed(() => {
  if (props.requestMeta?.vendor === 'custom') return t('思考：由请求参数决定')
  if (!props.requestMeta || props.requestMeta.thinkingMode === 'default') return t('思考：跟随模型')
  return props.requestMeta.thinkingMode === 'enabled' ? t('思考：开启') : t('思考：关闭')
})
const reasoningEmptyText = computed(() => {
  if (props.requestMeta?.thinkingMode === 'disabled') return t('本次请求未启用深度思考')
  if (props.isStreaming) return t('正在等待思考内容...')
  return t('模型未返回思考过程')
})
const markdownOptions = { html: false, breaks: true, linkify: true }
// 记录用户主动选择的标签
const handleTabClick = () => {
  hasManualTabSelection.value = true
}
watch(() => props.isLoading, (value, previous) => {
  if (value && !previous) {
    hasManualTabSelection.value = false
    activeTab.value = 'response'
  }
})
watch(() => props.reasoningContent, value => {
  if (props.isStreaming && value && !hasManualTabSelection.value) activeTab.value = 'reasoning'
})
watch(() => props.isStreaming, (value, previous) => {
  if (!value && previous && !hasManualTabSelection.value) activeTab.value = 'response'
})
</script>

<style lang="scss" scoped>
.panel { background: var(--bg-primary); border: 1px solid var(--border-light); border-radius: 16px; box-shadow: 0 10px 30px var(--shadow-light); padding: 24px; height: 100%; display: flex; flex-direction: column; box-sizing: border-box; }
.panel-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.panel-header h3 { margin: 0 0 6px; font-size: 20px; color: var(--text-primary); }
.panel-header p { margin: 0; color: var(--text-secondary); font-size: 14px; }
.request-summary { display: flex; justify-content: flex-end; gap: 6px; flex-wrap: wrap; max-width: 65%; }
.panel-body { flex: 1; min-height: 0; overflow: hidden; }
.debug-tabs { height: 100%; display: flex; flex-direction: column; }
.debug-tabs :deep(.el-tabs__header) { flex-shrink: 0; margin-bottom: 12px; }
.debug-tabs :deep(.el-tabs__content) { flex: 1; min-height: 0; }
.debug-tabs :deep(.el-tab-pane) { height: 100%; }
.tab-label { display: inline-flex; align-items: center; gap: 5px; }
.content-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--el-color-primary); }
.tab-panel { height: 100%; min-height: 0; border: 1px solid var(--border-light); border-radius: 8px; overflow: auto; box-sizing: border-box; }
.response-panel { background: var(--bg-secondary); }
.response-content { min-height: 100%; padding: 16px; box-sizing: border-box; font-size: 14px; line-height: 1.6; color: var(--text-primary); }
.response-content.has-error { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
.reasoning-panel { padding: 16px; background: var(--el-color-warning-light-9); border-color: var(--el-color-warning-light-5); }
.reasoning-content { font-size: 14px; line-height: 1.6; color: var(--text-primary); }
.request-panel { padding: 16px; background: var(--bg-secondary); }
.request-json { margin: 0; font-size: 12px; line-height: 1.6; font-family: 'Consolas', 'Monaco', monospace; color: var(--text-primary); white-space: pre-wrap; word-break: break-word; }
.panel-empty { height: 100%; min-height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--text-tertiary); text-align: center; }
.loading-icon { animation: rotate 1s linear infinite; }
.response-text { white-space: pre-wrap; word-break: break-word; }
.markdown-content, .reasoning-content {
  :deep(p) { margin: 0 0 8px; &:last-child { margin-bottom: 0; } }
  :deep(pre) { background: var(--bg-tertiary); padding: 12px; border-radius: 6px; overflow-x: auto; margin: 8px 0; }
  :deep(code) { font-family: 'Consolas', 'Monaco', monospace; font-size: 13px; }
  :deep(ul), :deep(ol) { padding-left: 20px; margin: 8px 0; }
  :deep(blockquote) { border-left: 3px solid var(--el-color-primary); padding-left: 12px; margin: 8px 0; color: var(--text-secondary); }
}
@keyframes rotate { to { transform: rotate(360deg); } }
@media (max-width: 1200px) {
  .panel-header { flex-direction: column; }
  .request-summary { justify-content: flex-start; max-width: 100%; }
}
</style>
