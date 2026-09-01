import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSetting, ChatStreamCallbacks, LLMProviderProfiles, LLMVendor } from '@src/types/ai/agent.type';
import { logger } from '@/helper/logger';
import { isElectron } from '@/helper';
import { createLLMProvider, resolveLLMProvider, getLLMConfigError, getLLMRequestError } from '@src/config/llmProviders';
import { llmProviderCache } from '@/cache/ai/llmProviderCache';
import { appSettingsCache } from '@/cache/settings/appSettingsCache';

type ResponseWrapperResult = { code: number; msg: string; data: unknown };
type ProxyControllerResult = { success: boolean; data?: unknown; message?: string };
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

// 解析额外请求体
const parseExtraBody = (extraBody?: string): Record<string, unknown> => {
  const extraBodyText = extraBody?.trim() ?? '';
  if (!extraBodyText) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(extraBodyText);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }
  return {};
};
const getProxyUrl = (): string => {
  const proxyServerUrl = appSettingsCache.getProxyServerUrl().trim();
  const normalizedProxyServerUrl = proxyServerUrl.endsWith('/') ? proxyServerUrl.slice(0, -1) : proxyServerUrl;
  return normalizedProxyServerUrl ? `${normalizedProxyServerUrl}/api/proxy/http` : '/api/proxy/http';
};
const unwrapResponseWrapper = (value: unknown): unknown => {
  if (!isRecord(value)) return value;
  if (!('code' in value) || !('data' in value)) return value;
  const code = (value as Partial<ResponseWrapperResult>).code;
  if (typeof code !== 'number') return value;
  if (code !== 0) {
    const msg = (value as Partial<ResponseWrapperResult>).msg;
    throw new Error(typeof msg === 'string' ? msg : '请求失败');
  }
  return (value as ResponseWrapperResult).data;
};
const resolveProxyControllerResult = (value: unknown): ProxyControllerResult => {
  const unwrapped = unwrapResponseWrapper(value);
  if (!isRecord(unwrapped)) throw new Error('请求失败');
  const success = unwrapped.success;
  if (typeof success !== 'boolean') throw new Error('请求失败');
  const message = typeof unwrapped.message === 'string' ? unwrapped.message : '请求失败';
  if (success !== true) throw new Error(typeof unwrapped.statusCode === 'number' ? `HTTP ${unwrapped.statusCode}: ${message}` : message);
  return { success: true, data: unwrapped.data };
};
const decodeBase64Text = (value: string): string => {
  const binaryString = atob(value);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
};
const buildProxyBody = (targetUrl: string, headers: Record<string, string>, body: Record<string, unknown>, enableStream: boolean) => ({
  url: targetUrl,
  method: 'POST',
  headers,
  timeout: 60000,
  bodyType: 'json',
  body: JSON.stringify(body),
  enableStream,
});
// Web 模式下调用用户配置的 LLM API
const webChat = async (body: ChatRequestBody, config: LLMProviderSetting, signal?: AbortSignal): Promise<OpenAiResponseBody> => {
  const targetUrl = config.baseURL;
  const requestBody = { ...body, model: config.model, stream: false };
  const requestInfo = { url: targetUrl, method: 'POST', body: requestBody };
  logger.info('llmRequestParams', { payload: JSON.stringify(requestInfo) });
  if (!config.baseURL || !config.model) {
    throw new Error('请先配置 Base URL 和 Model');
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }
  config.customHeaders?.forEach(h => {
    if (h.key) headers[h.key] = h.value;
  });
  const extraBody = parseExtraBody(config.extraBody);
  const finalBody = { ...extraBody, ...requestBody };
  try {
    const response = await fetch(getProxyUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildProxyBody(targetUrl, headers, finalBody, false)),
      signal,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const proxyResult = resolveProxyControllerResult(result);
    if (!isRecord(proxyResult.data)) throw new Error('请求失败');
    const proxyResponse = proxyResult.data;
    const statusCode = typeof proxyResponse.statusCode === 'number' ? proxyResponse.statusCode : 0;
    const bodyText = typeof proxyResponse.body === 'string' ? decodeBase64Text(proxyResponse.body) : '';
    if (statusCode >= 400) {
      throw new Error(`HTTP ${statusCode}: ${bodyText || '请求失败'}`);
    }
    return JSON.parse(bodyText) as OpenAiResponseBody;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError' || err.name === 'CanceledError') {
        throw new Error('请求已取消');
      }
      if (err.message?.includes('timeout')) {
        throw new Error('请求超时，请稍后重试');
      }
    }
    throw err;
  }
};
// Web 模式下使用 ReadableStream 实现流式调用
const webChatStream = (body: ChatRequestBody, config: LLMProviderSetting, callbacks: ChatStreamCallbacks) => {
  const abortController = new AbortController();
  const targetUrl = config.baseURL;
  const requestBody = { ...body, model: config.model, stream: true };
  const requestInfo = { url: targetUrl, method: 'POST', body: requestBody };
  logger.info('llmRequestParams', { payload: JSON.stringify(requestInfo) });
  
  (async () => {
    try {
      if (!config.baseURL || !config.model) {
        callbacks.onError(new Error('请先配置 Base URL 和 Model'));
        return;
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (config.apiKey) {
        headers.Authorization = `Bearer ${config.apiKey}`;
      }
      config.customHeaders?.forEach(h => {
        if (h.key) headers[h.key] = h.value;
      });
      const extraBody = parseExtraBody(config.extraBody);
      const finalBody = { ...extraBody, ...requestBody };
      const response = await fetch(getProxyUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildProxyBody(targetUrl, headers, finalBody, true)),
        signal: abortController.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      if (response.headers.get('content-type')?.includes('application/json')) {
        const result: unknown = await response.json();
        if (isRecord(result) && isRecord(result.error)) {
          throw new Error(`${String(result.error.code || result.error.type || '')}: ${String(result.error.message || '请求失败')}`);
        }
        const proxyResult = resolveProxyControllerResult(result);
        if (isRecord(proxyResult.data) && typeof proxyResult.data.statusCode === 'number' && proxyResult.data.statusCode >= 400) {
          throw new Error(`HTTP ${proxyResult.data.statusCode}`);
        }
        throw new Error('模型服务未返回流式响应，请检查接口配置');
      }
      if (!response.body) {
        throw new Error('Response body is null');
      }
      const stream = response.body;
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          callbacks.onEnd();
          break;
        }
        if (value) {
          callbacks.onData(value);
        }
      }
    } catch (err) {
      if (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError')) {
        callbacks.onEnd();
        return;
      }
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  })();
  
  return { abort: () => abortController.abort() };
};
// 同步配置到缓存和主进程
const syncConfig = (config: LLMProviderSetting) => {
  if (isElectron() && window.electronAPI?.aiManager) {
    window.electronAPI.aiManager.updateConfig(JSON.parse(JSON.stringify(config)));
  }
};
export const useLLMClientStore = defineStore('llmClientStore', () => {
  const LLMConfig = ref<LLMProviderSetting>(createLLMProvider());
  const profiles = ref<LLMProviderProfiles>({});
  // 获取厂商独立配置副本
  const getProviderConfig = (vendor: LLMVendor) => resolveLLMProvider(profiles.value[vendor] ?? createLLMProvider(vendor));
  // 更新配置字段
  const updateLLMConfig = (updates: Partial<Omit<LLMProviderSetting, 'id'>>) => {
    const next = resolveLLMProvider({ ...LLMConfig.value, ...updates });
    const vendor = next.vendor ?? 'custom';
    const nextProfiles = { ...profiles.value, [vendor]: next };
    if (!llmProviderCache.setLLMProviders({ version: 1, activeVendor: vendor, profiles: nextProfiles })) return false;
    profiles.value = nextProfiles;
    LLMConfig.value = next;
    syncConfig(next);
    return true;
  };
  // 重置配置
  const resetLLMConfig = () => {
    return updateLLMConfig(createLLMProvider(LLMConfig.value.vendor ?? 'custom'));
  };
  // 初始化（从缓存加载）
  const initLLMConfig = () => {
    const cached = llmProviderCache.getLLMProviders();
    if (cached) {
      profiles.value = cached.profiles;
      LLMConfig.value = getProviderConfig(cached.activeVendor);
    }
    syncConfig(LLMConfig.value);
  };
  // 非流式聊天
  const chat = async (body: ChatRequestBody, signal?: AbortSignal, override?: LLMProviderSetting): Promise<OpenAiResponseBody> => {
    const config = resolveLLMProvider(override ?? LLMConfig.value);
    const validationError = getLLMConfigError(config);
    if (validationError) throw new Error(validationError);
    try {
      if (isElectron() && window.electronAPI?.aiManager) {
        return await window.electronAPI.aiManager.chat(body, JSON.parse(JSON.stringify(config)));
      }
      return await webChat(body, config, signal);
    } catch (error) {
      throw new Error(getLLMRequestError(error, config));
    }
  };
  // 流式聊天
  const chatStream = (body: ChatRequestBody, callbacks: ChatStreamCallbacks, override?: LLMProviderSetting) => {
    const config = resolveLLMProvider(override ?? LLMConfig.value);
    const validationError = getLLMConfigError(config);
    if (validationError) {
      callbacks.onError(new Error(validationError));
      return { abort: () => {} };
    }
    const safeCallbacks: ChatStreamCallbacks = { ...callbacks, onError: error => callbacks.onError(new Error(getLLMRequestError(error, config))) };
    if (isElectron() && window.electronAPI?.aiManager) {
      return window.electronAPI.aiManager.chatStream(body, safeCallbacks, JSON.parse(JSON.stringify(config)));
    }
    return webChatStream(body, config, safeCallbacks);
  };
  // 检查 AI 功能是否可用
  const isAvailable = () => {
    return !getLLMConfigError(LLMConfig.value);
  };
  return {
    LLMConfig,
    getProviderConfig,
    updateLLMConfig,
    resetLLMConfig,
    initLLMConfig,
    chat,
    chatStream,
    isAvailable,
  };
});
