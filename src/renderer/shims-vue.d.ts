/* eslint-disable */
import { ComponentCustomProperties } from "vue"
import { Store } from "vuex"
import { AxiosInstance } from "axios"

declare module "@vue/runtime-core" {
    interface State {
        count: number
    }
    interface ComponentCustomProperties {
        $store: Store<State>,
        axios: AxiosInstance,
    }
}
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
