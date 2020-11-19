/*
    创建者：xxx
    创建时间：2019-05-12 12:15
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div class="s-empty">
        <div v-if="type === '0' || type === '404'" class="no-404">
            <!-- <img src="@/assets/imgs/404.svg" alt width="100%" height="100%"> -->
            <div class="d-flex j-center">页面走丢了</div>
        </div>
        <div v-else-if="type === '1' || type === 'permission'" class="no-permission">
            <!-- <img src="@/assets/imgs/permission.svg" alt width="100%" height="100%"> -->
            <div class="d-flex j-center">您暂无查看权限</div>
        </div>
        <div v-else-if="type === '2' || type === 'data'" class="no-data">
            <div>
                <!-- <img src="@/assets/imgs/empty.svg" alt width="100%" height="100%" @mousedown.prevent=""> -->
            </div>
            <div class="d-flex j-center">暂无数据</div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        //类型  404 代表404  permission 无权限  data 无数据  0,1,2 简化值
        type: {
            type: String,
            default: "data"
        }
    },
    data() {
        return {};
    },
    created() {},
    methods: {
    }
};
</script>



<style lang="scss">
    .s-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        &>div {
            width: 50%;
            height: 50%;
        }
    }
</style>
