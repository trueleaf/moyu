import { InjectionKey } from "vue"
import { createStore, Store, useStore as baseUseStore } from "vuex"
import { State } from "@@/store"
import { banner } from "./apidoc/banner";
import { baseInfo } from "./apidoc/base-info";
import { tabs } from "./apidoc/tabs";
import { apidoc } from "./apidoc/apidoc";
import { response } from "./apidoc/response";

export const key: InjectionKey<Store<State>> = Symbol("")

export const store = createStore<State>({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        "apidoc/banner": banner,
        "apidoc/baseInfo": baseInfo,
        "apidoc/tabs": tabs,
        "apidoc/apidoc": apidoc,
        "apidoc/response": response,
    }
});
export const useStore = (): Store<State> => baseUseStore(key);
