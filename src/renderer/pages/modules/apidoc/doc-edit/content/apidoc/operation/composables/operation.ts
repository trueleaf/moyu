/*
|--------------------------------------------------------------------------
| 请求操作：刷新、保存接口、发送请求等
|--------------------------------------------------------------------------
|
*/
import { ref, Ref, computed } from "vue"
import { useStore } from "@/store/index"
import { router } from "@/router/index"
import { sendRequest, stopRequest } from "@/server/request/request"
import { apidocCache } from "@/cache/apidoc"

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
    const projectId = router.currentRoute.value.query.id as string;
    const currentSelectTab = computed(() => {
        const tabs = store.state["apidoc/tabs"].tabs[projectId];
        const currentTab = tabs?.find((tab) => tab.selected) || null;
        return currentTab;
    });
    //发送请求
    const handleSendRequest = () => {
        sendRequest();
    }
    //停止请求
    const handleStopRequest = () => {
        stopRequest();
    };
    //保存文档
    // const handleSaveApidoc = () => {
    //     if (!currentSelectTab.value) {
    //         console.warn("缺少tab信息");
    //         return;
    //     }
    //     loading2.value = true;
    //     const apidocDetail = store.state["apidoc/apidoc"].apidoc;
    //     const params = {
    //         _id: currentSelectTab.value._id,
    //         projectId,
    //         info: apidocDetail.info,
    //         item: apidocDetail.item,
    //     };
    //     axios.post("/api/project/fill_doc", params).then(() => {
    //         //改变tab请求方法
    //         store.commit("apidoc/tabs/changeTabInfoById", {
    //             id: currentSelectTab.value?._id,
    //             field: "head",
    //             value: {
    //                 icon: params.item.method,
    //                 color: "",
    //             },
    //         });
    //         //改变banner请求方法
    //         store.commit("apidoc/banner/changeBannerInfoById", {
    //             id: currentSelectTab.value?._id,
    //             field: "method",
    //             value: params.item.method,
    //         })
    //         //改变origindoc的值
    //         store.commit("apidoc/apidoc/changeOriginApidoc");
    //         //改变tab未保存小圆点
    //         store.commit("apidoc/tabs/changeTabInfoById", {
    //             id: currentSelectTab.value?._id,
    //             field: "saved",
    //             value: true,
    //         });
    //     }).catch((err) => {
    //         //改变tab未保存小圆点
    //         store.commit("apidoc/tabs/changeTabInfoById", {
    //             id: currentSelectTab.value?._id,
    //             field: "saved",
    //             value: false,
    //         });
    //         console.error(err);
    //     }).finally(() => {
    //         loading2.value = false;
    //     });
    // };
    //刷新文档
    const handleFreshApidoc = () => {
        loading3.value = true;
        store.commit("apidoc/response/clearResponseInfo")
        if (currentSelectTab.value) {
            apidocCache.deleteResponse(currentSelectTab.value._id);
        }
        if (currentSelectTab.value?._id.startsWith("local_")) { //通过+按钮新增的空白文档
            setTimeout(() => {
                loading3.value = false;
            }, 500)
            return;
        }
        store.dispatch("apidoc/apidoc/getApidocDetail", {
            id: currentSelectTab.value?._id,
            projectId,
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
