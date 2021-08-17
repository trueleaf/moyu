/*
    创建者：shuxiaokai
    创建时间：2021-08-15 22:10
    模块名称：操作区域
    备注：
*/
<template>
    <div class="api-operation">
        <!-- 环境、host、服务器地址 -->
        <el-radio-group v-model="host" size="mini" @change="handleChangeHost">
            <el-popover placement="top-start" trigger="hover" width="250px" :content="mockServer" class="mr-2">
                <template #reference>
                    <el-radio :label="mockServer" border>Mock服务器</el-radio>
                </template>
            </el-popover>
            <el-popover v-for="(item, index) in hostEnum" :key="index" placement="top-start" trigger="hover" :content="item.url" class="mr-2">
                <template #reference>
                    <el-radio :label="item.url" border>{{ item.name }}</el-radio>
                </template>
            </el-popover>
        </el-radio-group>
        <el-button type="text" size="small" class="ml-3" @click="hostDialogVisible = true;">环境维护</el-button>
    </div>
    <s-curd-host-dialog v-if="hostDialogVisible" v-model="hostDialogVisible"></s-curd-host-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import config from "@/../config/config"
import curdHost from "../dialog/curd-host/curd-host.vue"

export default defineComponent({
    components: {
        "s-curd-host-dialog": curdHost,
    },
    data() {
        return {
            mockServer: `http://${config.renderConfig.mock.ip}:${config.renderConfig.mock.port}`, //-------------------mock服务器
            hostDialogVisible: false, //环境维护弹窗
        };
    },
    computed: {
        /**
         * host数据
         */
        host: {
            get() {
                return this.$store.state["apidoc/apidoc"].apidoc.item.url.host;
            },
            set(val) {
                this.$store.commit("apidoc/apidoc/changeApidocHost", val);
            },
        },
        /**
         * host枚举
         */
        hostEnum() {
            return this.$store.state["apidoc/baseInfo"].hosts
        },
    },
    methods: {
        handleChangeHost() {
            console.log(2)
        },
    },
})
</script>

<style lang="scss">
.api-operation {
    position: sticky;
    top: 0;
    padding: size(10) size(20);
    box-shadow: 0 3px 2px $gray-400;
    background: $white;
    z-index: $zIndex-request-info-wrap;
    height: size(150);
}
</style>
