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
        return new Promise((resolve, reject) => {
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
                resolve(this.clientInstance);
            })
            this.clientInstance.on("error", (err) => {
                console.error(err);
                reject(err);
            })
        });
    }

    /**
     * @description        断开连接
     * @author             shuxiaokai
     * @create             2021-04-21 09:23
     * @return {String}    返回字符串
     */
    disconnect() {
        this.clientInstance.end();
    }

    /**
     * @description        执行远程命令
     * @author             shuxiaokai
     * @create             2021-04-21 09:58
     * @param {string}     command - 远程命令
     * @param {Object?}    options - 配置参数
     * @return {Promise}   返回Promise
     */
    exec(command, options = {}) {
        return new Promise((resolve, reject) => {
            this.clientInstance.exec(command, options, (err, stream) => {
                if (err) {
                    reject(err);
                }
                stream.on("data", (data) => {
                    resolve(data);
                })
                stream.on("close", () => {
                    console.log("流关闭")
                })
            });
        })
    }

    /**
     * @description        执行shell命令
     * @author             shuxiaokai
     * @create             2021-04-21 13:34
     * @return {Promise}   返回Promise
     */
    initShell() {
        return new Promise((resolve, reject) => {
            this.clientInstance.shell({}, (err, stream) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                stream.on("data", (data) => {
                    console.log("shell", data.toString("utf-8"))
                    resolve(data);
                })
                stream.on("close", () => {
                    console.log("流关闭")
                })
                stream.write("ls -l\n", "utf-8")
                stream.write("cd /var/data\n", "utf-8")
                stream.write("ls -l\n", "utf-8")
            })
        })
    }
}

export default Ssh2;
