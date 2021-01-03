

class SuccessTip {
    constructor() {
        this.clientX = 0; //成功提示初始位置
        this.clientY = 0; //成功提示初始位置
        this.domList = []; 
        this.init = this.init.bind(this);
        this.update = this.update.bind(this);
    }


    init(el) {
        setTimeout(() => {
            this.clientX = el.getBoundingClientRect()["left"];
            this.clientY = el.getBoundingClientRect()["top"];
        })
    }
    update(el, binding) {
        const createDom = () => {
            this.clientX = el.getBoundingClientRect()["left"];
            this.clientY = el.getBoundingClientRect()["top"];
            const dom = document.createElement("div");
            dom.style.position = "fixed";
            dom.style.left = this.clientX + "px";
            dom.style.top = this.clientY + "px";
            dom.style.color = "#4c4";
            dom.style.zIndex = "99999";
            document.body.appendChild(dom);
            setTimeout(() => {
                dom.style.transition = "transform .5s";
                dom.style.transform = "translate3D(0, -30px, 0)";                
            })
            dom.innerText = "操作成功"
            this.domList.push(dom);
        }
        if (binding.value === true) {
            createDom();
            setTimeout(() => {
                document.body.removeChild(this.domList.shift());
            }, 500);            
        }
    }
}


function initBind(el) {
    el.__success = new SuccessTip();
    el.__success.init.apply(null, arguments); //null不会改变bind绑定的this值
}


export default {
    bind: initBind,
    update: function(el, binding) {
        if (binding.value !== binding.oldValue) {
            el.__success.update.apply(null, arguments);
        }
    }

};


