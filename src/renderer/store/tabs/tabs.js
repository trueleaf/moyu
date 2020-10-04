
/** 
 * @description        api文档tabs
 * @author             shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-01-13 14:24
 * @update             2020-01-13 14:24
 */

import Vue from "vue"

export default {
    state: {
        tabs: {}, //
        currentTab: {},
        currentFileTab: {},
    },
    mutations: {
        /** 
         * @description        新增一个tab
         * @author             shuxiaokai
         * @updateAuthor       shuxiaokai
         * @create             2020-01-14 14:27
         * @update             2020-01-14 14:27
         * @param {String}     projectId - 项目id       
         * @param {String}     id- 当前tab的id       
         * @param {String}     title - 接口名称       
         * @param {String}     method - 请求方式       
         */
        addTab(state, payload) {
            const { id, title, method, projectId, nodeType } = payload;
            const docInfo = { id, title, method, projectId, nodeType };
            const isInProject = state.tabs[projectId]; //当前项目是否存在tabs
            if (!isInProject) {
                Vue.set(state.tabs, projectId, []);
            }
            const hasTab = state.tabs[projectId].some(val => val.id === id);
            if (!hasTab) {
                state.tabs[projectId].push(docInfo);
                localStorage.setItem("editDocTabs", JSON.stringify(state.tabs))
            }
        },
        //更新所有tab
        changeAllTabs(state, payload) {
            const { projectId, tabs } = payload;
            if (!state.tabs[projectId]) {
                Vue.set(state.tabs, projectId, []);
            }
            state.tabs[projectId] = tabs;
            localStorage.setItem("editDocTabs", JSON.stringify(state.tabs))
        },
        /** 
         * @description        更新当前被选中的tab
         * @author             shuxiaokai
         * @updateAuthor       shuxiaokai
         * @create             2020-01-14 14:27
         * @update             2020-01-14 14:27
         * @param {String}     projectId - 项目id       
         * @param {String}     id- 当前tab的id       
         * @param {String}     title - 接口名称       
         * @param {String}     method - 请求方式       
         */
        changeCurrentTab(state, payload) {
            if (!payload.id) {
                Vue.set(state.currentTab, payload.projectId, null);
                localStorage.setItem("currentTab", JSON.stringify(state.currentTab));
                return
            }
            const { projectId, id, title, method, nodeType } = payload;
            const docInfo = { id, title, method, projectId, nodeType };
            const isInProject = state.currentTab[projectId]; //当前项目是否存在tabs
            if (!isInProject) {
                Vue.set(state.currentTab, projectId, {});
            }
            state.currentTab[projectId] = docInfo;
            if (nodeType === "file") {
                Vue.set(state.currentFileTab, projectId, docInfo);
            }
            //改变当前tab信息同时需要更新tabs中tab信息
            if (state.tabs[projectId]) {
                for (let i = 0; i < state.tabs[projectId].length; i++) {
                    if (state.tabs[projectId][i].id === docInfo.id) {
                        state.tabs[projectId][i] = docInfo;
                    }
                }
            }
            localStorage.setItem("currentTab", JSON.stringify(state.currentTab))
            localStorage.setItem("currentFileTab", JSON.stringify(state.currentFileTab))
        },
        changeCurrentFileTab(state, payload) {
            const { projectId, id, title, method, nodeType } = payload;
            if (!id) { //清空fileTab
                Vue.set(state.currentFileTab, payload.projectId, null);
                localStorage.setItem("currentFileTab", JSON.stringify(state.currentTab));
                return;
            }
            const docInfo = { id, title, method, projectId, nodeType };
            Vue.set(state.currentFileTab, projectId, docInfo);
            localStorage.setItem("currentFileTab", JSON.stringify(state.currentFileTab))
        },
        //改变tabs文档信息
        changeTabInfo(state, payload) {
            const { tabId, projectId, method } = payload;
            if (state.tabs && state.tabs[projectId]) {
                state.tabs[projectId].forEach(tab => {
                    if (tab.id === tabId) {
                        tab.method = method;
                    }
                })
            }
            localStorage.setItem("currentFileTab", JSON.stringify(state.currentFileTab))
        },

        /** 
         * @description        删除一个tab
         * @author             shuxiaokai
         * @updateAuthor       shuxiaokai
         * @create             2020-01-14 14:24
         * @update             2020-01-14 14:24
         * @param {String}     projectId - 当前项目的id       
         * @param {String}     id - 当前tab的id       
         */
        deleteTab(state, payload) {
            const { projectId, id } = payload;
            let deleteIndex = 0;
            const allTabs = state.tabs[projectId]
            if (allTabs) {
                // allTabs.forEach((val, index) => {
                //     if (val.id === id) {
                //         deleteIndex = index;
                //     }
                // })
                deleteIndex = allTabs.findIndex(val => val.id === id)
                if (state.currentTab[projectId] && id === state.currentTab[projectId].id) {
                    if (allTabs[deleteIndex + 1] != null) { //右侧还有标签
                        this.commit("changeCurrentTab", {
                            projectId,
                            ...allTabs[deleteIndex + 1]
                        })
                    } else if (allTabs[deleteIndex + 1] == null && allTabs[deleteIndex - 1] != null) { //右侧没有标签并且左侧有标签
                        this.commit("changeCurrentTab", {
                            projectId,
                            ...allTabs[deleteIndex - 1]
                        })
                    } else if (allTabs[deleteIndex + 1] == null && allTabs[deleteIndex - 1] == null) { //左右都不存在id
                        this.commit("changeCurrentTab", { projectId });
                        this.commit("changeCurrentFileTab", { projectId });
                    }
                    localStorage.setItem("currentTab", JSON.stringify(state.currentTab));
                }
                allTabs.splice(deleteIndex, 1);
                localStorage.setItem("editDocTabs", JSON.stringify(state.tabs))
                // localStorage.setItem("tabs", JSON.stringify(state.tabs[projectId]));   
            }
        },
        /** 
         * @description        根据起始位置删除
         * @author             shuxiaokai
         * @updateAuthor       shuxiaokai
         * @create             2020-01-14 17:37
         * @update             2020-01-14 17:37
         * @param {String}     projectId - 项目id     
         * @param {Number}     start - 删除起始位置       
         * @param {Number}     num - 删除数量       
         */
        deleteTabByPosition(state, payload) {
            const { projectId, start, num } = payload;
            if (state.tabs[projectId]) {
                state.tabs[projectId].splice(start, num);
            }
            localStorage.setItem("editDocTabs", JSON.stringify(state.tabs))
        },
    }
}
