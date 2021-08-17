import { App } from "vue"

export default (app: App): void => {
    app.directive("success", {
        mounted() {
            console.log(222)
        },
        updated(el, binding) {
            console.log(el, binding)
        },
    });
}