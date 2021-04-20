/*
    创建者：shuxiaokai
    创建时间：2021-02-23 10:16
    模块名称：运维平台
    备注：
*/
<template>
    <div>
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
            </div>
        </s-fieldset>
    </div>
</template>

<script>
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
                password: "GfrrWOJTYF",
                host: "10.31.45.148",
                port: 22,
            },
            //===================================枚举参数====================================//

            //===================================业务参数====================================//
            clientInstance: null,
            //===================================其他参数====================================//
            loading: false,
        };
    },
    created() {
        console.log(shell)
        this.initSsh();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //初始化ssh
        initSsh() {
            this.clientInstance = new Ssh2();
        },
        //ssh连接
        handleConnect() {
            this.clientInstance.connect(this.formInfo);
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">

</style>
