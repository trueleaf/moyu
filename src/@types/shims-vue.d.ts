import { Store } from "vuex"
import { AxiosInstance } from "axios"
import { State } from "@@/store"
import { Helper } from "@@/helper"
import { ElMessageBoxShortcutMethod, ElMessage } from "element-plus"

declare module "@vue/runtime-core" {
    import { ComponentCustomProperties } from "vue"
    interface ComponentCustomProperties {
        $store: Store<State>,
        $confirm: typeof ElMessageBoxShortcutMethod,
        $message: typeof ElMessage,
        $nextTick: (fn: () => void) => void,
        axios: AxiosInstance,
        $helper: Helper,
        $set(target: Record<string, unknown>, key: string, value: unknown): void,
    }
}
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
