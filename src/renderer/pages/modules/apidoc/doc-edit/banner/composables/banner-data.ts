import { useApidocBanner } from '@/store/apidoc/banner';
import { useRoute } from 'vue-router'

type ReturnData = {
  getBannerData: () => Promise<void>,
};

export function useBannerData(): ReturnData {
  const apidocBannerStore = useApidocBanner()
  const route = useRoute()
  const getBannerData = async () => {
    const projectId = route.query.id as string;
    if (apidocBannerStore.loading) {
      return
    }
    apidocBannerStore.changeBannerLoading(true)
    await apidocBannerStore.getDocBanner({ projectId });
    apidocBannerStore.changeBannerLoading(false)
  }
  return {
    getBannerData,
  };
}
