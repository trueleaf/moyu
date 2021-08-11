/**
 * tabs导航
 */
// import { ActionContext } from "vuex"
// import { axios } from "@/api/api"
import type { ApidocTabsState, ApidocTab } from "@@/store"
// import type { Response } from "@@/global"

const tabs = {
    namespaced: true,
    state: {
        tabs: {},
    },
    mutations: {
        // changeProjectBaseInfo(state: ApidocProjectBaseInfoState, payload: ApidocProjectBaseInfoState): void {
        //     state._id = payload._id;
        //     state.projectName = payload.projectName;
        //     state.variables = payload.variables;
        //     state.mindParams = payload.mindParams;
        //     state.paramsTemplate = payload.paramsTemplate;
        //     state.rules = payload.rules;
        //     state.hosts = payload.hosts;
        // }
        addTab(state: ApidocTabsState, payload: ApidocTab): void {
            const { _id, projectId } = payload;
            const tabInfo = payload;
            const isInProject = state.tabs[projectId]; //当前项目是否存在tabs
            if (!isInProject) {
                state.tabs[projectId] = [];
            }
            const hasTab = state.tabs[projectId].find((val) => val._id === _id);
            const unFixedTabIndex = state.tabs[projectId].findIndex((val) => !val.fixed);
            const hasUnfixedTab = unFixedTabIndex !== -1
            if (hasUnfixedTab && !hasTab) { //如果tabs里面存在未固定的tab并且是新增一个tab则覆盖未固定
                state.tabs[projectId].splice(unFixedTabIndex, 1, tabInfo)
            } else if (unFixedTabIndex !== -1 && hasTab) { //如果tabs里面存在未固定的tab并且不是新增一个tab则固定当前标签
                state.tabs[projectId][unFixedTabIndex].fixed = true;
            } else if (!hasUnfixedTab && !hasTab) { //不存在未固定的并且不存在tab则新增一个tab
                state.tabs[projectId].push(tabInfo);
            }
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
        },
    },
}

export { tabs }
