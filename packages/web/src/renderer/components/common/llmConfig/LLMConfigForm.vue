<template>
  <div class="llm-config-form" :class="{ compact }">
    <div class="config-fields">
      <div class="form-item">
        <label class="form-label">{{ t('模型厂商') }}</label>
        <el-select :model-value="draft.vendor" data-testid="llm-vendor-select" :aria-label="t('模型厂商')" @change="handleVendorChange">
          <el-option :label="t('DeepSeek')" value="deepseek" />
          <el-option :label="t('通义千问（阿里云百炼）')" value="qwen" />
          <el-option :label="t('自定义（OpenAI Compatible）')" value="custom" />
        </el-select>
      </div>
      <div v-if="preset" class="form-item">
        <label class="form-label">{{ t('模型') }}</label>
        <el-select v-model="draft.model" data-testid="llm-model-select" :aria-label="t('模型')">
          <el-option v-if="!knownModel" :label="draft.model" :value="draft.model" />
          <el-option v-for="model in preset.models" :key="model" :label="model" :value="model" />
        </el-select>
        <span v-if="!knownModel" class="field-hint">{{ t('当前模型不在预设列表中，已保留原选择') }}</span>
      </div>
      <template v-else>
        <div class="form-item">
          <label class="form-label">{{ t('Base URL') }}</label>
          <el-input v-model="draft.baseURL" :aria-label="t('Base URL')" :placeholder="t('请输入 API Base URL')" clearable />
          <span class="field-hint">{{ t('填写完整请求地址，包含 /chat/completions 路径') }}</span>
        </div>
        <div class="form-item">
          <label class="form-label">{{ t('Model ID') }}</label>
          <el-input v-model="draft.model" :aria-label="t('Model ID')" :placeholder="t('请输入模型 ID')" clearable />
        </div>
      </template>
      <div class="form-item">
        <label class="form-label">{{ t('API Key') }} <span v-if="!preset" class="field-hint">{{ t('(可选)') }}</span></label>
        <el-input v-model="draft.apiKey" :aria-label="t('API Key')" :placeholder="t('请输入 API Key')" type="password" show-password clearable autocomplete="off" />
      </div>
      <div v-if="preset" class="preset-info" data-testid="llm-preset-info">
        <span class="form-label">{{ t('官方请求地址') }}</span>
        <code>{{ preset.baseURL }}</code>
        <p v-if="draft.vendor === 'qwen'">{{ t('默认北京地域；其他地域或业务空间专属地址请使用自定义模式') }}</p>
        <p>{{ t('其余参数使用官方默认值，预设核对日期：{date}', { date: llmPresetsCheckedAt }) }}</p>
        <div class="preset-links">
          <a :href="preset.keyURL" target="_blank" rel="noopener noreferrer"><KeyRound :size="14" />{{ t('获取 API Key') }}</a>
          <a :href="preset.docsURL" target="_blank" rel="noopener noreferrer"><ExternalLink :size="14" />{{ t('官方模型文档') }}</a>
        </div>
      </div>
      <div v-if="preset && compact" class="advanced-summary" data-testid="llm-advanced-summary">
        <Brain :size="15" />
        <span>{{ t('深度思考') }}：{{ advancedSummary }}</span>
      </div>
      <div v-if="preset && !compact" class="advanced-section">
        <button class="advanced-toggle" type="button" :aria-expanded="advancedOpen" data-testid="llm-advanced-toggle" @click="advancedOpen = !advancedOpen">
          <span><Settings2 :size="16" />{{ t('高级配置') }}</span>
          <ChevronDown :size="16" :class="{ expanded: advancedOpen }" />
        </button>
        <div v-show="advancedOpen" class="advanced-fields">
          <div v-if="preset.capabilities.thinking" class="form-item">
            <label class="form-label">{{ t('深度思考') }}</label>
            <el-radio-group :key="draft.vendor" v-model="draft.thinkingMode" size="small" data-testid="llm-thinking-mode">
              <el-radio-button value="default">{{ t('跟随模型默认') }}</el-radio-button>
              <el-radio-button value="enabled">{{ t('开启思考') }}</el-radio-button>
              <el-radio-button value="disabled">{{ t('关闭思考') }}</el-radio-button>
            </el-radio-group>
            <span class="field-hint">{{ t('跟随模型默认时不会发送思考控制参数') }}</span>
          </div>
          <div v-if="supportsReasoningEffort" class="form-item">
            <label class="form-label">{{ t('思考强度') }}</label>
            <el-select v-model="draft.reasoningEffort" :disabled="draft.thinkingMode !== 'enabled'" data-testid="llm-reasoning-effort">
              <el-option :label="t('默认')" value="default" />
              <el-option :label="t('低')" value="low" />
              <el-option :label="t('高')" value="high" />
              <el-option :label="t('最大')" value="max" />
            </el-select>
          </div>
          <div v-if="preset.capabilities.thinkingBudget" class="form-item">
            <label class="form-label">{{ t('思考预算') }}</label>
            <el-input-number :key="`${draft.vendor}-${draft.thinkingMode}`" v-model="draft.thinkingBudget" :disabled="draft.thinkingMode !== 'enabled'" :min="1" :step="1" :precision="0" controls-position="right" data-testid="llm-thinking-budget" />
            <span class="field-hint">{{ t('限制思考过程最大 Token 数，留空使用模型默认值') }}</span>
          </div>
          <div v-if="preset.capabilities.maxTokens" class="form-item">
            <label class="form-label">{{ t('最大输出 Token') }}</label>
            <el-input-number v-model="draft.maxTokens" :min="1" :step="1" :precision="0" controls-position="right" data-testid="llm-max-tokens" />
            <span class="field-hint">{{ t('留空使用模型默认的最大输出长度') }}</span>
          </div>
        </div>
      </div>
      <template v-if="!preset && !compact">
        <div class="form-item">
          <label class="form-label">{{ t('Custom Headers') }} <span class="field-hint">{{ t('(可选)') }}</span></label>
          <div v-for="(header, index) in draft.customHeaders" :key="index" class="header-row">
            <el-input v-model="header.key" :placeholder="t('Header Key')" />
            <el-input v-model="header.value" :placeholder="t('Header Value')" type="password" show-password />
            <el-button :aria-label="t('删除')" text type="danger" @click="draft.customHeaders.splice(index, 1)"><Trash2 :size="16" /></el-button>
          </div>
          <el-button text class="add-header" @click="draft.customHeaders.push({ key: '', value: '' })"><Plus :size="14" />{{ t('添加请求头') }}</el-button>
        </div>
        <div class="form-item">
          <label class="form-label">{{ t('额外请求体') }} <span class="field-hint">{{ t('(可选)') }}</span></label>
          <SJsonEditor v-model="draft.extraBody" :auto-height="true" :max-height="260" :min-height="140" />
        </div>
      </template>
      <p class="field-hint">{{ t('保存后应用于 AI 功能；测试仅使用当前表单，不会覆盖已保存配置') }}</p>
      <p v-if="preset" class="field-hint">{{ t('测试会请求官方服务，可能产生模型调用费用') }}</p>
      <p v-if="validationError" class="validation-hint" role="status">{{ t(validationError) }}</p>
    </div>
    <div class="config-actions">
      <slot :config="resolvedConfig" :valid="!validationError" />
      <el-button type="primary" class="ai-config-btn" data-testid="llm-save" :disabled="!!validationError" @click="handleSave">{{ t('保存') }}</el-button>
      <el-button class="ai-config-btn" data-testid="llm-reset" @click="handleReset">{{ t('重置') }}</el-button>
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { Brain, ChevronDown, ExternalLink, KeyRound, Plus, Settings2, Trash2 } from 'lucide-vue-next'
import { createLLMProvider, getLLMConfigError, isLLMVendor, llmPresets, llmPresetsCheckedAt, resolveLLMProvider } from '@src/config/llmProviders'
import type { LLMProviderProfiles } from '@src/types/ai/agent.type'
import { useLLMClientStore } from '@/store/ai/llmClientStore'
import { message } from '@/helper'
const SJsonEditor = defineAsyncComponent(() => import('@/components/common/jsonEditor/ClJsonEditor.vue'))
defineProps<{ compact?: boolean }>()
const { t } = useI18n()
const store = useLLMClientStore()
const draft = ref(resolveLLMProvider(store.LLMConfig))
const drafts = ref<LLMProviderProfiles>({})
const preset = computed(() => draft.value.vendor && draft.value.vendor !== 'custom' ? llmPresets[draft.value.vendor] : null)
const knownModel = computed(() => preset.value?.models.some(model => model === draft.value.model) ?? false)
const supportsReasoningEffort = computed(() => (preset.value?.capabilities.reasoningEfforts.length ?? 0) > 0)
const resolvedConfig = computed(() => resolveLLMProvider(draft.value))
const validationError = computed(() => getLLMConfigError(resolvedConfig.value))
const advancedOpen = ref(false)
const advancedSummary = computed(() => {
  if (draft.value.thinkingMode === 'default') return t('跟随模型默认')
  if (draft.value.thinkingMode === 'disabled') return t('已关闭')
  if (draft.value.vendor === 'deepseek' && draft.value.reasoningEffort !== 'default') return t('已开启，思考强度：{level}', { level: t(draft.value.reasoningEffort === 'low' ? '低' : draft.value.reasoningEffort === 'max' ? '最大' : '高') })
  if (draft.value.vendor === 'qwen' && draft.value.thinkingBudget !== null) return t('已开启，思考预算：{count} Tokens', { count: draft.value.thinkingBudget })
  return t('已开启')
})
// 切换厂商并保留当前表单草稿
const handleVendorChange = (vendor: unknown) => {
  if (!isLLMVendor(vendor)) return
  drafts.value[draft.value.vendor ?? 'custom'] = resolveLLMProvider(draft.value)
  draft.value = resolveLLMProvider(drafts.value[vendor] ?? store.getProviderConfig(vendor))
}
// 保存当前厂商配置
const handleSave = () => {
  if (validationError.value) return
  const next = resolvedConfig.value
  next.customHeaders = next.customHeaders.filter(header => header.key.trim())
  if (store.updateLLMConfig(next)) message.success(t('配置保存成功'))
  else message.error(t('保存失败'))
}
// 重置当前厂商草稿而不影响其他厂商
const handleReset = () => {
  draft.value = createLLMProvider(draft.value.vendor ?? 'custom')
}
// 同步其他配置入口保存的当前配置
watch(() => store.LLMConfig, value => {
  const next = resolveLLMProvider(value)
  drafts.value[next.vendor ?? 'custom'] = next
  draft.value = resolveLLMProvider(next)
})
</script>

<style scoped lang="scss">
.llm-config-form { display: flex; flex-direction: column; min-height: 0; height: 100%; }
.config-fields { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; flex: 1; min-height: 0; padding: 2px; }
.form-item { display: flex; flex-direction: column; gap: 8px; }
.form-label { color: var(--text-secondary); font-size: 14px; font-weight: 500; }
.field-hint { color: var(--text-tertiary); font-size: 12px; line-height: 1.6; margin: 0; }
.validation-hint { color: var(--text-secondary); font-size: 12px; margin: 0; }
.preset-info { background: var(--bg-secondary); border: 1px solid var(--border-light); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.preset-info code { font-size: 12px; overflow-wrap: anywhere; color: var(--text-primary); }
.preset-info p { margin: 0; font-size: 12px; line-height: 1.6; color: var(--text-secondary); }
.preset-links { display: flex; gap: 16px; flex-wrap: wrap; }
.preset-links a { display: inline-flex; gap: 4px; align-items: center; font-size: 12px; color: var(--text-primary); }
.advanced-summary { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border: 1px solid var(--border-light); border-radius: 8px; color: var(--text-secondary); font-size: 12px; }
.advanced-section { border: 1px solid var(--border-light); border-radius: 8px; overflow: hidden; }
.advanced-toggle { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px; border: none; background: var(--bg-secondary); color: var(--text-primary); cursor: pointer; }
.advanced-toggle span { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 500; }
.advanced-toggle svg { transition: transform 0.2s ease; }
.advanced-toggle svg.expanded { transform: rotate(180deg); }
.advanced-fields { display: flex; flex-direction: column; gap: 16px; padding: 16px 12px; border-top: 1px solid var(--border-light); }
.advanced-fields :deep(.el-input-number) { width: 100%; }
.advanced-fields :deep(.el-radio-group) { display: flex; }
.advanced-fields :deep(.el-radio-button) { flex: 1; }
.advanced-fields :deep(.el-radio-button__inner) { width: 100%; }
.header-row { display: flex; gap: 8px; align-items: center; }
.header-row .el-input { min-width: 0; }
.add-header { align-self: flex-start; }
.config-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding-top: 16px; margin-top: 16px; border-top: 1px solid var(--border-light); }
.config-actions :deep(.el-button + .el-button) { margin-left: 0; }
.compact .config-fields { gap: 12px; }
</style>
