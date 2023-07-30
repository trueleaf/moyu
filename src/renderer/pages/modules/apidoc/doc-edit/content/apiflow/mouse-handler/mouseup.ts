import { toRaw } from 'vue';
import { useFlowConfigStore } from '@/store/apiflow/config';
import { useFlowCreateLineDotStateStore } from '@/store/apiflow/create-line-state';
import { useFlowHistoryStore } from '@/store/apiflow/history';
import { useFlowLineStateStore } from '@/store/apiflow/line-state';
import { useFlowLinesStore } from '@/store/apiflow/lines';
import { useFlowNodeStateStore } from '@/store/apiflow/node-state';
import { useFlowNodesStore } from '@/store/apiflow/nodes';
import { useFlowResizeNodeStateStore } from '@/store/apiflow/resize-node-state';
import { useFlowSelectionStore } from '@/store/apiflow/selection';
import { getNodesInSelection } from '../common/common';

export function changeStateWhenMouseUp(): void {
  const createLineStateStore = useFlowCreateLineDotStateStore();
  const lineStateStore = useFlowLineStateStore()
  const nodeListStore = useFlowNodesStore();
  const resizeNodeDotStateStore = useFlowResizeNodeStateStore();
  const nodeStateStore = useFlowNodeStateStore();
  const linesStore = useFlowLinesStore();
  const configStore = useFlowConfigStore();
  const selectionStore = useFlowSelectionStore()
  const historyStore = useFlowHistoryStore()
  const dragLineId = lineStateStore.dragLineId;
  //历史记录
  if ((nodeStateStore.dragNodeId && nodeStateStore.isMove) || (lineStateStore.isMove)) {
    if (historyStore.doingList.length > historyStore.maxHistory) {
      historyStore.doingList.shift();
    }
    historyStore.doingList.push({
      nodeList: JSON.parse(JSON.stringify(toRaw(nodeListStore.nodeList))),
      lineList: JSON.parse(JSON.stringify(toRaw(linesStore.lineList))),
      configInfo: JSON.parse(JSON.stringify(toRaw(configStore.$state)))
    })
    historyStore.redoList = [];
  }
  // 框选区域
  if (selectionStore.isMouseDown && selectionStore.width) { //存在框选
    const selectedNodeIds = getNodesInSelection()
    selectionStore.selectedNodeIds = selectedNodeIds;
    const selectionNodes = nodeListStore.nodeList.filter(node => selectedNodeIds.includes(node.id))
    if (selectionNodes.length > 0) {
      let offsetX = Infinity;
      let offsetY = Infinity;
      let width = 0;
      let height = 0;
      selectionNodes.forEach(node => {
        if (offsetX > node.styleInfo.offsetX * configStore.zoom) {
          offsetX = node.styleInfo.offsetX * configStore.zoom
        }
        if (offsetY > node.styleInfo.offsetY * configStore.zoom) {
          offsetY = node.styleInfo.offsetY * configStore.zoom
        }
      })
      selectionNodes.forEach(node => {
        const nodeMaxWidth = (node.styleInfo.offsetX + node.styleInfo.width) * configStore.zoom - offsetX;
        const nodeMaxHeight = (node.styleInfo.offsetY + node.styleInfo.height) * configStore.zoom - offsetY;
        if (width < nodeMaxWidth) {
          width = nodeMaxWidth
        }
        if (height < nodeMaxHeight) {
          height = nodeMaxHeight
        }
      })
      selectionStore.$patch({
        selectedNodeArea: {
          offsetX: Math.ceil(offsetX),
          offsetY: Math.ceil(offsetY),
          width: Math.abs(Math.ceil(width)),
          height: Math.abs(Math.ceil(height)),
        },
      })
    }
  }
  lineStateStore.$patch({
    isMouseDownDragArrow: false,
    dragLineId: ''
  })
  createLineStateStore.$patch({
    isMouseDown: false,
  })
  resizeNodeDotStateStore.$patch({
    isMouseDown: false,
    mouseDownClientX: 0,
    mouseDownClientY: 0,
    nodeHeightWhenMouseDown: 0,
    nodeWidthWhenMouseDown: 0,
    nodeOffsetXWhenMouseDown: 0,
    nodeOffsetYWhenMouseDown: 0,
    nodeFixedX: 0,
    nodeFixedY: 0,
  })
  nodeStateStore.$patch({
    isMouseDown: false,
    isMouseDownDragArea: false,
    dragNodeId: '',
    isMove: false,
  })
  nodeListStore.$patch((state) => {
    const matchedNod = state.nodeList.find(node => node.id === nodeStateStore.dragNodeId);
    if (matchedNod) {
      matchedNod.styleInfo.dragZIndex = 0;
    }
  })
  if (dragLineId) {
    for (let j = 0; j < linesStore.lineList.length; j += 1) {
      const matchedLine = linesStore.lineList.find(line => line.id === dragLineId);
      if (matchedLine && matchedLine.width < configStore.minLineWidth && matchedLine.height < configStore.minLineHeight) {
        linesStore.$patch((state) => {
          const delIndex = state.lineList.findIndex(line => line.id === dragLineId);
          state.lineList.splice(delIndex, 1)
        })
        break;
      }
    }
  }
  selectionStore.$patch({
    isMouseDown: false,
    isMouseDownSelectedArea: false,
    startOffsetX: 0,
    startOffsetY: 0,
    endOffsetX: 0,
    endOffsetY: 0,
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  })
  if (selectionStore.selectedNodeIds.length === 0) {
    selectionStore.$patch({
      selectedNodeArea: {
        width: 0,
        height: 0,
        offsetX: 0,
        offsetY: 0,
      },
      nodeOffsetXWhenMouseDown: 0,
      nodeOffsetYWhenMouseDown: 0,
      selectedNodeMouseDownOffsetInfo: []
    })
  }
  lineStateStore.$patch({
    isMove: false
  })
}
