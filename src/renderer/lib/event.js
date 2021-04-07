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

    one(eventName, handle) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName] = [handle];
    }

    once(eventName, handle) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(handle);
        const eventPrototype = Object.getPrototypeOf(this.events[eventName]);
        eventPrototype._once = true;
    }

    off(eventName) {
        delete this.events[eventName];
    }

    getAll() {
        return this.events;
    }

    emit(eventName, ...args) {
        const matchedEvents = this.events[eventName]
        if (matchedEvents) {
            matchedEvents.forEach((event) => {
                event.apply(event, args)
            });
            if (matchedEvents._once) {
                this.off(eventName);
            }
        }
    }
}
