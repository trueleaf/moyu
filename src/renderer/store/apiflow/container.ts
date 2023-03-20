import { FlowContainerInfo } from "@@/apiflow"
import { defineStore } from "pinia"

export const useFlowContainerStore = defineStore("container", {
    state: (): FlowContainerInfo => {
        return {
            clientX: 0,
            clientY: 0,
            width: 0,
            height: 0,
        }
    }
})
