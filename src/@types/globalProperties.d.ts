
import { Store } from "vuex"
import { AxiosInstance } from "axios"
import { State } from "@@/store"
import { Helper } from "@@/helper"
import { ElMessageBoxShortcutMethod, ElMessage } from "element-plus"
import { TreeNodeOptions } from "element-plus/packages/tree/src/tree.type"
import { IElDropdownInstance } from "element-plus/packages/dropdown/src/dropdown"
import { ICaceh } from "@/cache/cache"

type Data = Record<string, unknown>;

declare module "@vue/runtime-core" {
    export interface ComponentCustomProperties {
        $refs: {
            form: {
                validate: (fn: (valid: boolean) => void) => void,
                validateField: (field: string) => void,
                resetFields: () => void,
                $el: HTMLElement,
                formInfo: Data,
            }
            table: {
                /**
                 * 获取表格数据
                 */
                getData: (params?: Data) => void,
                /**
                 * 表格数据
                 */
                tableData: unknown[],
                /**
                 * 表格数据总量
                 */
                total: number,
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
        $cache: ICaceh,
    }
}
