/*
    创建者：shuxiaokai
    创建时间：2021-09-15 2:48
    模块名称：联想参数
    备注：
*/
<template>
    <div class="s-mind-params">
        <!-- 搜索条件 -->
        <s-fieldset title="过滤条件">
            <div class="d-flex">
                <div class="left">
                    <div class="op-item">
                        <div class="label">字段名：</div>
                        <el-input v-model="formInfo.key" size="mini" placeholder="参数字段名称" maxlength="100" class="w-65" clearable></el-input>
                    </div>
                    <div class="op-item">
                        <div class="label">类型：</div>
                        <el-checkbox-group v-model="formInfo.type">
                            <el-checkbox label="paths">Path参数</el-checkbox>
                            <el-checkbox label="queryParams">Query参数</el-checkbox>
                            <el-checkbox label="requestBody">Body参数</el-checkbox>
                            <el-checkbox label="responseParams">返回参数</el-checkbox>
                            <el-button type="text" class="ml-5" @click="handleClearType">清空</el-button>
                        </el-checkbox-group>
                    </div>                    
                </div>
                <div class="right">
                    <el-descriptions :column="2" size="mini" border>
                        <el-descriptions-item>
                            <template #label>
                                <span>Path参数个数</span>
                            </template>
                            <span>{{ tableInfo.filter(v => v.paramsPosition === 'paths').length }}</span>
                            <span>&nbsp;个</span>
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <span>Query参数个数</span>
                            </template>
                            <span>{{ tableInfo.filter(v => v.paramsPosition === 'queryParams').length }}</span>
                            <span>&nbsp;个</span>
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <span>Body参数个数</span>
                            </template>
                            <span>{{ tableInfo.filter(v => v.paramsPosition === 'requestBody').length }}</span>
                            <span>&nbsp;个</span>
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <span>Response参数个数</span>
                            </template>
                            <span>{{ tableInfo.filter(v => v.paramsPosition === 'responseParams').length }}</span>
                            <span>&nbsp;个</span>
                        </el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
        </s-fieldset>
        <s-fieldset :title="`联想参数(${tableInfo.length})`" class="mt-3">
            <el-table :data="tableInfo" stripe border size="mini" height="calc(100vh - 350px)">
                <el-table-column prop="key" label="参数名称" align="center">
                    <template #default="scope">
                        <s-emphasize :value="scope.row.key" :keyword="formInfo.key"></s-emphasize>
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="备注" align="center"></el-table-column>
                <el-table-column prop="value" label="参数值" align="center"></el-table-column>
                <el-table-column prop="type" label="参数类型" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template #default="scope">
                        <el-button size="mini" type="text" @click="handleEditParams(scope.row)">修改</el-button>
                        <el-button size="mini" type="text" @click="handleDeleteParams(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </s-fieldset>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref } from "vue"
import { store } from "@/store/index"
import { router } from "@/router/index"
import type { ApidocMindParam } from "@@/global"
import { axios } from "@/api/api"


//表格参数
const tableInfo = computed(() => {
    const allParams: ApidocMindParam[] = [];
    store.state["apidoc/baseInfo"].mindParams.forEach(v => {
        allParams.push(v);
    })
    allParams.sort((a, b) => {
        if (a.key.toLowerCase() > b.key.toLowerCase()) {
            return 1;
        }
        return -1;
    });
    return allParams.filter(v => {
        const matchedKey = !formInfo.value.key || v.key.includes(formInfo.value.key);
        return matchedKey;
    }).filter(v => {
        if (formInfo.value.type.length === 0) {
            return true;
        }
        return formInfo.value.type.includes(v.paramsPosition)
    })
});
//搜索条件
const formInfo: Ref<{ key: string, type: ApidocMindParam["paramsPosition"][] }> = ref({
    key: "",
    type: [],
})
//清空checkbox
const handleClearType = () => {
    formInfo.value.type = [];
}
//=====================================操作====================================//
//修改参数
const handleEditParams = (row: ApidocMindParam) => {
    console.log(row)
}
//删除某个参数
const handleDeleteParams = (row: ApidocMindParam) => {
    const projectId = router.currentRoute.value.query.id as string;
    const params = {
        projectId,
        ids: [row._id],
    };
    axios.delete("/api/project/doc_params_mind", { data: params }).then((res) => {
        console.log(222, res)
    }).catch((err) => {
        console.error(err);
    });
}
</script>

<style lang="scss">
.s-mind-params {
    padding: size(20);
    .left {
        padding-left: size(20);
        flex: 0 0 40%;
        border-right: 1px solid $gray-600;
    }
    .right {
        flex: 0 0 50%;
        padding-left: size(30);
    }
    .op-item {
        display: flex;
        align-items: center;
        .label {
            flex: 0 0 size(80);
        }
    }
}
</style>
