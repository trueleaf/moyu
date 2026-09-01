import { got } from 'got';
import { buildLLMRequestBody, getLLMConfigError, getLLMRequestError, resolveLLMProvider } from '../../config/llmProviders';
import type { ChatRequestBody, OpenAiResponseBody, LLMProviderSetting, ChatStreamCallbacks } from '@src/types/ai/agent.type';

// AI 请求超时时间（60秒）
const AI_REQUEST_TIMEOUT = 60 * 1000;
// LLM 客户端类
export class LLMClient {
  private config: LLMProviderSetting = null!;
  // 更新配置
  updateConfig(newConfig: LLMProviderSetting): void {
    this.config = newConfig;
  }
  // 非流式聊天
  async chat(body: ChatRequestBody, override?: LLMProviderSetting): Promise<OpenAiResponseBody> {
    if (!override && !this.config) {
      throw new Error('LLM 配置未初始化，请先配置 Base URL 和 Model');
    }
    const config = resolveLLMProvider(override ?? this.config);
    const validationError = getLLMConfigError(config);
    if (validationError) throw new Error(validationError);
    const { apiKey, baseURL, model, customHeaders } = config;
    if (!baseURL || !model) {
      throw new Error('请先配置 Base URL 和 Model');
    }
    const requestBody = buildLLMRequestBody(body, config, false);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    customHeaders?.forEach(h => {
      if (h.key) {
        headers[h.key] = h.value;
      }
    });
    const responseType = body.response_format?.type === 'json_object' ? 'json' : 'json';
    const response = await got.post<OpenAiResponseBody>(
      baseURL,
      {
        headers,
        json: requestBody,
        responseType,
        timeout: { request: AI_REQUEST_TIMEOUT }
      }
    ).catch((error: unknown) => { throw new Error(getLLMRequestError(error, config)); });
    const responseBody = response.body as unknown;
    if (responseBody && typeof responseBody === 'object' && 'success' in responseBody && responseBody.success === false && 'message' in responseBody) {
      const errorResponse = responseBody as { success: boolean; code: string; message: string };
      throw new Error(errorResponse.message);
    }
    return response.body;
  }
  // 流式聊天
  chatStream(body: ChatRequestBody, callbacks: ChatStreamCallbacks, override?: LLMProviderSetting) {
    const abortController = new AbortController();
    if (!override && !this.config) {
      callbacks.onError(new Error('LLM 配置未初始化，请先配置 Base URL 和 Model'));
      return {
        abort: () => abortController.abort()
      };
    }
    const config = resolveLLMProvider(override ?? this.config);
    const { apiKey, baseURL, customHeaders } = config;
    const validationError = getLLMConfigError(config);
    if (validationError) {
      callbacks.onError(new Error(validationError));
      return {
        abort: () => abortController.abort()
      };
    }
    const requestBody = buildLLMRequestBody(body, config, true);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }
    customHeaders?.forEach(h => {
      if (h.key) {
        headers[h.key] = h.value;
      }
    });
    try {
      const stream = got.stream.post(baseURL, {
        headers,
        json: requestBody,
        signal: abortController.signal,
        timeout: { request: AI_REQUEST_TIMEOUT }
      });
      stream.on('data', (chunk: Buffer) => {
        callbacks.onData(new Uint8Array(chunk));
      });
      stream.on('end', () => {
        callbacks.onEnd();
      });
      stream.on('error', (error: Error) => {
        if (error.name !== 'AbortError') {
          callbacks.onError(new Error(getLLMRequestError(error, config)));
        }
      });
    } catch (error) {
      callbacks.onError(new Error(getLLMRequestError(error, config)));
    }
    return {
      abort: () => abortController.abort()
    };
  }
}
// 导出全局单例
export const globalLLMClient = new LLMClient();
