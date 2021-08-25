/*
|--------------------------------------------------------------------------
| Host相关处理
|--------------------------------------------------------------------------
|
*/
import { ref, Ref, computed, WritableComputedRef, ComputedRef } from "vue"
import { useStore } from "@/store/index"
import globalConfig from "@/../config/config"
import type { ApidocProjectHost } from "@@/store"

type HostReturn = {
    /**
     * mock服务器地址
     */
    mockServer: Ref<string>,
    /**
     * host弹窗
     */
    hostDialogVisible: Ref<boolean>,
    /**
     * host值
     */
    host: WritableComputedRef<string>,
    /**
     * host枚举值
     */
    hostEnum: ComputedRef<ApidocProjectHost[]>,
    /**
     * 改变host值
     */
    handleChangeHost: () => void,
}

export default (): HostReturn =>  {
    const store = useStore();
    //mock服务器地址
    const mockServer = ref(`http://${globalConfig.renderConfig.mock.ip}:${globalConfig.renderConfig.mock.port}`);
    //host弹窗
    const hostDialogVisible = ref(false);
    //host值
    const host = computed<string>({
        get() {
            return store.state["apidoc/apidoc"].apidoc.item.url.host;
        },
        set(val) {
            store.commit("apidoc/apidoc/changeApidocHost", val);
        },
    });
    //改变host的值
    const handleChangeHost = () => {
        console.log("changeHost")
    }
    //host枚举值
    const hostEnum = computed<ApidocProjectHost[]>(() => {
        return store.state["apidoc/baseInfo"].hosts
    })
    return {
        mockServer,
        hostDialogVisible,
        host,
        hostEnum,
        handleChangeHost,
    }
}