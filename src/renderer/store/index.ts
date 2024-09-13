import { InjectionKey } from 'vue'
import { createStore, Store, useStore as baseUseStore } from 'vuex'
import { State } from '@types/store'
import { permission } from './permission/permission';
import { banner } from './apidoc/banner';
import { baseInfo } from './apidoc/base-info';
import { tabs } from './apidoc/tabs';
import { apidoc } from './apidoc/apidoc';
import { response } from './apidoc/response';
import { mock } from './apidoc/mock';
import { request } from './apidoc/request';
import { workerState } from './apidoc/worker-state';
import { apiflow } from './apidoc/apiflow';

export const key: InjectionKey<Store<State>> = Symbol('')

export const store = createStore<State>({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    permission,
    'apidoc/banner': banner,
    'apidoc/baseInfo': baseInfo,
    'apidoc/tabs': tabs,
    'apidoc/apidoc': apidoc,
    'apidoc/response': response,
    'apidoc/mock': mock,
    'apidoc/request': request,
    'apidoc/workerState': workerState,
    'apidoc/apiflow': apiflow,
  }
});
export const useStore = (): Store<State> => baseUseStore(key);
