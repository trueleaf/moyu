/*
    创建者：shuxiaokai
    创建时间：2021-07-13 17:20
    模块名称：
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" title="新增项目" @close="handleClose">
        <!-- <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px">
            <el-form-item label="项目名称：" prop="projectName">
                <el-input v-model="formInfo.projectName" size="mini" placeholder="请输入项目名称"></el-input>
            </el-form-item>
            <el-form-item label="选择成员：">
                <s-remote-select v-model="remoteQueryName" :remote-methods="getRemoteUserByName" :loading="loading" placeholder="输入用户名或真实姓名查找用户">
                    <s-remote-select-item v-for="(item, index) in remoteMembers" :key="index">
                        <div class="d-flex a-center j-between w-100 h-100" @click="handleSelectUser(item)">
                            <span>{{ item.loginName }}</span>
                            <span>{{ item.realName }}</span>
                        </div>
                    </s-remote-select-item>
                </s-remote-select>
            </el-form-item>
        </el-form> -->
        <template #footer>
            <el-button :loading="loading" size="mini" type="primary" @click="handleAddProject">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue", "success"],
    data() {
        return {
            loading: false,
        };
    },
    methods: {
        //新增项目
        handleAddProject() {
            console.log(3)
        },
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
    },
})
</script>

<style lang="scss">

</style>
