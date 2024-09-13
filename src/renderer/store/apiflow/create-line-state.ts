import { FLowCreateLineDotState } from '@types/apiflow';
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
