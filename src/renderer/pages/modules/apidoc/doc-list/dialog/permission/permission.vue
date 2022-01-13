/*
    创建者：shuxiaokai
    创建时间：2021-07-20 19:21
    模块名称：成员管理
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" :title="$t('成员管理')" @close="handleClose">
        <s-user :id="projectId" @leave="handleLeave"></s-user>
        <!-- <template #footer>
            <el-button :loading="loading" type="primary" @click="handleChangePermission">确定</el-button>
            <el-button type="warning" @click="handleClose">取消</el-button>
        </template> -->
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import user from "./user/user.vue"

export default defineComponent({
    components: {
        "s-user": user,
    },
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        /**
         * 项目id
         */
        projectId: {
            type: String,
            default: "",
        },
    },
    emits: ["update:modelValue", "leave"],
    data() {
        return {
            //=====================================其他参数====================================//
            loading: false, //------------------------------成员数据加载状态
        };
    },
    methods: {
        //离开项目
        handleLeave() {
            this.$emit("leave");
            this.handleClose();
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
