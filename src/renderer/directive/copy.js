import scssData from "@/scss/variables/_variables.scss"

class Copy {
    constructor() {
        this.x = 0;
        this.y = 0;
    }

    runCopy(e, value) {
        this.x = e.clientX;
        this.y = e.clientY;
        const dom = document.createElement("textarea");
        dom.value = value;
        dom.style.position = "fixed";
        dom.style.top = "-9999px";
        dom.style.left = "-9999px";
        document.body.appendChild(dom);
        dom.select();
        document.execCommand("Copy", false, null);
        document.body.removeChild(dom);
    }

    showCopyTip() {
        const dom = document.createElement("span");
        dom.innerHTML = "复制成功";
        dom.style.transition = "all .6s";
        dom.style.color = "#2c2";
        dom.style.position = "fixed";
        dom.style.left = `${this.x}px`;
        dom.style.top = `${this.y}px`;
        dom.style.whiteSpace = "nowrap";
        dom.style.zIndex = scssData.zIndexCopy;
        dom.style.transform = `translate3D(0, -1em, 0)`;
        document.documentElement.appendChild(dom);
        requestAnimationFrame(() => {
            dom.style.transform = `translate3D(0, -2.5em, 0)`;
        });
        dom.addEventListener("transitionend", () => {
        });
        setTimeout(() => {
            document.documentElement.removeChild(dom);
        }, 800);
    }
}

export default {
    bind(el, binding) {
        if (binding.value != null) {
            const copy = new Copy();
            const foo = (e) => {
                copy.runCopy(e, binding.value);
                copy.showCopyTip();
            };
            el.removeEventListener("click", foo);
            el.addEventListener("click", foo);
        }
    },
    update(el, binding) {
        if (binding.value != null) {
            const copy = new Copy();
            const foo = (e) => {
                copy.runCopy(e, binding.value);
                copy.showCopyTip();
            };
            el.removeEventListener("click", foo);
            el.addEventListener("click", foo);
        }
    },
};
