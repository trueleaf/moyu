/* eslint-disable */
import { ComponentCustomProperties } from "vue"
import { Store } from "vuex"
import { AxiosInstance } from "axios"

declare module "@vue/runtime-core" {
    interface State {
        count: number
    }
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
    }
}
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
