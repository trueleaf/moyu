/*
    创建者：shuxiaokai
    创建时间：2021-06-29 22:27
    模块名称：前端路由
    备注：
*/
<template>
    <s-loading :loading="loading" class="client-routes">
        <div v-for="(item, title) in clientRoutes" :key="title">
            <el-divider content-position="left">{{ title }}</el-divider>
            <div class="pl-5">
                <el-checkbox
                    v-model="item.selected"
                    :indeterminate="checkClientRoutesIsIndeterminate(item)"
                    :label="$t('全选')"
                    @change="handleSelectAllClientRoutes(item)"
                >
                </el-checkbox>
                <el-checkbox-group v-model="selectedData" @change="handleSelectClientRoutes(item)">
                    <el-checkbox v-for="(item2, index) in item.values" :key="index" :label="item2._id">{{ item2.name }}</el-checkbox>
                </el-checkbox-group>
            </div>
        </div>
    </s-loading>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { PermissionClientRoute, Response } from "@@/global"

type RouteInfo = {
    selected: boolean,
    values: PermissionClientRoute[]
}
type ClientGroupRoutes = {
    [propName: string]: RouteInfo
}

export default defineComponent({
    emits: ["change"],
    data() {
        return {
            selectedData: [] as string[], //------------当前选中的前端路由
            clientRoutes: {} as ClientGroupRoutes, //---前端路由列表
            loading: false,
        };
    },
    watch: {
        selectedData: {
            handler(val: string[]) {
                this.$emit("change", val);
            },
            deep: true,
        },
    },
    created() {
        this.getClientRoutes(); //获取前端路由
    },
    methods: {
        //获取前端路由
        getClientRoutes() {
            this.loading = true;
            this.axios.get<Response<PermissionClientRoute[]>, Response<PermissionClientRoute[]>>("/api/security/client_routes").then((res) => {
                res.data.forEach((val) => {
                    if (!this.clientRoutes[val.groupName || "__default"]) {
                        this.clientRoutes[val.groupName || "__default"] = {
                            selected: false,
                            values: [],
                        };
                    }
                    this.clientRoutes[val.groupName || "__default"].values.push({
                        ...val,
                    });
                });
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //选择全部前端路由
        handleSelectAllClientRoutes(item: RouteInfo) {
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
        //选择某个前端路由
        handleSelectClientRoutes(item: RouteInfo) {
            const isSelectAll = item.values.every((val) => this.selectedData.find((v) => v === val._id));
            item.selected = isSelectAll
        },
        //检查前端路由是否全选
        checkClientRoutesIsIndeterminate(item: RouteInfo) {
            const hasOne = this.selectedData.find((val) => item.values.find(i => i._id === val));
            const hasAll = item.values.every((val) => this.selectedData.find(i => i === val._id));
            return !!hasOne && !hasAll
        },
    },
})
</script>

<style lang="scss">
.client-routes {
    min-height: size(300);
    height: 40vh;
    overflow-y: auto;
}
</style>
