/*
    创建者：shuxiaokai
    创建时间：2021-02-23 10:16
    模块名称：运维平台
    备注：
*/
<template>
    <div class="w-100 h-100">
        <s-fieldset title="认证相关" class="w-50">
            <el-form ref="form" :model="formInfo" label-width="120px">
                <el-form-item label="项目名称">
                    <el-input v-model="formInfo.projectName" :size="config.renderConfig.layout.size" placeholder="请输入服务器名称" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
                <el-form-item label="用户名称">
                    <el-input v-model="formInfo.username" :size="config.renderConfig.layout.size" placeholder="请输入用户名称" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="formInfo.password" :size="config.renderConfig.layout.size" placeholder="请输入密码" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
                <el-form-item label="host">
                    <el-input v-model="formInfo.host" :size="config.renderConfig.layout.size" placeholder="请输入host" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
                <el-form-item label="端口">
                    <el-input v-model="formInfo.port" :size="config.renderConfig.layout.size" placeholder="请输入端口" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
            </el-form>
            <div class="d-flex j-center">
                <el-button :loading="loading" :size="config.renderConfig.layout.size" type="success" @click="handleConnect">连接</el-button>
                <el-button :loading="loading" :size="config.renderConfig.layout.size" type="success" @click="handleDisconnect">断开连接</el-button>
            </div>
            <div class="d-flex">
                <el-input v-model="command"></el-input>
                <el-button :size="config.renderConfig.layout.size" @click="handleExec">执行命令</el-button>
            </div>
            <pre>{{ commandResult }}</pre>
        </s-fieldset>
        <div ref="terminal"></div>
    </div>
</template>

<script>
import { Terminal } from "xterm";
import "xterm/css/xterm.css"
import Ssh2 from "./ssh2"

let shell = null;
if (window.require) {
    shell = window.require("shelljs");
}
export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            formInfo: {
                projectName: "",
                username: "dev",
                password: "",
                host: "10.31.45.148",
                port: 22,
            },
            //===================================枚举参数====================================//

            //===================================业务参数====================================//
            ssh2Instance: null,
            clientInstance: null,
            shellStream: null,
            command: "",
            commandResult: "",
            terminal: null,
            //===================================其他参数====================================//
            loading: false,
        };
    },
    mounted() {
        console.log(shell)
        this.initSsh();
        this.initTerminal();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        initTerminal() {
            this.terminal = new Terminal();
            this.terminal.open(this.$refs.terminal);
            this.terminal.onData((val) => {
                this.shellStream.write(val);
            });
            // terminal.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ")
        },
        //初始化ssh
        initSsh() {
            this.ssh2Instance = new Ssh2();
        },
        //ssh连接
        handleConnect() {
            this.loading = true;
            this.ssh2Instance.connect(this.formInfo).then((sshInstance) => {
                this.clientInstance = sshInstance;
                sshInstance.on("end", () => {
                    this.handleEndSocket();
                });
                sshInstance.on("close", () => {
                    this.handleCloseSocket();
                });
                this.initShell();
            }).catch((err) => {
                this.$message.error(err.message);
            }).finally(() => {
                this.loading = false;
            });
        },
        //主动断开ssh连接
        handleDisconnect() {
            this.ssh2Instance.disconnect();
        },
        initShell() {
            this.clientInstance.shell({}, (err, stream) => {
                if (err) {
                    console.error(err);
                }
                this.shellStream = stream;
                stream.on("data", (data) => {
                    console.log("shell", data.toString("utf-8"))
                    this.terminal.write(data);
                })
                stream.on("close", () => {
                    console.log("流关闭")
                })
            })
        },
        //=====================================执行命令====================================//
        async handleExec() {
            try {
                this.commandResult = await this.ssh2Instance.exec(this.command);
            } catch (error) {
                console.error(error);
            }
        },
        //=====================================socket事件====================================//
        //断开socket连接
        handleEndSocket() {
            this.$message.error("断开socket连接");
        },
        //关闭socket连接
        handleCloseSocket() {},
        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">

</style>
