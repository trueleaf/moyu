/*
    创建者：shuxiaokai
    创建时间：2020-05-22 09:11
    模块名称：卡片列表(可搜索)
    备注：xxxx
*/
<template>
    <div padding="0" class="s-card-list">
        <div v-if="title" class="header">{{ title }}</div>
        <div slot="top" class="perm-info">
            <div>
                <span>共</span>
                <span class="orange">&nbsp;{{ $slots.default ? $slots.default.length : 0 }}&nbsp;</span>
                <span>条数据</span>                            
            </div>
            <div class="ml-auto">
                <el-input v-model="name" placeholder="输入名称或者路由" prefix-icon="el-icon-search" size="mini" clearable @input="handleFilterClientRoute"></el-input>
            </div>
        </div>
        <slot name="top" />
        <div class="content" :style="{height: height}">
            <slot />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            //标题
            type: String,
            default: ""
        },
        height: {
            type: String,
            default: "300px"
        }
    },
    data() {
        return {
            name: ""
        };
    },
    created() {},
    methods: {
        //=====================================获取远程数据==================================//
        //=====================================前后端交互====================================//
        //=====================================组件间交互====================================//
        handleFilterClientRoute() {
            this.$emit("search", this.name);
        },
        //=====================================其他操作=====================================//
    }
};
</script>



<style lang="scss">
.s-card-list {
    border: 1px solid $gray-200;
    border-radius: size(5);
    .header {
        display: flex;
        padding: 10px 0;
        padding-right: 1em;
        border-bottom: 1px solid #ecf5ff;
        justify-content: space-between;
        align-items: center;
        height: size(40);
        padding-left: 1.5em;
        color: #369;
        font-weight: bolder;
        border-left: 4px solid #409eff;
    }
    .perm-info {
        padding: 0 size(10);
        height: size(50);
        display: flex;
        align-items: center;
        border-bottom: 1px solid $gray-300;
    }
    .content {
        overflow-y: auto;
    }
}
</style>
