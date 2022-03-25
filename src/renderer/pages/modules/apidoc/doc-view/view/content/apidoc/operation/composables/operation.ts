/*
|--------------------------------------------------------------------------
| 请求操作：刷新、保存接口、发送请求等
|--------------------------------------------------------------------------
|
*/
import { ref, Ref, computed } from "vue"
import { useStore } from "@/pages/modules/apidoc/doc-view/store/index"
import { sendRequest, stopRequest } from "@/server/request/request"
import shareRouter from "../../../../../router/index"

type OperationReturn = {
    /**
     * 保存接口
     */
    loading2: Ref<boolean>,
    /**
    * 刷新接口
    */
    loading3: Ref<boolean>,
    /**
     * 发送请求
     */
    handleSendRequest: () => void,
    /**
     * 停止请求
     */
    handleStopRequest: () => void,
    /**
     * 刷新文档
     */
    handleFreshApidoc: () => void,
}

export default (): OperationReturn => {
    const store = useStore();
    const loading2 = ref(false); //保存接口
    const loading3 = ref(false); //刷新接口
    const projectId = shareRouter.currentRoute.value.query.id as string;
    const currentSelectTab = computed(() => {
        const tabs = store.state["apidoc/tabs"].tabs[projectId];
        const selectedTab = tabs?.find((tab) => tab.selected) || null;
        return selectedTab;
    });
    //发送请求
    const handleSendRequest = () => {
        sendRequest();
    }
    //停止请求
    const handleStopRequest = () => {
        stopRequest();
    };
    //刷新文档
    const handleFreshApidoc = () => {
        loading3.value = true;
        const password = localStorage.getItem("share/password") || ""
        const shareId = shareRouter.currentRoute.value.query.share_id;
        store.dispatch("apidoc/apidoc/getSharedApidocDetail", {
            id: currentSelectTab.value?._id,
            projectId,
            password,
            shareId,
        }).then(() => {
            loading3.value = false;
        })
    };
    return {
        loading2,
        loading3,
        handleSendRequest,
        handleStopRequest,
        // handleSaveApidoc,
        handleFreshApidoc,
    }
}
