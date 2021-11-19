/*
    创建者：shuxiaokai
    创建时间：2021-06-29 15:05
    模块名称：
    备注：
*/
<template>
    <s-loading :loading="loading" class="client-menus">
        <el-tree
            ref="tree"
            :data="clientMenu"
            show-checkbox
            node-key="_id"
            :draggable="false"
            :empty-text="$t('暂无数据')"
            :expand-on-click-node="false"
            :highlight-current="true"
            @check-change="handleSelectClientMenu"
        >
            <template #default="{ data }">
                <div class="custom-tree-node">
                    <span>{{ data.name }}</span>
                </div>
            </template>
        </el-tree>
    </s-loading>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    emits: ["change"],
    data() {
        return {
            clientMenu: [] as string[],
            loading: false,
        };
    },
    created() {
        this.getClientMenu(); //获取前端菜单
    },
    methods: {
        //获取树形菜单结构
        getClientMenu() {
            this.loading = true;
            this.axios.get("/api/security/client_menu_tree").then((res) => {
                this.$helper.forEachForest(res.data, (val) => {
                    val.id = val._id;
                })
                this.clientMenu = res.data;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //选择前端菜单
        handleSelectClientMenu() {
            const checkKeys = this.$refs.tree.getCheckedKeys();
            const halfCheckKeys = this.$refs.tree.getHalfCheckedKeys();
            this.$emit("change", checkKeys.concat(halfCheckKeys));
        },
    },
})
</script>

<style lang="scss">
.client-menus {
    .custom-tree-node {
        @include custom-tree-node;
    }
    .tree {
        min-height: size(200);
        flex: 0 0 size(400);
        display: flex;
        flex-direction: column;
        .el-tree-node__content {
            height: 35px;
        }
        .el-checkbox {
            margin-bottom: 0;
        }
        .custom-tree-node {
            display: flex;
            align-items: center;
            height: 30px;
            width: 100%;
            .node-name {
                display: inline-block;
                max-width: 180px;
            }
            .bg-active {
                background: $theme-color;
                color: #fff;
            }
        }
    }
}
</style>
