import { createStore, Store, useStore as baseUseStore } from "vuex"
import { InjectionKey } from "vue"
import { permission } from "./permission/permission";
import { banner } from "./apidoc/banner";
import { PermissionState } from "@@/store"
type State = {
    permission: PermissionState,
}
const key: InjectionKey<Store<State>> = Symbol("权限store")

const store = createStore<State>({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        permission,
        banner,
    }
});
function useStore(): Store<State> {
    return baseUseStore(key);
}
export { store, key, useStore };
