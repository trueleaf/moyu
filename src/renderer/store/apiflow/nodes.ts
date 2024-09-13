import { FlowLineInfo, FlowNodeInfo } from '@types/apiflow'
import { defineStore } from 'pinia'

type AddIncomingPayload = {
  fromNodeId: string;
  toNodeId: string;
  lineInfo: FlowLineInfo;
}

export const useFlowNodesStore = defineStore('nodes', {
  state: (): { nodeList: FlowNodeInfo[] } => {
    return {
      nodeList: []
    }
  },
  getters: {
    getNodeById(state) {
      return (nodeId: string) => {
        return state.nodeList.find(node => node.id === nodeId)
      }
    }
  },
  actions: {
    changeNodeStyleInfoById(id: string, payload: Partial<FlowNodeInfo['styleInfo']>) {
      const matchedNode = this.nodeList.find(node => node.id === id);
      if (matchedNode && payload.height != null) {
        matchedNode.styleInfo.height = payload.height
      }
      if (matchedNode && payload.width != null) {
        matchedNode.styleInfo.width = payload.width
      }
      if (matchedNode && payload.offsetX != null) {
        matchedNode.styleInfo.offsetX = payload.offsetX
      }
      if (matchedNode && payload.offsetY != null) {
        matchedNode.styleInfo.offsetY = payload.offsetY
      }
      if (matchedNode && payload.dragZIndex != null) {
        matchedNode.styleInfo.dragZIndex = payload.dragZIndex
      }
    },
    addIncoming(payload: AddIncomingPayload) {
      const { fromNodeId, toNodeId, lineInfo } = payload;
      const matchedToNode = this.nodeList.find(v => v.id === toNodeId);
      const matchedFromNode = this.nodeList.find(v => v.id === fromNodeId);
      const matchedOutcomingLine = matchedFromNode?.outcomingIds.find(outcomingId => outcomingId === lineInfo.id)
      const matchedIncomingLine = matchedToNode?.incomingIds.find(incomingId => incomingId === lineInfo.id)
      const matchedIncomingLineIndex = matchedToNode?.incomingIds.findIndex(incomingId => incomingId === lineInfo.id) as number;
      if (matchedToNode && !matchedIncomingLine && matchedOutcomingLine) {
        matchedToNode.incomingIds.push(matchedOutcomingLine)
      } else if (matchedToNode && matchedIncomingLine && matchedIncomingLineIndex !== -1 && matchedOutcomingLine) {
        matchedToNode.incomingIds[matchedIncomingLineIndex] = matchedOutcomingLine;
      }
    },
  }
})
