/*
    创建者：shuxiaokai
    创建时间：2021-06-28 21:04
    模块名称：新增角色
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" :title="$t('新增角色')" @close="handleClose">
        <div class="g-role">
            <s-fieldset :title="$t('基本信息')">
                <s-form ref="form" :edit-data="formInfo">
                    <s-form-item :label="$t('角色名称')" prop="roleName" required one-line></s-form-item>
                    <s-form-item :label="$t('备注')" prop="remark" required one-line></s-form-item>
                </s-form>
            </s-fieldset>
            <s-fieldset title="权限选择">
                <el-tabs v-model="activeName">
                    <!-- 前端路由 -->
                    <el-tab-pane name="clientRoute" :label="$t('前端路由')">
                        <s-client-routes @change="handleChangeClientRoutes"></s-client-routes>
                    </el-tab-pane>
                    <!-- 后端路由 -->
                    <el-tab-pane name="serverRoute" :label="$t('后端路由')">
                        <s-server-routes @change="handleChangeServerRoutes"></s-server-routes>
                    </el-tab-pane>
                    <!-- 前端菜单 -->
                    <el-tab-pane name="clientMenu" :label="$t('前端菜单')">
                        <s-client-menus @change="handleChangeClientMenus"></s-client-menus>
                    </el-tab-pane>
                </el-tabs>
            </s-fieldset>
        </div>
        <template #footer>
            <el-button :loading="loading" type="primary" @click="handleSaveRole">{{ $t("确定") }}</el-button>
            <el-button type="warning" @click="handleClose">{{ $t("取消") }}</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import clientMenus from "./components/client-menus.vue"
import clientRoutes from "./components/client-routes.vue"
import serverRoutes from "./components/server-routes.vue"

export default defineComponent({
    components: {
        "s-client-routes": clientRoutes,
        "s-server-routes": serverRoutes,
        "s-client-menus": clientMenus,
    },
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue", "success"],
    data() {
        return {
            formInfo: {
                clientBanner: [] as string[], //菜单ids
                clientRoutes: [] as string[], //已选前端路由
                serverRoutes: [] as string[], //已选后端路由
            },
            //=========================================================================//
            clientMenu: [], //前端菜单
            //=========================================================================//
            activeName: "clientRoute",
            loading: false,
        };
    },
    methods: {
        //选择客户端路由
        handleChangeClientRoutes(val: string[]) {
            this.formInfo.clientRoutes = val;
        },
        //选择服务端路由
        handleChangeServerRoutes(val: string[]) {
            this.formInfo.serverRoutes = val;
        },
        //选择菜单
        handleChangeClientMenus(val: string[]) {
            this.formInfo.clientBanner = val;
        },
        //保存角色
        handleSaveRole() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const formData = this.$refs.form.formInfo;
                    const params = {
                        roleName: formData.roleName,
                        remark: formData.remark,
                        ...this.formInfo,
                    };
                    this.loading = true;
                    this.axios.post("/api/security/role", params).then(() => {
                        this.$emit("success");
                        this.handleClose();
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => {
                        const input: HTMLInputElement = document.querySelector(".el-form-item.is-error input") as HTMLInputElement;
                        if (input) {
                            input.focus();
                        }
                    });
                }
            });
        },
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
    },
})
</script>

<style lang="scss">
</style>
