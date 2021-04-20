/**
 * @description        ssh2封装
 * @author             shuxiaokai
 * @create             2021-04-20 22:45
 */
let Client = null;
if (window.require) {
    // eslint-disable-next-line prefer-destructuring
    Client = window.require("ssh2").Client;
}

class Ssh2 {
    constructor() {
        this.clientInstance = null;
    }

    /**
     * @description        连接远程服务器
     * @author             shuxiaokai
     * @create             2021-04-20 17:46
     * @param {any}        username - 任意类型变量
     * @param {String=}    Client - 任意类型变量
     * @param {Number}     host - 数字类型
     * @param {Number}     port - 数字类型
     * @param {Number}     timeout - 超时时间
     * @return {Ssh2}      返回实例
     */
    connect(config) {
        const { username, password, host, port, timeout = 8000 } = config;
        this.clientInstance = new Client();
        this.clientInstance.connect({
            host,
            port: parseInt(port, 10),
            username,
            password,
            readyTimeout: timeout,
        });
        this.clientInstance.on("ready", () => {
            console.log("连接成功");
        })
        this.clientInstance.on("error", (err) => {
            console.error(err);
        })
        this.clientInstance.on("end", () => {
            console.log("end");
        })
        this.clientInstance.on("close", () => {
            console.log("close");
        })
    }
}

export default Ssh2;
