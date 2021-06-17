import { Store } from "vuex"
import { AxiosInstance } from "axios"
import { State } from "@@/store"
import { Helper } from "@@/helper"

declare module "@vue/runtime-core" {
    import { ComponentCustomProperties } from "vue"
    interface ElMessage {
        success<T>(msg: T) : void,
        warning<T>(msg: T) : void,
        danger<T>(msg: T) : void,
    }
    interface ComponentCustomProperties {
        $store: Store<State>,
        $message: ElMessage,
        $nextTick: (fn: () => void) => void,
        axios: AxiosInstance,
        $helper: Helper,
    }
}
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
