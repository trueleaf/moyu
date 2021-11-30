/*
|--------------------------------------------------------------------------
| Host相关处理
|--------------------------------------------------------------------------
|
*/
import { ref, Ref, computed, WritableComputedRef, ComputedRef } from "vue"
import type { ApidocProjectHost } from "@@/store"
import { useStore } from "@/pages/modules/apidoc/doc-view/store/index"
import globalConfig from "@/../config/config"
import { apidocCache } from "@/cache/apidoc"
import router from "@/pages/modules/apidoc/doc-view/router/index"

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

export default (): HostReturn => {
    const store = useStore();
    //mock服务器地址
    const mockServer = ref(`http://${globalConfig.renderConfig.mock.ip}:${globalConfig.renderConfig.mock.port}`);
    //host弹窗
    const hostDialogVisible = ref(false);
    //host值
    const host = computed<string>({
        get() {
            return store.state["apidoc/apidoc"].apidoc.item.url.host
        },
        set(val) {
            store.commit("apidoc/apidoc/changeApidocHost", val);
        },
    });
    const requestPath = computed<string>({
        get() {
            return store.state["apidoc/apidoc"].apidoc.item.url.path;
        },
        set(path) {
            store.commit("apidoc/apidoc/changeApidocUrl", path)
        },
    });
    //改变host的值
    const handleChangeHost = () => {
        const ipReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)/;
        const ipWithPortReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(2[0-5]{2}|1\d{2}|[1-9]\d|\d)(:\d{2,5})/;
        const dominReg = /^(https?:\/\/)?([^./]{1,62}\.){1,}[^./]{1,62}/;
        requestPath.value = requestPath.value.replace(ipWithPortReg, "");
        requestPath.value = requestPath.value.replace(ipReg, "");
        requestPath.value = requestPath.value.replace(dominReg, "");
    }
    //host枚举值
    const hostEnum = computed<ApidocProjectHost[]>(() => {
        const projectId = router.currentRoute.value.query.id as string;
        const localData = apidocCache.getApidocServer(projectId)
        return store.state["apidoc/baseInfo"].hosts.concat(localData)
    })
    return {
        mockServer,
        hostDialogVisible,
        host,
        hostEnum,
        handleChangeHost,
    }
}
