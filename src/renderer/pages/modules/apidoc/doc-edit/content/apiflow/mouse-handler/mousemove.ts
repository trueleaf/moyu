import { checkPointIsInArea, cloneDeep } from '@/helper';
import { useFlowConfigStore } from '@/store/apiflow/config';
import { useFlowContainerStore } from '@/store/apiflow/container';
import { useFlowCreateLineDotStateStore } from '@/store/apiflow/create-line-state';
import { useFlowLineStateStore } from '@/store/apiflow/line-state';
import { useFlowLinesStore } from '@/store/apiflow/lines';
import { useFlowNodeStateStore } from '@/store/apiflow/node-state';
import { useFlowNodesStore } from '@/store/apiflow/nodes';
import { useFlowResizeNodeStateStore } from '@/store/apiflow/resize-node-state';
import { useFlowSelectionStore } from '@/store/apiflow/selection';
import { FlowNodeInfo, FlowValidCreateLineArea, FlowValidResizeArea } from '@types/apiflow';
import { drawLineWhenMoveOrResize, getCreateLineArea, getDrawInfoByPoint, getHoverPosition, getQuardantByPoint, getResizeBarArea, mouseIsInLine, repaintLine } from '../common/common';

/**
 * createLineDot上面移动
 */
export function changeCreateLineDotStateWhenMouseMove(e: MouseEvent): void {
  const createLineDotState = useFlowCreateLineDotStateStore()
  const containerStore = useFlowContainerStore()
  const nodesStore = useFlowNodesStore()
  const nodeStateStore = useFlowNodeStateStore()
  const selectionStore = useFlowSelectionStore()
  if (selectionStore.isHover) {
    createLineDotState.$patch({
      hoverNodeId: '',
      hoverPosition: '',
    })
    nodeStateStore.$patch({
      hoverNodeId: '',
    })
    return
  }
  if (nodeStateStore.isMouseDown) {
    return;
  }
  const mouseOffsetX = e.clientX - containerStore.clientX;
  const mouseOffsetY = e.clientY - containerStore.clientY;
  const getMouseIsInCreateDot = (createLineArea: FlowValidCreateLineArea, { x, y }: { x: number; y: number }) => {
    const { leftArea, rightArea, topArea, bottomArea } = createLineArea;
    if (x > leftArea.offsetX && x < leftArea.offsetX2 && y > leftArea.offsetY && y < leftArea.offsetY2) {
      return 'left';
    }
    if (x > rightArea.offsetX && x < rightArea.offsetX2 && y > rightArea.offsetY && y < rightArea.offsetY2) {
      return 'right';
    }
    if (x > topArea.offsetX && x < topArea.offsetX2 && y > topArea.offsetY && y < topArea.offsetY2) {
      return 'top';
    }
    if (x > bottomArea.offsetX && x < bottomArea.offsetX2 && y > bottomArea.offsetY && y < bottomArea.offsetY2) {
      return 'bottom';
    }
    return '';
  };
  const matchedNodes: {
    position: ReturnType<typeof getMouseIsInCreateDot>;
    node: FlowNodeInfo;
  }[] = [];
  for (let i = 0; i < nodesStore.nodeList.length; i += 1) {
    const node = nodesStore.nodeList[i];
    const createLineArea = getCreateLineArea(node);
    const mouseInCreateDotPosition = getMouseIsInCreateDot(createLineArea, {
      x: mouseOffsetX,
      y: mouseOffsetY,
    });
    if (mouseInCreateDotPosition && (!nodeStateStore.hoverNodeId || nodeStateStore.hoverNodeId === node.id)) {
      matchedNodes.push({
        node,
        position: mouseInCreateDotPosition,
      });
    }
  }
  if (matchedNodes.length === 0) {
    createLineDotState.$patch({
      hoverNodeId: '',
      hoverPosition: '',
    })
  } else {
    let maxZIndexNode = matchedNodes[0];
    for (let i = 1; i < matchedNodes.length; i += 1) {
      if (matchedNodes[i].node.styleInfo.zIndex > maxZIndexNode.node.styleInfo.zIndex) {
        maxZIndexNode = matchedNodes[i];
      }
    }
    nodeStateStore.$patch({
      hoverNodeId: maxZIndexNode.node.id,
    })
    createLineDotState.$patch({
      hoverNodeId: maxZIndexNode.node.id,
      hoverPosition: maxZIndexNode.position,
    })
  }
}
/**
 * resizeNodeDot上面移动
 */
export function changeResizeDotStateWhenMouseMove(e: MouseEvent): void {
  const resizeNodeDotStore = useFlowResizeNodeStateStore()
  const containerStore = useFlowContainerStore()
  const nodesStore = useFlowNodesStore()
  const nodeStateStore = useFlowNodeStateStore()
  const selectionStore = useFlowSelectionStore()
  if (selectionStore.isHover) {
    resizeNodeDotStore.$patch({
      hoverNodeId: '',
      hoverPosition: ''
    })
    return
  }
  const mouseOffsetX = e.clientX - containerStore.clientX
  const mouseOffsetY = e.clientY - containerStore.clientY
  const getResizeDotArea = (resizeDotArea: FlowValidResizeArea, { x, y }: { x: number; y: number }) => {
    const { leftTopArea, rightTopArea, leftBottomArea, rightBottomArea } = resizeDotArea;
    if (x > leftTopArea.offsetX && x < leftTopArea.offsetX2 && y > leftTopArea.offsetY && y < leftTopArea.offsetY2) {
      return 'leftTop';
    }
    if (x > rightTopArea.offsetX && x < rightTopArea.offsetX2 && y > rightTopArea.offsetY && y < rightTopArea.offsetY2) {
      return 'rightTop';
    }
    if (x > leftBottomArea.offsetX && x < leftBottomArea.offsetX2 && y > leftBottomArea.offsetY && y < leftBottomArea.offsetY2) {
      return 'leftBottom';
    }
    if (x > rightBottomArea.offsetX && x < rightBottomArea.offsetX2 && y > rightBottomArea.offsetY && y < rightBottomArea.offsetY2) {
      return 'rightBottom';
    }
    return '';
  }
  for (let i = 0; i < nodesStore.nodeList.length; i += 1) {
    const node = nodesStore.nodeList[i];
    const resizeArea = getResizeBarArea(node);
    const resizeNodeArea = getResizeDotArea(resizeArea, {
      x: mouseOffsetX,
      y: mouseOffsetY
    });
    if (resizeNodeArea && nodeStateStore.activeNodeId === node.id && !resizeNodeDotStore.isMouseDown) {
      resizeNodeDotStore.$patch({
        hoverNodeId: node.id,
        hoverPosition: resizeNodeArea
      })
      break;
    }
    if (!resizeNodeDotStore.isMouseDown) { //click状态保持不变
      resizeNodeDotStore.$patch({
        hoverNodeId: '',
        hoverPosition: ''
      })
    }
  }
}
/**
 * node上面移动
 */
export function changeNodeStateWhenMouseMove(e: MouseEvent): void {
  const createLineDotState = useFlowCreateLineDotStateStore()
  const containerStore = useFlowContainerStore()
  const nodesStore = useFlowNodesStore()
  const nodeStateStore = useFlowNodeStateStore()
  const configStore = useFlowConfigStore();
  const selectionStore = useFlowSelectionStore();
  if (selectionStore.isHover) {
    return
  }
  const { clientX: containerClientX, clientY: containerClientY } = containerStore;
  const mouseOffsetX = (e.clientX - containerStore.clientX);
  const mouseOffsetY = (e.clientY - containerStore.clientY);
  const matchedNodes: FlowNodeInfo[] = [];
  for (let i = 0; i < nodesStore.nodeList.length; i += 1) {
    const node = nodesStore.nodeList[i];
    const { offsetX, width, offsetY, height } = node.styleInfo;
    const isInX = mouseOffsetX >= offsetX * configStore.zoom && mouseOffsetX < (offsetX + width) * configStore.zoom;
    const isInY = mouseOffsetY >= offsetY * configStore.zoom && mouseOffsetY < (offsetY + height) * configStore.zoom;
    if (isInX && isInY) {
      matchedNodes.push(node);
    }
  }
  if (matchedNodes.length === 0 && !createLineDotState.hoverNodeId) {
    nodeStateStore.$patch({
      hoverNodeId: '',
      isMouseHoverDragArea: false,
    })
  } else if (matchedNodes.length !== 0) {
    let maxZIndexNode = matchedNodes[0]
    for (let i = 1; i < matchedNodes.length; i += 1) {
      if (matchedNodes[i].styleInfo.zIndex > maxZIndexNode.styleInfo.zIndex) {
        maxZIndexNode = matchedNodes[i]
      }
    }
    const isInDragArea = checkPointIsInArea({
      clientX: e.clientX,
      clientY: e.clientY,
    }, {
      leftTopPosition: {
        clientX: containerClientX + maxZIndexNode.canDragArea.leftTopPosition.offsetX + maxZIndexNode.styleInfo.offsetX,
        clientY: containerClientY + maxZIndexNode.canDragArea.leftTopPosition.offsetY + maxZIndexNode.styleInfo.offsetY,
      },
      rightBottomPosition: {
        clientX: containerClientX + maxZIndexNode.canDragArea.leftTopPosition.offsetX + maxZIndexNode.styleInfo.offsetX + maxZIndexNode.styleInfo.width,
        clientY: containerClientY + maxZIndexNode.canDragArea.leftTopPosition.offsetY + maxZIndexNode.styleInfo.offsetY + 30,
      }
    })
    nodeStateStore.$patch({
      hoverNodeId: maxZIndexNode.id,
      isMouseHoverDragArea: isInDragArea,
    })
  }
}
/**
 * line上面移动
 */
export function changeLineStateWhenMouseMove(e: MouseEvent): void {
  const linesStore = useFlowLinesStore()
  const lineStateStore = useFlowLineStateStore()
  const nodeStateStore = useFlowNodeStateStore()
  // const configStore = useFlowConfigStore();
  for (let i = 0; i < linesStore.lineList.length; i += 1) {
    const line = linesStore.lineList[i];
    const { arrowInfo: { leftTopPoint, rightBottomPoint } } = line;
    const isXInLineArrow = e.clientX >= leftTopPoint.clientX && e.clientX <= rightBottomPoint.clientX;
    const isYInLineArrow = e.clientY >= leftTopPoint.clientY && e.clientY <= rightBottomPoint.clientY;
    if (isXInLineArrow && isYInLineArrow && !nodeStateStore.isMove) { //鼠标是否在箭头上
      lineStateStore.$patch({
        hoverDragLineId: line.id,
        isHoverDragArrow: true,
      })
      break
    }
    if (mouseIsInLine(e, line) && !nodeStateStore.isMove) {
      lineStateStore.$patch({
        hoverDragLineId: '',
        hoverLineId: line.id,
        isHoverDragArrow: false,
      })
      break
    }
    lineStateStore.$patch({
      hoverDragLineId: '',
      isHoverDragArrow: false,
      hoverLineId: '',
    })
  }
}
/**
 * node移动
 */
export function changeNodeWhenMouseMove(e: MouseEvent): void {
  const createLineStateStore = useFlowCreateLineDotStateStore();
  const resizeNodeDotStateStore = useFlowResizeNodeStateStore();
  const nodeStateStore = useFlowNodeStateStore();
  const nodesStore = useFlowNodesStore();
  const lineStateStore = useFlowLineStateStore();
  const configStore = useFlowConfigStore();
  if (!nodeStateStore.isMouseDownDragArea || !nodeStateStore.isMouseDown || resizeNodeDotStateStore.isMouseDown || lineStateStore.isHoverDragArrow || createLineStateStore.isMouseDown) {
    return
  }
  const matchedNode = nodesStore.nodeList.find(node => node.id === nodeStateStore.dragNodeId)
  if (matchedNode) {
    const relativeX = e.clientX - nodeStateStore.mouseDownClientX; //相对于mousedown位置移动距离
    const relativeY = e.clientY - nodeStateStore.mouseDownClientY; //相对于mousedown位置移动距离
    nodesStore.$patch((state) => {
      const matched = state.nodeList.find(node => node.id === matchedNode.id)
      if (matched) {
        matched.styleInfo.offsetX = Math.ceil(nodeStateStore.nodeOffsetXWhenMouseDown + relativeX / configStore.zoom);
        matched.styleInfo.offsetY = Math.ceil(nodeStateStore.nodeOffsetYWhenMouseDown + relativeY / configStore.zoom);
      }
    })
    nodeStateStore.$patch({
      isMove: true
    })
    drawLineWhenMoveOrResize(matchedNode)
  }
}
/**
 * node放大缩小
 */
export function resizeNodeWhenMouseMove(e: MouseEvent): void {
  const resizeNodeDotStateStore = useFlowResizeNodeStateStore();
  const nodesStore = useFlowNodesStore();
  const configStore = useFlowConfigStore();
  if (!resizeNodeDotStateStore.isMouseDown) {
    return
  }
  const matchedNode = nodesStore.nodeList.find(node => node.id === resizeNodeDotStateStore.hoverNodeId)
  if (matchedNode) {
    const relativeX = Math.ceil((e.clientX - resizeNodeDotStateStore.mouseDownClientX) / configStore.zoom); //相对x移动距离
    const relativeY = Math.ceil((e.clientY - resizeNodeDotStateStore.mouseDownClientY) / configStore.zoom); //相对y移动距离
    if (resizeNodeDotStateStore.hoverPosition === 'leftTop') {
      if (resizeNodeDotStateStore.nodeWidthWhenMouseDown - relativeX < configStore.nodeMinWidth) {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          width: configStore.nodeMinWidth,
          offsetX: resizeNodeDotStateStore.nodeFixedX
        });
      } else {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          width: (resizeNodeDotStateStore.nodeWidthWhenMouseDown - relativeX),
          offsetX: (resizeNodeDotStateStore.nodeOffsetXWhenMouseDown + relativeX),
        });
      }
      if (resizeNodeDotStateStore.nodeHeightWhenMouseDown - relativeY < configStore.nodeMinHeight) {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          height: configStore.nodeMinHeight,
          offsetY: resizeNodeDotStateStore.nodeFixedY
        });
      } else {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          height: (resizeNodeDotStateStore.nodeHeightWhenMouseDown - relativeY),
          offsetY: (resizeNodeDotStateStore.nodeOffsetYWhenMouseDown + relativeY)
        });
      }
    } else if (resizeNodeDotStateStore.hoverPosition === 'rightTop') {
      if (resizeNodeDotStateStore.nodeWidthWhenMouseDown + relativeX < configStore.nodeMinWidth) {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          width: configStore.nodeMinWidth,
          offsetX: resizeNodeDotStateStore.nodeFixedX
        });
      } else {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          width: (resizeNodeDotStateStore.nodeWidthWhenMouseDown + relativeX)
        });
      }
      if (resizeNodeDotStateStore.nodeHeightWhenMouseDown - relativeY < configStore.nodeMinHeight) {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          height: configStore.nodeMinHeight,
          offsetY: resizeNodeDotStateStore.nodeFixedY,
        });
      } else {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          height: (resizeNodeDotStateStore.nodeHeightWhenMouseDown - relativeY),
          offsetY: (resizeNodeDotStateStore.nodeOffsetYWhenMouseDown + relativeY),
        });
      }
    } else if (resizeNodeDotStateStore.hoverPosition === 'leftBottom') {
      if (resizeNodeDotStateStore.nodeWidthWhenMouseDown - relativeX < configStore.nodeMinWidth) {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          width: configStore.nodeMinWidth,
          offsetX: resizeNodeDotStateStore.nodeFixedX,
        });
      } else {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          width: (resizeNodeDotStateStore.nodeWidthWhenMouseDown - relativeX),
          offsetX: (resizeNodeDotStateStore.nodeOffsetXWhenMouseDown + relativeX),
        });
      }
      if (resizeNodeDotStateStore.nodeHeightWhenMouseDown + relativeY < configStore.nodeMinHeight) {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          height: configStore.nodeMinHeight,
          offsetY: resizeNodeDotStateStore.nodeFixedY,
        });
      } else {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          height: (resizeNodeDotStateStore.nodeHeightWhenMouseDown + relativeY),
          offsetY: (resizeNodeDotStateStore.nodeOffsetYWhenMouseDown),
        });
      }
    } else if (resizeNodeDotStateStore.hoverPosition === 'rightBottom') {
      if (resizeNodeDotStateStore.nodeWidthWhenMouseDown + relativeX < configStore.nodeMinWidth) {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          width: configStore.nodeMinWidth,
          offsetX: resizeNodeDotStateStore.nodeFixedX,
        });
      } else {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          width: (resizeNodeDotStateStore.nodeWidthWhenMouseDown + relativeX),
        });
      }
      if (resizeNodeDotStateStore.nodeHeightWhenMouseDown + relativeY < configStore.nodeMinHeight) {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          height: configStore.nodeMinHeight,
        });
      } else {
        nodesStore.changeNodeStyleInfoById(resizeNodeDotStateStore.hoverNodeId, {
          height: (resizeNodeDotStateStore.nodeHeightWhenMouseDown + relativeY),
          offsetY: (resizeNodeDotStateStore.nodeOffsetYWhenMouseDown),
        });
      }
    }
    drawLineWhenMoveOrResize(matchedNode)
  }
}
/**
 * 绘制线条(创建线条或者拖拽线条箭头)
 */
export function drawLineWhenMouseMove(e: MouseEvent): void {
  const createLineDotState = useFlowCreateLineDotStateStore();
  const nodesStore = useFlowNodesStore();
  const containerStore = useFlowContainerStore()
  const linesStore = useFlowLinesStore()
  const lineStateStore = useFlowLineStateStore()
  const configStore = useFlowConfigStore()
  const nodeStateStore = useFlowNodeStateStore()
  if (!createLineDotState.isMouseDown && !lineStateStore.isMouseDownDragArrow) {
    return
  }
  const dragLineId = lineStateStore.dragLineId;
  const matchedLine = linesStore.lineList.find(line => line.id === dragLineId)
  const matchedNode = nodesStore.nodeList.find(node => node.outcomingIds.includes(dragLineId))
  const matchedToNode = nodesStore.nodeList.find(node => node.incomingIds.includes(dragLineId))
  if (!matchedLine || !matchedNode) {
    return
  }
  const { fromPosition } = matchedLine
  const startPoint = {
    x: 0,
    y: 0,
  }
  if (fromPosition === 'left') {
    startPoint.x = matchedNode.styleInfo.offsetX;
    startPoint.y = matchedNode.styleInfo.offsetY + matchedNode.styleInfo.height / 2;
  } else if (fromPosition === 'top') {
    startPoint.x = matchedNode.styleInfo.offsetX + matchedNode.styleInfo.width / 2;
    startPoint.y = matchedNode.styleInfo.offsetY;
  } else if (fromPosition === 'right') {
    startPoint.x = matchedNode.styleInfo.offsetX + matchedNode.styleInfo.width;
    startPoint.y = matchedNode.styleInfo.offsetY + matchedNode.styleInfo.height / 2;
  } else if (fromPosition === 'bottom') {
    startPoint.x = matchedNode.styleInfo.offsetX + matchedNode.styleInfo.width / 2;
    startPoint.y = matchedNode.styleInfo.offsetY + matchedNode.styleInfo.height;
  }
  const endPoint = {
    x: e.clientX - Math.ceil(containerStore.clientX),
    y: e.clientY - Math.ceil(containerStore.clientY),
  }
  startPoint.x = Math.floor(startPoint.x * configStore.zoom);
  startPoint.y = Math.floor(startPoint.y * configStore.zoom);
  const clonedToNode = cloneDeep(matchedNode)
  clonedToNode.styleInfo.width = Math.floor(clonedToNode.styleInfo.width * configStore.zoom);
  clonedToNode.styleInfo.height = Math.floor(clonedToNode.styleInfo.height * configStore.zoom);
  clonedToNode.styleInfo.offsetX = Math.floor(clonedToNode.styleInfo.offsetX * configStore.zoom);
  clonedToNode.styleInfo.offsetY = Math.floor(clonedToNode.styleInfo.offsetY * configStore.zoom);
  const drawInfo = getDrawInfoByPoint(startPoint, endPoint, {
    fromNode: clonedToNode,
    fromPosition,
  });
  if (drawInfo.isConnectedNode) {
    nodeStateStore.$patch({
      hoverNodeId: drawInfo.connectedNodeId
    })
    linesStore.changeLineInfoById(matchedLine.id, {
      toPosition: drawInfo.connectedPosition,
      arrowInfo: {
        leftTopPoint: {
          clientX: drawInfo.lineInfo.arrowInfo.leftTopPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
          clientY: drawInfo.lineInfo.arrowInfo.leftTopPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
        },
        rightBottomPoint: {
          clientX: drawInfo.lineInfo.arrowInfo.rightBottomPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
          clientY: drawInfo.lineInfo.arrowInfo.rightBottomPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
        },
      }
    });
    nodesStore.addIncoming({
      fromNodeId: matchedNode.id,
      toNodeId: drawInfo.connectedNodeId,
      lineInfo: matchedLine,
    })
  } else {
    linesStore.changeLineInfoById(matchedLine.id, {
      toPosition: '',
      arrowInfo: {
        leftTopPoint: {
          clientX: drawInfo.lineInfo.arrowInfo.leftTopPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
          clientY: drawInfo.lineInfo.arrowInfo.leftTopPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
        },
        rightBottomPoint: {
          clientX: drawInfo.lineInfo.arrowInfo.rightBottomPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
          clientY: drawInfo.lineInfo.arrowInfo.rightBottomPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
        },
      }
    });
    nodesStore.$patch((state) => {
      const matched = state.nodeList.find(node => node.id === matchedToNode?.id)
      if (matched) {
        const delIndex = matched.incomingIds.findIndex(lineId => lineId === matchedLine.id);
        matched.incomingIds.splice(delIndex, 1)
      }
    })
  }
  const hoverPosition = getHoverPosition(matchedLine, drawInfo);
  linesStore.changeLineInfoById(matchedLine.id, {
    id: matchedLine.id,
    offsetX: drawInfo.x,
    offsetY: drawInfo.y,
    width: drawInfo.width,
    height: drawInfo.height,
    lineStartOffsetX: startPoint.x,
    lineStartOffsetY: startPoint.y,
    lineEndOffsetX: e.clientX - containerStore.clientX,
    lineEndOffsetY: e.clientY - containerStore.clientY,
    canHoverPosition: hoverPosition,
    arrowInfo: {
      leftTopPoint: {
        clientX: drawInfo.lineInfo.arrowInfo.leftTopPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
        clientY: drawInfo.lineInfo.arrowInfo.leftTopPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
      },
      rightBottomPoint: {
        clientX: drawInfo.lineInfo.arrowInfo.rightBottomPoint.x + drawInfo.x + Math.ceil(containerStore.clientX),
        clientY: drawInfo.lineInfo.arrowInfo.rightBottomPoint.y + drawInfo.y + Math.ceil(containerStore.clientY),
      },
    }
  });
  const canvasDom = document.querySelector(`#line__${matchedLine.id}`) as HTMLCanvasElement;
  if (canvasDom) {
    repaintLine(canvasDom, drawInfo);
  }
  lineStateStore.$patch({
    isMove: true
  })
}
/**
 * 创建选中区域
 */
export function createSelectionWhenMouseMove(e: MouseEvent): void {
  const selectionStore = useFlowSelectionStore();
  const containerStore = useFlowContainerStore();
  if (!selectionStore.isMouseDown) {
    return
  }
  if (selectionStore.isHover && selectionStore.isMouseDown) {
    return
  }
  const startOffsetX = selectionStore.startOffsetX;
  const startOffsetY = selectionStore.startOffsetY;
  const endOffsetX = e.clientX - containerStore.clientX;
  const endOffsetY = e.clientY - containerStore.clientY;
  selectionStore.$patch({
    isMouseDown: true,
    endOffsetX,
    endOffsetY,
  })
  const coordinate = getQuardantByPoint({
    x: selectionStore.startOffsetX,
    y: selectionStore.startOffsetY
  }, {
    x: endOffsetX,
    y: endOffsetY
  });
  if (coordinate === '1') { //第一象限
    selectionStore.$patch({
      width: Math.abs(endOffsetX - startOffsetX),
      height: Math.abs(endOffsetY - startOffsetY),
      offsetX: startOffsetX,
      offsetY: endOffsetY,
    })
  } else if (coordinate === '2') {
    selectionStore.$patch({
      width: Math.abs(endOffsetX - startOffsetX),
      height: Math.abs(endOffsetY - startOffsetY),
      offsetX: endOffsetX,
      offsetY: endOffsetY,
    })
  } else if (coordinate === '3') {
    selectionStore.$patch({
      width: Math.abs(endOffsetX - startOffsetX),
      height: Math.abs(endOffsetY - startOffsetY),
      offsetX: endOffsetX,
      offsetY: startOffsetY,
    })
  } else if (coordinate === '4') {
    selectionStore.$patch({
      width: Math.abs(endOffsetX - startOffsetX),
      height: Math.abs(endOffsetY - startOffsetY),
      offsetX: startOffsetX,
      offsetY: startOffsetY,
    })
  }
}
/**
 * 在创建区域移动
 */
export function changeSelectionStateWhenMouseMove(e: MouseEvent): void {
  const selectionStore = useFlowSelectionStore();
  const containerStore = useFlowContainerStore();
  selectionStore.$patch({
    isHover: false
  })
  if (selectionStore.selectedNodeIds.length === 0) {
    return
  }
  const mouseOffsetX = (e.clientX - containerStore.clientX);
  const mouseOffsetY = (e.clientY - containerStore.clientY);
  const { offsetX, width, offsetY, height } = selectionStore.selectedNodeArea;
  const isInX = mouseOffsetX >= offsetX && mouseOffsetX < (offsetX + width);
  const isInY = mouseOffsetY >= offsetY && mouseOffsetY < (offsetY + height);
  if (isInX && isInY) {
    selectionStore.$patch({
      isHover: true,
    })
  }
}
/**
 * 选中区域移动
 */
export function moveSelectedAreaWhenMouseMove(e: MouseEvent): void {
  const selectionStore = useFlowSelectionStore();
  const containerStore = useFlowContainerStore();
  const nodesStore = useFlowNodesStore();
  if (!selectionStore.isMouseDownSelectedArea) {
    return
  }
  const relativeX = e.clientX - selectionStore.startOffsetX - containerStore.clientX; //相对于mousedown位置移动距离
  const relativeY = e.clientY - selectionStore.startOffsetY - containerStore.clientY; //相对于mousedown位置移动距离
  const selectedNodes = nodesStore.nodeList.filter(node => selectionStore.selectedNodeIds.includes(node.id));
  const configStore = useFlowConfigStore();
  selectedNodes.forEach(node => {
    const matched = selectionStore.selectedNodeMouseDownOffsetInfo.find(info => info.id === node.id)
    if (matched) {
      node.styleInfo.offsetX = Math.ceil(matched.nodeOffsetXWhenMouseDown + relativeX / configStore.zoom);
      node.styleInfo.offsetY = Math.ceil(matched.nodeOffsetYWhenMouseDown + relativeY / configStore.zoom);
    }
  })
  selectionStore.$patch({
    selectedNodeArea: {
      offsetX: Math.ceil(selectionStore.nodeOffsetXWhenMouseDown + relativeX),
      offsetY: Math.ceil(selectionStore.nodeOffsetYWhenMouseDown + relativeY),
    },
  })
  nodesStore.nodeList.forEach(node => {
    drawLineWhenMoveOrResize(node)
  })
}
