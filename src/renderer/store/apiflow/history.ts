import { FlowHistory } from '@types/apiflow'
import { defineStore } from 'pinia'

type FlowHistoryStore = {
  readonly maxHistory: number;
  doingList: FlowHistory[];
  redoList: FlowHistory[];
}
export const useFlowHistoryStore = defineStore('flowHistory', {
  state: (): FlowHistoryStore => {
    return {
      maxHistory: 1000,
      doingList: [],
      redoList: [],
    }
  }
})
