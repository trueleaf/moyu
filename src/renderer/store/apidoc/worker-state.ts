import { defineStore } from "pinia";
import { ref } from "vue";

export const useApidocWorkerState = defineStore('apidocWorkerState', () => {
  const sessionState = ref<Record<string, Record<string, unknown>>>({})
  const localState = ref<Record<string, Record<string, unknown>>>({})
  const remoteState = ref<Record<string, Record<string, unknown>>>({})

  const changeSessionState = (payload: { projectId: string, value: Record<string, unknown> }): void => {
    sessionState.value[payload.projectId] = payload.value;
  }

  const changeLocalState = (payload: { projectId: string, value: Record<string, unknown> }): void => {
    localState.value[payload.projectId] = payload.value;
  }
  return {
    sessionState,
    localState,
    remoteState,
    changeSessionState,
    changeLocalState
  }
})
