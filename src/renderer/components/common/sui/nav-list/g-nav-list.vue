/*
    创建者：shuxiaokai
    创建时间：2020-04-01 17:53
    模块名称：导航列表
    备注：用于处理长表单定位到某一固定位置
*/
<template>
    <s-card class="s-nav-list">
        <div class="left">
            <div class="nav-item active">aaa</div>
            <div class="nav-item">抽样基础信息</div>
            <div class="nav-item">抽样单位信息</div>
            <div class="nav-item">受检单位信息</div>
            <div class="nav-item">抽样信息</div>
            <div class="nav-bar"></div>
        </div>
        <div class="right">

        </div>
    </s-card>
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
.s-nav-list {
    position: relative;
    min-height: 100px;
    .left {
        position: relative;
        display: inline-block;
        min-width: size(50);
        padding-right: size(50);
        height: 100%;
        border-right: size(2) solid $gray-400;
        // 每个导航条样式
        .nav-item {
            padding: size(10) 0;
            cursor: pointer;
            &:hover {
                color: $theme-color;
            }
            &.active {
                color: $theme-color;
            }
        }
        //导航块样式
        .nav-bar {
            position: absolute;
            top: 0;
            right: size(-3);
            height: size(40);
            width: size(4);
            background: $theme-color;
        }
    }
}
</style>
