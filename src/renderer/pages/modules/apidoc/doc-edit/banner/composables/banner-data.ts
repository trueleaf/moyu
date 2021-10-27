/**
 * 获取banner数据
 */

import { ref, Ref } from "vue"
import { useRoute } from "vue-router"
import { useStore } from "@/store/index"

type ReturnData = {
    /**
     * loading加载效果
     */
    loading: Ref<boolean>,
    /**
     * 获取banner数据
     */
    getBannerData: () => Promise<void>,
};

export function useBannerData(): ReturnData {
    const store = useStore();
    const route = useRoute()
    const projectId = route.query.id;
    const loading = ref(false);
    const getBannerData = async () => {
        if (loading.value) {
            return
        }
        loading.value = true;
        await store.dispatch("apidoc/banner/getDocBanner", { projectId });
        loading.value = false;
    }
    getBannerData();
    return {
        loading,
        getBannerData,
    };
}
