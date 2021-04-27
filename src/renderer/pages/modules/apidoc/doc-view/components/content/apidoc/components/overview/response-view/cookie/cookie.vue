/*
    创建者：shuxiaokai
    创建时间：2021-01-31 10:51
    模块名称：
    备注：
*/
<template>
    <div class="cookies-view">
        <template v-if="cookies.length > 0">
            <div class="table-wrap">
                <el-table :data="cookies" stripe border size="mini" height="100%">
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
    data() {
        return {
            //=================================表单与表格参数================================//

            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
        };
    },
    computed: {
        //远端cookies
        cookies() {
            const setCookie = this.$store.state.apidoc.remoteResponse?.headers["set-cookie"] || [];
            const cookies = setCookie.map((val) => {
                const name = val.match(/[^=]+/);
                const value = val.match(/(?<==).*/);
                return {
                    name: name ? name[0] : "",
                    value: value ? value[0] : "",
                }
            })
            return cookies;
        },
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
.cookies-view {
    .table-wrap {
        height: calc(100vh - #{size(400)});
    }
}
</style>
