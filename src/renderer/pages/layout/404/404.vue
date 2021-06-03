/*
    创建者：shuxiaokai
    创建时间：2020-06-18 10:10
    模块名称：
    备注：xxxx
*/
<template>
    <div class="h-100 d-flex a-center j-center flex-column">
        <h2>404</h2>
        <img :src="require('@/assets/imgs/logo.png')" alt="logo">
        <el-button type="text" @click="handleJumpToLogin">返回登录</el-button>
    </div>
</template>

<script>
export default {
    data() {
        return {

        };
    },
    created() {

    },
    methods: {
        handleJumpToLogin() {
            this.$router.push("/login");
        },
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">

</style>
