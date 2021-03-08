/*
    创建者：shuxiaokai
    创建时间：2021-03-08 22:00
    模块名称：密码验证
    备注：
*/
<template>
    <div class="check-wrap">
        <div class="content">
            <div class="text-center">
                <img :src="require('@/assets/imgs/logo.png')" width="100px" height="100px" alt="logo图片" class="logo">
            </div>
            <h2 class="text-center">测试项目</h2>
            <div class="d-flex a-center mb-3">
                <el-input v-model="password" placeholder="请输入密码" size="small" class="w-200px" clearable></el-input>
                <el-button size="small" type="success" :loading="loading" @click="handleConfirmPassword">确认密码</el-button>
            </div>
            <div class="gray-600">
                <span>过期时间</span>
                <span>2020-20-22</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//

            //===================================枚举参数====================================//

            //===================================业务参数====================================//
            password: "", //密码
            //===================================其他参数====================================//
        };
    },
    created() {
        this.password = localStorage.getItem("password", this.password);
        this.checkJump();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //检查是否允许跳转
        checkJump() {
            if (window.IS_OFFLINE) { //离线文档直接跳转预览界面
                this.$router.push("/view");
            }
        },
        //=====================================前后端交互====================================//
        //确认密码
        handleConfirmPassword() {
            const { shareId = "8f8943" } = this.$route.query;
            this.loading = true;
            const params = {
                shareId,
                password: this.password,
            };
            this.axios.get("/api/project/share", { params }).then((res) => {
                window.SHARE_DATA = res.data;
                localStorage.setItem("shareData", JSON.stringify(res.data));
                localStorage.setItem("password", this.password);
                localStorage.setItem("shareId", shareId);
                this.$router.push("/view");
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
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
        top: 50%;
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
