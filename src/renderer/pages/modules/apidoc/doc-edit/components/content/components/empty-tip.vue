/*
    创建者：shuxiaokai
    创建时间：2020-10-23 10:57
    模块名称：未选中接口文档时候的提示
    备注：xxxx
*/
<template>
    <div class="empty-tip">
        <img :src="require('@/assets/imgs/logo.png')" width="150px" height="150px" alt="logo图片" class="logo">
        <div class="f-base">
            <div>
                <span>接口数量：</span>
                <span>22</span>
            </div>
        </div>
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
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.empty-tip {
    height: calc(100% - #{size(40)});
    display: flex;
    flex-direction: column;
    align-items: center;
    .logo {
        margin-top: 5vh;
    }
}
</style>
