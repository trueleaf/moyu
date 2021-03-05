/*
    创建者：shuxiaokai
    创建时间：2021-01-31 10:51
    模块名称：
    备注：
*/
<template>
    <div class="header-view">
        <template v-if="headers.length > 0">
            <div class="table-wrap">
                <el-table :data="headers" stripe border size="mini" height="100%">
                    <el-table-column prop="name" label="名称" align="left"></el-table-column>
                    <el-table-column prop="value" label="值" align="left"></el-table-column>
                </el-table>
            </div>
        </template>
        <s-empty v-else></s-empty>
    </div>
</template>

<script>
export default {
    computed: {
        //远端headers
        headers() {
            const headers = this.$store.state.apidoc.remoteResponse.headers || [];
            const result = Object.keys(headers).map((key) => {
                const name = key;
                const value = headers[key];
                return {
                    name,
                    value,
                }
            })
            return result;
        },
    },
    data() {
        return {
            //=================================表单与表格参数================================//

            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.header-view {
    .table-wrap {
        height: calc(100vh - #{size(400)});
    }
}
</style>
