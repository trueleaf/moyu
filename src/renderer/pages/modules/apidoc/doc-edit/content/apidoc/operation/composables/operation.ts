/*
|--------------------------------------------------------------------------
| 请求操作：刷新、保存接口、发送请求等
|--------------------------------------------------------------------------
|
*/
import { ref, Ref, computed } from "vue"
import { useStore } from "@/store/index"
import { router } from "@/router/index"
import { axios } from "@/api/api"
import { sendRequest } from "@/server/request/request"

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
     * 保存文档
     */
    handleSaveApidoc: () => void,
    /**
     * 刷新文档
     */
    handleFreshApidoc: () => void,
    /**
     * 预览文档
     */
    handleOpenViewDoc: () => void,
}

export default (): OperationReturn => {
    const store = useStore();
    const loading2 = ref(false); //保存接口
    const loading3 = ref(false); //刷新接口
    const projectId = router.currentRoute.value.query.id as string;
    const currentSelectTab = computed(() => {
        const tabs = store.state["apidoc/tabs"].tabs[projectId];
        const currentSelectTab = tabs?.find((tab) => tab.selected) || null;
        return currentSelectTab;
    });
    //发送请求
    const handleSendRequest = () => {
        sendRequest();
    }
    //停止请求
    const handleStopRequest = () => {
        console.log(2)
    };
    //保存文档
    const handleSaveApidoc = () => {
        if (!currentSelectTab.value) {
            console.warn("缺少tab信息");
            return;
        }
        loading2.value = true;
        const apidocDetail = store.state["apidoc/apidoc"].apidoc;
        const params = {
            _id: currentSelectTab.value._id,
            projectId,
            info: apidocDetail.info,
            item: apidocDetail.item,
        };
        axios.post("/api/project/fill_doc", params).then(() => {
            //改变tab请求方法
            store.commit("apidoc/tabs/changeTabInfoById", {
                id: currentSelectTab.value?._id,
                field: "head",
                value: {
                    icon: params.item.method,
                    color: "",
                },
            });
            //改变banner请求方法
            store.commit("apidoc/banner/changeBannerInfoById", {
                id: currentSelectTab.value?._id,
                field: "method",
                value: params.item.method,
            })
            //改变origindoc的值
            store.commit("apidoc/apidoc/changeOriginApidoc");
            //改变tab未保存小圆点
            store.commit("apidoc/tabs/changeTabInfoById", {
                id: currentSelectTab.value?._id,
                field: "saved",
                value: true,
            });
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            loading2.value = false;
        });
    };
    //刷新文档
    const handleFreshApidoc = () => {
        loading3.value = true;
        store.dispatch("apidoc/apidoc/getApidocDetail", {
            id: currentSelectTab.value?._id,
            projectId,
        }).then(() => {
            loading3.value = false;
        })
    };
    //预览文档
    const handleOpenViewDoc = () => {
        console.log(5)
    }

    return {
        loading2,
        loading3,
        handleSendRequest,
        handleStopRequest,
        handleSaveApidoc,
        handleFreshApidoc,
        handleOpenViewDoc,
    }
}