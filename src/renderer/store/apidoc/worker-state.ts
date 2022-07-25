import type { ApidocWorkerState } from "@@/store"

const workerState = {
    namespaced: true,
    state: {
        sessionState: {},
        localState: {},
        remoteState: {},
    },
    mutations: {
        changeSessionState(state: ApidocWorkerState, payload: { projectId: string, value: Record<string, unknown> }): void {
            state.sessionState[payload.projectId] = payload.value;
        },
        changeLocalState(state: ApidocWorkerState, payload: { projectId: string, value: Record<string, unknown> }): void {
            state.localState[payload.projectId] = payload.value;
        },
    },
}

export { workerState }
