/*
    创建者：shuxiaokai
    创建时间：2021-06-15 22:16
    模块名称：搜索组件
    备注：
*/
<template>
    <s-card>
        <template #operation>
            <div class="d-flex a-center">
                <el-button :size="config.renderConfig.layout.size" type="primary" :disabled="loading" @click="handleSearch">搜索</el-button>
                <el-button :size="config.renderConfig.layout.size" type="warning" :disabled="loading" @click="handleReset">重置</el-button>
                <el-button v-show="couldShowLoadMore" :size="config.renderConfig.layout.size" type="primary" :disabled="loading" @click="handleExpand">
                    <span v-if="!isExpand">更多筛选</span>
                    <span v-else>折叠筛选</span>
                </el-button>
                <slot name="operation" />
            </div>
        </template>
    </s-card>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import config from "@/../config/config"

export default defineComponent({
    props: {
        showTip: { //是否formInfo打印,生产环境自动忽略当前值
            type: Boolean,
            default: false,
        },
        autoRequest: { //是否触发自动请求
            type: Boolean,
            default: false
        },
    },
    emits: ["change", "reset"],
    data() {
        return {
            formInfo: {}, //搜索参数
            defaultFormInfo: {}, //初始formInfo值
            defaultCustomData: {}, //初始customData
            //=====================================高级筛选相关====================================//
            couldShowLoadMore: false, //是否允许高级筛选
            isExpand: true, //是否折叠
            itemDom: null, //每个搜索框高度
            formDom: null, //表单高度
            //=====================================其他参数====================================//
            config, //-----------配置相关信息
            loading: false, //是否正在加载
        };
    },
    methods: {
        //展开项目
        handleExpand() {
            // console.log(this.$helper.cloneDeep())
            // const el = this.formDom.$el;
            // if (this.isExpand) {
            //     if (el) {
            //         el.style.height = `${this.itemDom.getBoundingClientRect().height * 1}px`;
            //         el.style.overflow = "hidden";
            //     }
            // } else if (el) {
            //     el.style.height = "auto";
            //     el.style.overflow = "visible";
            // }
            this.isExpand = !this.isExpand;
        },
        //触发搜索事件
        handleSearch() {
            this.$emit("change", this.formInfo);
        },
        //触发重置事件
        handleReset() {
            // Object.assign(this.formInfo, this.originFormInfo);
            // if (this.getComponenstByName("SCascader")) {
            //     this.getComponenstByName("SCascader").forEach((component) => {
            //         component.reset();
            //     });
            // }
            this.$emit("change", this.formInfo);
            this.$emit("reset");
        },
    },
})
</script>

<style lang="scss">

</style>
