/*
    创建者：shuxiaokai
    创建时间：2020-06-23 19:08
    模块名称：远程搜索item
    备注：xxxx
*/
<template>
    <div class="remote-select-item">
        <slot />
    </div>
</template>

<script>
export default {
    name: "SRemoteSelectItem",
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
.remote-select-item {
    height: size(38);
    display: flex;
    align-items: center;
    padding: 0 size(20);
    cursor: pointer;
    &:hover {
        background: mix($white, $theme-color, 90%);
    }
}
</style>
