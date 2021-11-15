/*
    创建者：shuxiaokai
    创建时间：2021-06-29 22:27
    模块名称：服务端路由
    备注：
*/
<template>
    <s-loading :loading="loading" class="server-routes">
        <div v-for="(item, title) in serverRoutes" :key="title">
            <el-divider content-position="left">{{ title }}</el-divider>
            <div class="pl-5">
                <el-checkbox
                    v-model="item.selected"
                    :indeterminate="checkServerRoutesIsIndeterminate(item)"
                    :label="$t('全选')"
                    @change="handleSelectAllServerRoutes(item)"
                >
                </el-checkbox>
                <el-checkbox-group v-model="selectedData" @change="handleSelectServerRoutes(item)">
                    <el-checkbox v-for="(item2, index) in item.values" :key="index" :label="item2._id">{{ item2.name }}</el-checkbox>
                </el-checkbox-group>
            </div>
        </div>
    </s-loading>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import type { PermissionServerRoute, Response } from "@@/global"

type RouteInfo = {
    selected: boolean,
    values: PermissionServerRoute[]
}
type ServerGroupRoutes = {
    [propName: string]: RouteInfo
}

export default defineComponent({
    emits: ["change"],
    data() {
        return {
            selectedData: [] as string[], //------------当前选中的后端路由
            serverRoutes: {} as ServerGroupRoutes, //---后端路由列表
            loading: false,
        };
    },
    watch: {
        selectedData: {
            handler(val) {
                this.$emit("change", val);
            },
            deep: true,
        },
    },
    created() {
        this.getServerRoutes(); //获取后端路由
    },
    methods: {
        //获取后端路由信息
        getServerRoutes() {
            this.loading = true;
            this.axios.get<Response<PermissionServerRoute[]>, Response<PermissionServerRoute[]>>("/api/security/server_routes").then((res) => {
                res.data.forEach((val) => {
                    if (!this.serverRoutes[val.groupName || "__default"]) {
                        this.serverRoutes[val.groupName || "__default"] = {
                            selected: false,
                            values: [],
                        };
                    }
                    this.serverRoutes[val.groupName || "__default"].values.push({
                        ...val,
                    });
                });
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //选择全部后端路由
        handleSelectAllServerRoutes(item: RouteInfo) {
            if (item.selected === true) {
                item.values.forEach((route) => {
                    if (!this.selectedData.find((val) => val === route._id)) {
                        this.selectedData.push(route._id);
                    }
                });
            } else {
                item.values.forEach((route) => {
                    const index = this.selectedData.findIndex((val) => val === route._id);
                    this.selectedData.splice(index, 1);
                });
            }
        },
        //选择某个后端路由
        handleSelectServerRoutes(item: RouteInfo) {
            const isSelectAll = item.values.every((val) => this.selectedData.find((v) => v === val._id));
            item.selected = isSelectAll
        },
        //检查后端路由是否全选
        checkServerRoutesIsIndeterminate(item: RouteInfo) {
            const hasOne = this.selectedData.find((val) => item.values.find(i => i._id === val));
            const hasAll = item.values.every((val) => this.selectedData.find(i => i === val._id));
            return !!hasOne && !hasAll
        },
    },
})
</script>

<style lang="scss">
.server-routes {
    min-height: size(300);
    height: 40vh;
    overflow-y: auto;
}
</style>
