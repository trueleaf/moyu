import { FlowRenderArea } from '@@/apiflow';
import { defineStore } from 'pinia';

export const useFlowRenderAreaStore = defineStore('renderArea', {
  state: (): FlowRenderArea => {
    return {
      width: 0,
      height: 0,
      offsetX: 0,
      offsetY: 0,
      gridUnit: 15,
    };
  },
});
