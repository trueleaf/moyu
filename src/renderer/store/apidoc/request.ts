import { ApidocRequest } from "@src/types/apidoc/request";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useApidocRequest = defineStore('apidocRequest', () => {
  const url = ref('')
  const headers = ref<ApidocRequest['headers']>({})
  const method = ref('')
  const body = ref<string | FormData>('')
  const changeFinalRequestInfo = (payload: ApidocRequest): void => {
    url.value = payload.url;
    headers.value = payload.headers;
    method.value = payload.method;
    body.value = payload.body;
  }
  return {
    url,
    headers,
    method,
    body,
    changeFinalRequestInfo
  }
})