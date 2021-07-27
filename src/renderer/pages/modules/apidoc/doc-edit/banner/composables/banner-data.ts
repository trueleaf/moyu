/**
 * 获取banner数据
 */

import { ref, Ref } from "vue"
import { useStore } from "vuex"
import { useRoute } from "vue-router"
import { ApidocBanner } from "@@/global"
import { key } from "@/store/index"
type ReturnData = {
    /**
     * banner值
     */
    banner: Ref<ApidocBanner[]>,
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
    const store = useStore(key);
    const route = useRoute()
    const projectId = route.query.id;
    const banner = ref<ApidocBanner[]>([]);
    const loading = ref(false);
    const getBannerData = async () => {
        loading.value = true;
        banner.value = await store.dispatch("apidoc/banner/getDocBanner", { projectId });
        loading.value = false;
    }
    getBannerData();
    return {
        banner,
        loading,
        getBannerData,
    };
}
