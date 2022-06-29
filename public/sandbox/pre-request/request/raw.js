const rawData = new Proxy({ value: "" }, {
    get(target) {
        return target.value
    },
    set(obj, prop, value) {
        obj.value = value;
        self.postMessage({
            type: "prerequest-change-raw-params",
            value,
        });
        return true;
    }
})