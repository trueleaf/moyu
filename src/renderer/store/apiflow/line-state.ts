import { FlowLineState } from '@@/apiflow';
import { defineStore } from 'pinia';

export const useFlowLineStateStore = defineStore('lineState', {
  state: (): FlowLineState => {
    return {
      hoverDragLineId: '',
      selectedLineId: '',
      hoverLineId: '',
      dragLineId: '',
      isHoverDragArrow: false,
      isMouseDownDragArrow: false,
      isMove: false,
    };
  },
});
