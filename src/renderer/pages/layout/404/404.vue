/*
    创建者：shuxiaokai
    创建时间：2021-06-10 21:39
    模块名称：404页面
    备注：
*/
<template>
    <div class="h-100 d-flex a-center j-center flex-column">
        <h2>404</h2>
        <img :src="require('@/assets/imgs/logo.png')" alt="logo">
        <el-button link type="primary" text @click="handleJumpToLogin">返回登录页面</el-button>
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
        //跳转到登录页面
        handleJumpToLogin() {
            this.$router.push("/login");
        },
    },
})
</script>

<style lang="scss">
</style>
