/*
    创建者：shuxiaokai
    创建时间：2021-09-17 22:39
    模块名称：
    备注：
*/
<template>
    <div class="params-template">
        <s-resize-x :min="500" :max="900" :width="500" name="paramsTemplate" class="left">
            aaa
        </s-resize-x>
        <s-table
            ref="table"
            url="/api/project/doc_preset_params_list"
            :params="{projectId: $route.query.id}"
            delete-many
            delete-url="/api/project/doc_preset_params"
            delete-key="ids"
        >
            <el-table-column label="模板名称" align="center">
                <template #default="scope">
                    <el-input v-if="scope.row.__active" v-model="scope.row.name" size="mini" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                    <span v-else>{{ scope.row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="创建者名称" prop="creatorName" align="center"></el-table-column>
            <!-- <el-table-column label="模板类型" prop="presetParamsType" align="center">
                <template #default="scope">
                    <el-tag v-if="scope.row.presetParamsType === 'queryParams'" size="mini" type="success">请求参数(Params)</el-tag>
                    <el-tag v-if="scope.row.presetParamsType === 'requestBody'" size="mini" type="primary">请求参数(Body)</el-tag>
                    <el-tag v-if="scope.row.presetParamsType === 'responseParams'" size="mini" type="warning">返回参数</el-tag>
                </template>
            </el-table-column> -->
            <el-table-column label="操作" align="center">
                <!-- <template #default="scope">
                    <el-button type="text" size="mini" @click="handleChangeOpToEdit(scope.row)">编辑</el-button>
                    <el-button type="text" size="mini" @click="handleDelete(scope.row._id)">删除</el-button>
                </template> -->
            </el-table-column>
        </s-table>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
        };
    },
    methods: {
    },
})
</script>

<style lang="scss">
.params-template {
    overflow: hidden;
    display: flex;
    &>.left {
        flex: 0 0 auto;
        border-right: 4px solid $gray-400;
    }
}
</style>
