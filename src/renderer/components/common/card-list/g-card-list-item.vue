/*
    创建者：shuxiaokai
    创建时间：2020-05-22 09:12
    模块名称：卡片列表item
    备注：xxxx
*/
<template>
    <div class="s-card-list-item">
        <div v-if="$slots.title" class="title text-ellipsis">
            <slot name="title" />
        </div>
        <div v-else :title="title" class="title text-ellipsis">{{ title }}</div>
        <div class="tail ml-auto">
            <slot name="tail" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: ""
        },
    },
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
.s-card-list-item {
    display: flex;
    align-items: center;
    height: size(40);
    padding: 0 size(10);
    &.active {
        background: rgba(0, 0, 0, 0.05);
    }
    &:hover {
        background: rgba(0, 0, 0, 0.05);
        // color: $white;
    }
    .title {
        max-width: 70%;
    }
}
</style>
