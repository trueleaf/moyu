/*
|--------------------------------------------------------------------------
| 请求方法相关处理
|--------------------------------------------------------------------------
|
*/
import { ComputedRef, computed, WritableComputedRef } from "vue"
import type { ApidocRequestMethodRule } from "@@/store"
import { useStore } from "@/store/index"
import { $t } from "@/i18n/i18n"

type MethodReturn = {
    /**
     * 请求地址
     */
    requestMethod: WritableComputedRef<string>,
    /**
     * 请求方法枚举
     */
    requestMethodEnum: ComputedRef<ApidocRequestMethodRule[]>,
    /**
     * 禁用请求方法后提示信息
     */
    disabledTip: (item: ApidocRequestMethodRule) => void,
}

export default (): MethodReturn => {
    const store = useStore();
    //请求方法
    const requestMethod = computed({
        get() {
            return store.state["apidoc/apidoc"].apidoc.item.method;
        },
        set(method: string) {
            store.commit("apidoc/apidoc/changeApidocMethod", method)
        },
    });
    //禁用请求方法后提示信息
    const disabledTip = (item: ApidocRequestMethodRule) => {
        if (!item.enabled) {
            return $t("当前请求方法被禁止，可以在全局配置中进行相关配置");
        }
        return "";
    }
    //请求方法枚举
    const requestMethodEnum = computed(() => store.state["apidoc/baseInfo"].rules.requestMethods);

    return {
        requestMethod,
        disabledTip,
        requestMethodEnum,
    }
}
