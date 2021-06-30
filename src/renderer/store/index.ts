import { createStore, Store } from "vuex"
import { InjectionKey } from "vue"
import { permission } from "./permission/permission";
import { PermissionState } from "@@/store"
interface State {
    permission: PermissionState,
}
export const key: InjectionKey<Store<State>> = Symbol("权限store")

const store = createStore<State>({
    strict: process.env.NODE_ENV !== "production",
    modules: {
        permission,
    }
});
export { store };
