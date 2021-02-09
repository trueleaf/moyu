/**
 * @description        中心事件处理，解决跨组件通讯问题
 * @author             shuxiaokai
 * @create             2021-02-9 21:40
 */
export default class EventEmitter {
    constructor() {
        this.events = [];
    }

    on(eventName, handle) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(handle);
    }

    off(eventName) {
        delete this.events[eventName];
    }

    emit(eventName, ...args) {
        if (this.events[eventName]) {
            this.events[eventName].forEach((event) => {
                event.apply(event, args)
            });
        }
    }
}
