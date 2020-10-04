/*
    创建者：shuxiaokai
    创建时间：2020-06-23 16:43
    模块名称：远程搜索组件
    备注：xxxx
*/
<template>
    <div class="remote-select">
        <input v-model="query" class="remote-select-inner" type="text" :placeholder="placeholder" @input="handleInput">
        <div v-if="query" class="select-panel">
            <div v-if="realLoading" class="loading">加载中...</div>
            <div v-if="!realLoading && !$slots.default" class="empty">暂无数据</div>
            <slot v-if="!realLoading && $slots.default"/>
        </div>
    </div>
</template>

<script>
import { debounce } from "@/lib"
export default {
    props: {
        placeholder: { //placeholder
            type: String,
            default: "请输入..."
        },
        remoteMethods: { //远程搜索方法
            type: Function,
            default: null
        },
        loading: { //数据加载状态
            type: Boolean,
            default: false
        },
        value: { //用于处理v-model
            type: String,
            default: ""
        },
    },
    data() {
        return {
            query: "", //----------输入值
            selectData: [], //-----搜索项目
            debounceFn: null, //---节流函数
            realLoading: false, //-加载效果
        };
    },
    watch: {
        query(val) {
            if (val != null || val === "") {
                this.realLoading = true;
                if (!this.debounceFn) {
                    this.debounceFn = debounce((query) => {
                        this.getData(query);
                    });
                } 
                this.debounceFn(val);
            }
        },
        loading(val) {
            this.realLoading = val;
        },
        value(val) {
            this.query = val;
        }
    },
    created() {
        
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取远程数据
        getData(query) {
            if (this.remoteMethods) {
                this.remoteMethods(query);
            }
        },
        handleInput() {
            this.$emit("input", this.query);
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.remote-select {
    width: 100%;
    position: relative;
    .remote-select-inner {
        width: 100%;
        outline: 0;
        padding: 0 size(15);
        height: size(28);
        border: 1px solid $gray-300;
        border-radius: $border-radius-sm;
        color: $gray-700;
        font-size: fz(12);
        &::-webkit-input-placeholder {
            color: $gray-500;
        }
    }    
    .select-panel {
        position: absolute;
        left: 0;
        top: size(36);
        z-index: $zIndex-panel;
        overflow-y: scroll;
        // padding: size(10) size(20);
        width: size(300);
        max-height: size(200);
        background: $white;
        border: 1px solid $gray-300;
        border-radius: $border-radius-base;
        line-height: normal;
        box-shadow: $box-shadow-sm;
        .empty,.loading {
            font-size: fz(12);
            color: $gray-500;
            padding: size(10) size(20);
        }
    }
}

</style>
