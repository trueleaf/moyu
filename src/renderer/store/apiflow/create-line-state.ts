import { FLowCreateLineDotState } from '@@/apiflow';
import { defineStore } from 'pinia';

export const useFlowCreateLineDotStateStore = defineStore('createLineDotState', {
  state: (): FLowCreateLineDotState => {
    return {
      hoverNodeId: '',
      isMouseDown: false,
      hoverPosition: 'left',
    };
  },
});
