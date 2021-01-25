class Logs {
    constructor() {
        this.errorCatch = this.errorCatch.bind(this);
    }

    errorCatch(err, vm, info) {
        console.error(err, vm, info, this);
    }
}

export default Logs;
