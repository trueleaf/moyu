/**
 * 获取banner数据
 */

import { ref, Ref } from "vue"
import { useRoute } from "vue-router"
import { useStore } from "@/pages/modules/apidoc/doc-view/store/index"

const isBuildHtml = process.env.VUE_APP_BUILD_HTML;
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
    const shareId = route.query.share_id;
    const password = localStorage.getItem("share/password") || ""
    const loading = ref(false);
    const getBannerData = async () => {
        if (loading.value) {
            return
        }
        loading.value = true;
        await store.dispatch("apidoc/banner/getSharedDocBanner", { shareId, password });
        loading.value = false;
    }
    if (!isBuildHtml) {
        getBannerData();
    }
    return {
        loading,
        getBannerData,
    };
}
