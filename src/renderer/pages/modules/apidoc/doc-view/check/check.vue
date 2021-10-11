/*
    创建者：shuxiaokai
    创建时间：2021-10-11 22:25
    模块名称：check
    备注：
*/
<template>
    <div class="check-wrap">
        <div class="content">
            <div class="text-center">
                <img :src="require('@/assets/imgs/logo.png')" width="100" height="100" alt="logo图片" class="logo">
            </div>
            <h2 class="text-center">{{ projectName }}</h2>
            <div class="d-flex a-center mb-3">
                <el-input v-model="password" type="password" placeholder="请输入密码" size="small" class="w-200px" clearable></el-input>
                <el-button size="small" type="success" :loading="loading" @click="handleConfirmPassword">确认密码</el-button>
            </div>
            <div class="gray-600">
                <span>过期时间</span>
                <!-- <span v-if="expire">{{ $helper.formatDate(new Date(Number(expire))) }}</span> -->
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
            password: "", //密码
            projectName: "", //项目名称
            //===================================其他参数====================================//
            loading: false, //是否加载中
        };
    },
    methods: {
        //=====================================前后端交互====================================//
        //确认密码
        handleConfirmPassword() {
            // const { shareId = "8f8943" } = this.$route.query;
            // this.loading = true;
            // const params = {
            //     shareId,
            //     password: this.password,
            // };
            // this.axios.get("/api/project/share", { params }).then((res) => {
            //     localStorage.setItem("shareData", JSON.stringify(res.data));
            //     localStorage.setItem("password", this.password || "");
            //     localStorage.setItem("shareId", shareId);
            //     this.$router.push("/view");
            // }).catch((err) => {
            //     console.error(err);
            // }).finally(() => {
            //     this.loading = false;
            // });
        },
    },
})
</script>

<style lang="scss">
.check-wrap {
    width: 100vw;
    height: 100vh;
    position: relative;
    background: $gray-100;
    .content {
        position: absolute;
        display: flex;
        flex-direction: column;
        left: 50%;
        top: 35%;
        transform: translate(-50%, -50%);
        background: $white;
        padding: size(50) size(100);
        box-shadow: $box-shadow-sm;
        &>h2 {
            padding: 0;
            margin-bottom: size(20);
            margin-top: size(0);
        }
    }
}
</style>
