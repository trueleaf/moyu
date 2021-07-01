import { Store } from "vuex"
import { AxiosInstance } from "axios"
import { State } from "@@/store"
import { Helper } from "@@/helper"
import { ElMessageBoxShortcutMethod, ElMessage } from "element-plus"
import { TreeNodeOptions } from "element-plus/packages/tree/src/tree.type"
import { IElDropdownInstance } from "element-plus/packages/dropdown/src/dropdown"

type Data = Record<string, unknown>;

declare module "@vue/runtime-core" {
    import { ComponentCustomProperties } from "vue"
    interface ComponentCustomProperties {
        $refs: {
            form: {
                validate: (fn: (valid: boolean) => void) => void,
                validateField: (field: string) => void,
                resetFields: () => void,
                $el: HTMLElement,
                formInfo: Data,
            }
            table: {
                getData: (params?: Data) => void,
                $el: HTMLElement,
            },
            tree: TreeNodeOptions["store"],
            dropdown: IElDropdownInstance,
        },
        $store: Store<State>,
        $confirm: typeof ElMessageBoxShortcutMethod,
        $message: typeof ElMessage,
        $nextTick: (fn: () => void) => void,
        axios: AxiosInstance,
        $helper: Helper,
        $set(target: Data, key: string, value: unknown): void,
    }
}
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
