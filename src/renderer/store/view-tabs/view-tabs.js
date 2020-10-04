/* 
    @description  预览文档tabs
    @author        shuxiaokai
    @create       2019-07-26 17:42"
*/



export default {
    state: {
        tabs: [],
        currentTab: {}
    },
    mutations: {
        addViewTabs(state, payload) {
            const hasTab = state.tabs.some(val => val.id === payload.id);
            if (!hasTab) {
                state.tabs.push(payload)
                localStorage.setItem("viewTabs", JSON.stringify(state.tabs))
            }
        },
        changeAllViewTabs(state, payload) {
            state.tabs = payload
        },
        changeCurrentViewTabs(state, id) {
            const findTab = state.tabs.find(val => val.id === id);
            localStorage.setItem("viewCurrentTab", JSON.stringify(findTab || []));
            state.currentTab = findTab;
        },
        /* 
            @description  删除tabs
            @author        shuxiaokai
            @create       2019-10-23 16:46"
            @params       tabs的id
            @return       null
        */
        removeViewTabs(state, payload) {
            let deleteIndex = 0;
            state.tabs.forEach((val, index) => {
                if (val.id === payload) {
                    deleteIndex = index;
                }
            })
            if (payload === state.currentTab.id) {
                if (state.tabs[deleteIndex + 1] != null) {
                    state.currentTab = state.tabs[deleteIndex + 1];
                } else if (state.tabs[deleteIndex + 1] == null && state.tabs[deleteIndex - 1] != null) {
                    state.currentTab = state.tabs[deleteIndex - 1];
                } else if (state.tabs[deleteIndex + 1] == null && state.tabs[deleteIndex - 1] == null) {
                    state.currentTab = "";
                }
                localStorage.setItem("viewCurrentTab", JSON.stringify(state.currentTab));
            }
            state.tabs.splice(deleteIndex, 1);
            localStorage.setItem("viewTabs", JSON.stringify(state.tabs));
        },
        /* 
            @description  关闭多个标签
            @author        shuxiaokai
            @create       2019-07-21 09:37"
            @params       state<object> store状态
            @params       payload.start<int> 关闭的起始位置
            @params       payload.end<int> 关闭的结束位置
            @return       null
        */
        deleteViewTabs(state, payload) {
            state.tabs.splice(payload.start, payload.num)
        },



    }
}
