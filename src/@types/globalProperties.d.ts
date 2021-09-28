
import { Store } from "vuex"
import { AxiosInstance } from "axios"
import { State } from "@@/store"
import { Helper } from "@@/helper"
import { ElMessageBoxShortcutMethod } from "element-plus"
// import { MessagePartial } from "element-plus/packages/message/src/message"
import { TreeNodeOptions } from "element-plus/packages/components/tree/src/tree.type"
import { IElDropdownInstance } from "element-plus/packages/dropdown/src/dropdown"
import { ICaceh } from "@/cache/cache"

type Data = Record<string, unknown>;
type Message = {
    closeAll(): void;
    success: (msg?: string) => void;
    warning: (msg?: string) => void;
    info: (msg?: string) => void;
    error: (msg?: string) => void;
}

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
                getData: <T = Data>(params?: T) => Promise<T>,
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
        $message: Message,
        $nextTick: (fn: () => void) => void,
        axios: AxiosInstance,
        $helper: Helper,
        $cache: ICaceh,
    }
}
