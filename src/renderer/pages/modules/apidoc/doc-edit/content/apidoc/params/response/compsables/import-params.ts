import { ref, Ref } from "vue"
import type { ApidocProperty, ApidocPropertyType } from "@@/global"
import { forEachForest } from "@/helper";
import { store } from "@/store/index"

type Response = {
    importParamsdialogVisible: Ref<boolean>;
    handleOpenImportParams: (index: number) => void;
    handleConvertSuccess: (result: ApidocProperty<ApidocPropertyType>[]) => void;
}

export default function useImportParams(): Response {
    const importParamsdialogVisible = ref(false); //导入参数弹窗
    const currentEditResponseIndex = ref(0);
    //打开导入参数弹窗
    const handleOpenImportParams = (index: number) => {
        currentEditResponseIndex.value = index;
        importParamsdialogVisible.value = true;
    }
    //处理导入成功回调
    const handleConvertSuccess = (result: ApidocProperty<ApidocPropertyType>[]) => {
        const responseMindParams = store.state["apidoc/baseInfo"].mindParams.filter(v => v.paramsPosition === "responseParams")
        forEachForest(result, (data) => {
            const matchedData = responseMindParams.find(v => v.key === data.key);
            const isSimple = data.type === "string" || data.type === "boolean" || data.type === "number"
            if (matchedData && isSimple && (data.value == null || data.value === "")) {
                data.value = matchedData.value;
            }
            if (matchedData && (data.description == null || data.description === "")) {
                data.description = matchedData.description;
            }
        })
        store.commit("apidoc/apidoc/changeResponseByIndex", {
            index: currentEditResponseIndex.value,
            value: result,
        });
    }
    return {
        importParamsdialogVisible,
        handleOpenImportParams,
        handleConvertSuccess
    }
}
