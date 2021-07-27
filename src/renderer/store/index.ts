import { InjectionKey } from "vue"
import { createStore, Store, useStore as baseUseStore } from "vuex"
import { permission } from "./permission/permission";
import { banner } from "./apidoc/banner";
import { baseInfo } from "./apidoc/base-info";
import { State } from "@@/store"

export const key: InjectionKey<Store<State>> = Symbol("")

export const store = createStore<State>({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        permission,
        "apidoc/banner": banner,
        "apidoc/baseInfo": baseInfo,
    }
});
export const useStore = (): Store<State> => baseUseStore(key);
