import { App } from "vue"

let domList: HTMLElement[] = [];

function createTipDom(left: number, top: number): HTMLElement {
    let tipDom: HTMLElement | null = null;
    tipDom = document.createElement("div");
    tipDom.style.position = "fixed";
    tipDom.style.left = `${left}px`;
    tipDom.style.top = `${top}px`;
    tipDom.style.color = "#4c4";
    tipDom.style.zIndex = "99999";
    // tipDom.style.display = "none";
    tipDom.innerHTML = "操作成功";
    document.body.appendChild(tipDom);
    domList.push(tipDom);
    return tipDom
}

export default (app: App): void => {
    //=====================================成功提示指令====================================//
    app.directive("success", {
        unmounted() {
            domList = [];
        },
        updated(el: Element, binding) {
            if (binding.value && !binding.oldValue) {
                const { left, top } = el.getBoundingClientRect();
                const tipDom = createTipDom(left, top);
                setTimeout(() => {
                    tipDom.style.transition = "transform .5s";
                    tipDom.style.transform = "translate3D(0, -30px, 0)";
                })
                setTimeout(() => {
                    document.body.removeChild(tipDom);
                }, 500)
            }
        },
    });
    //=====================================flex指令====================================//
    app.directive("flex1", {
        updated(el: HTMLElement, binding) {
            const offsetY = el.getBoundingClientRect().y;
            const { value } = binding;
            el.style.height = `calc(100vh - ${offsetY + value}px)`;
            el.style.overflowY = `auto`;
        },
    });
    //=====================================拷贝指令====================================//
    app.directive("copy", {
        updated(el: HTMLElement, binding) {
            console.log(binding)
        },
    })
}