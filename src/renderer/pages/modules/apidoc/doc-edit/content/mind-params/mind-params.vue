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
                            <el-checkbox label="path">Path参数</el-checkbox>
                            <el-checkbox label="query">Query参数</el-checkbox>
                            <el-checkbox label="body">Body参数</el-checkbox>
                            <el-checkbox label="response">返回参数</el-checkbox>
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
                            <span>{{ mindParams.paths ? mindParams.paths.length : 0 }}</span>
                            <span>&nbsp;个</span>
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <span>Query参数个数</span>
                            </template>
                            <span>{{ mindParams.queryParams ? mindParams.queryParams.length : 0 }}</span>
                            <span>&nbsp;个</span>
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <span>Body参数个数</span>
                            </template>
                            <span>{{ mindParams.requestBody ? mindParams.requestBody.length : 0 }}</span>
                            <span>&nbsp;个</span>
                        </el-descriptions-item>
                        <el-descriptions-item>
                            <template #label>
                                <span>Response参数个数</span>
                            </template>
                            <span>{{ mindParams.responseParams ? mindParams.responseParams.length : 0 }}</span>
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
                <el-table-column label="操作" align="center">
                    <template #default="scope">
                        <el-button size="mini" type="text" @click="handleEditParams(scope.row)">修改</el-button>
                        <el-button size="mini" type="text" @click="handleDeleteParams(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </s-fieldset>
        <!-- <pre>{{ mindParams }}</pre> -->
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref } from "vue"
import { store } from "@/store/index"
import type { ApidocProperty } from "@@/global"
type ApidocPropertyWithType = ApidocProperty & { _type: "path" | "query" | "body" | "response" }

//联想参数
const mindParams = computed(() => {
    return store.state["apidoc/baseInfo"].mindParams;
})
//表格参数
const tableInfo = computed(() => {
    const { paths = [], queryParams = [], requestBody = [], responseParams = []} = mindParams.value;
    const allParams: ApidocPropertyWithType[] = [];
    paths.forEach(v => {
        allParams.push({
            ...v,
            _type: "path"
        })
    })
    queryParams.forEach(v => {
        allParams.push({
            ...v,
            _type: "query"
        })
    })
    requestBody.forEach(v => {
        allParams.push({
            ...v,
            _type: "body"
        })
    })
    responseParams.forEach(v => {
        allParams.push({
            ...v,
            _type: "response"
        })
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
        return formInfo.value.type.includes(v._type)
    })
});
//搜索条件
const formInfo: Ref<{ key: string, type: ApidocPropertyWithType["_type"][] }> = ref({
    key: "",
    type: [],
})
//清空checkbox
const handleClearType = () => {
    formInfo.value.type = [];
}
//=====================================操作====================================//
//修改参数
const handleEditParams = (row: ApidocPropertyWithType) => {
    console.log(row)
}
//删除某个参数
const handleDeleteParams = (row: ApidocPropertyWithType) => {
    console.log(row)
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
