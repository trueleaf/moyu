/**
 * 获取banner数据
 */

import { useRoute } from 'vue-router'
import { useStore } from '@/store/index'

type ReturnData = {
  /**
     * 获取banner数据
     */
  getBannerData: () => Promise<void>,
};

export function useBannerData(): ReturnData {
  const store = useStore();
  const route = useRoute()
  const getBannerData = async () => {
    const projectId = route.query.id;
    if (store.state['apidoc/banner'].loading) {
      return
    }
    store.commit('apidoc/banner/changeBannerLoading', true)
    await store.dispatch('apidoc/banner/getDocBanner', { projectId });
    store.commit('apidoc/banner/changeBannerLoading', false)
  }
  // getBannerData();
  return {
    getBannerData,
  };
}
