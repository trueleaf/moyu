/*
    创建者：shuxiaokai
    创建时间：2021-06-14 12:15
    模块名称：
    备注：
*/
<template>
    <div>
        <s-search @change="handleChange">
            <s-search-item label="登录名称" prop="loginName"></s-search-item>
            <s-search-item label="真实姓名" prop="realName"></s-search-item>
            <s-search-item label="手机号" prop="phone"></s-search-item>
            <template #operation>
                <!-- <el-button size="mini" type="success" @click="isShow = true">新增用户</el-button> -->
                <!-- <s-download class="ml-2" url="/api/security/user_excel_template" @finish="loading = false">
                    <el-button :loading="loading" size="mini" type="primary" icon="el-icon-upload" @click="loading = true">下载模板</el-button>
                </s-download>
                <s-upload-plain url="/api/security/add_user_by_excel" excel @success="getData" @upload="loading2 = true" @finish="loading2 = false">
                    <el-button :loading="loading2" size="mini" type="primary" icon="el-icon-upload">导入用户</el-button>
                </s-upload-plain> -->
            </template>
        </s-search>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
            loading: false,
            loading2: false,
        };
    },
    methods: {
        getData() {
            console.log(22)
        },
        handleChange(data: unknown) {
            console.log(data)
        },
    },
})
</script>

<style lang="scss">
</style>
