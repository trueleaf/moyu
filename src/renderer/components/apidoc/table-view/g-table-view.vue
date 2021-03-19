/*
    创建者：shuxiaokai
    创建时间：2021-02-08 14:26
    模块名称：表格形式预览
    备注：
*/
<template>
    <div>
        <el-table :data="realData" row-key="_id" stripe border size="small">
            <el-table-column prop="key" label="参数名称" align="center"></el-table-column>
            <el-table-column prop="type" label="参数类型" align="center"></el-table-column>
            <el-table-column prop="value" label="参数值" align="center"></el-table-column>
            <el-table-column prop="description" label="参数备注" align="center"></el-table-column>
            <el-table-column label="是否必填" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.required" class="green">必填</span>
                    <span v-if="!scope.row.required" class="gray-500">非必填</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    props: {
        data: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    computed: {
        realData() {
            return this.data.filter((item) => {
                const itemValue = item.value;
                const itemType = item.type;
                const itemPath = item.key;
                const isSimpleType = ((itemType === "string") || (itemType === "boolean") || (itemType === "number") || (itemType === "null") || (itemType === "undefined"));
                return !isSimpleType || itemValue || itemPath
            })
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

</style>
