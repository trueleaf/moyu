/**
 * tabs导航
 */
import { findNodeById } from "@/helper/index"
import type { ApidocTabsState, ApidocTab } from "@@/store"
import { router } from "@/router/index"

type EditTabPayload<K extends keyof ApidocTab> = {
    id: string,
    field: K,
    value: ApidocTab[K],
};

const tabs = {
    namespaced: true,
    state: {
        tabs: {},
    },
    mutations: {
        //=====================================初始化和更新tab====================================//
        //初始化本地tab
        initLocalTabs(state: ApidocTabsState, payload: { projectId: string }): void {
            const { projectId } = payload;
            const localEditTabs = localStorage.getItem("apidoc/editTabs");
            const tabs: ApidocTabsState["tabs"]  = localEditTabs ? JSON.parse(localEditTabs) : {};
            state.tabs[projectId] = tabs[projectId];
        },
        //更新全部的tab
        updateAllTabs(state: ApidocTabsState, payload: { tabs: ApidocTab[], projectId: string }): void {
            const { tabs, projectId } = payload;
            state.tabs[projectId] = tabs;
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
        },
        //新增一个tab
        addTab(state: ApidocTabsState, payload: ApidocTab): void {
            const { _id, projectId } = payload;
            const tabInfo = payload;
            const isInProject = state.tabs[projectId]; //当前项目是否存在tabs
            if (!isInProject) {
                state.tabs[projectId] = [];
            }
            const selectedTabIndex =  state.tabs[projectId].findIndex((val) => val.selected); //获取之前选中节点index
            state.tabs[projectId].forEach((tab) => tab.selected = false); //选中状态全部清空
            const hasTab = state.tabs[projectId].find((val) => val._id === _id);
            const unFixedTab = state.tabs[projectId].find((val) => !val.fixed);
            const unFixedTabIndex = state.tabs[projectId].findIndex((val) => !val.fixed);

            if (unFixedTab && !hasTab) { //如果tabs里面存在未固定的tab并且是新增一个tab则覆盖未固定
                state.tabs[projectId].splice(unFixedTabIndex, 1, tabInfo)
            } else if (!unFixedTab && !hasTab) { //不存在未固定的并且不存在tab则新增一个tab
                state.tabs[projectId].splice(selectedTabIndex + 1, 0, tabInfo); //添加到已选中的后面
            }

            const matchedTab = state.tabs[projectId].find((val) => val._id === _id) as ApidocTab;
            matchedTab.selected = true;
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
        },
        //固定一个tab
        fixedTab(state: ApidocTabsState, payload: ApidocTab): void {
            const { _id, projectId } = payload;
            const matchedTab = state.tabs[projectId].find((val) => val._id === _id);
            if (matchedTab) {
                matchedTab.fixed = true;
            }
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
        },
        //根据id删除tab
        deleteTabByIds(state: ApidocTabsState, payload: { ids: string[], projectId: string }): void {
            const { ids, projectId } = payload;
            if (!state.tabs[projectId]) {
                return;
            }
            ids.forEach((id) => {
                const deleteIndex = state.tabs[projectId].findIndex((tab) => tab._id === id);
                state.tabs[projectId].splice(deleteIndex, 1)
            })
            const selectTab = state.tabs[projectId].find((tab) => tab.selected);
            const hasTab = state.tabs[projectId].length > 0;
            if (!selectTab && hasTab) {
                const selectTabIndex = state.tabs[projectId].length - 1;
                state.tabs[projectId][selectTabIndex].selected = true;
            }
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
        },
        //根据id选中tab
        selectTabById(state: ApidocTabsState, payload: { id: string, projectId: string }): void {
            const { id, projectId } = payload;
            if (!state.tabs[projectId]) {
                return;
            }
            state.tabs[projectId].forEach((tab) => {
                if (tab._id === id) {
                    tab.selected = true;
                } else {
                    tab.selected = false;
                }
            })
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
        },
        //根据id改变节点属性
        changeTabInfoById<K extends keyof ApidocTab>(state: ApidocTabsState, payload: EditTabPayload<K>): void {
            const { id, field, value } = payload;
            const projectId = router.currentRoute.value.query.id as string;
            const tabs = state.tabs[projectId];
            const editData = findNodeById(tabs, id, {
                idKey: "_id",
            }) as ApidocTab;
            editData[field] = value;
            localStorage.setItem("apidoc/editTabs", JSON.stringify(state.tabs));
        },
    },
}

export { tabs }
