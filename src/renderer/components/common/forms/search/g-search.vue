/*
    创建者：shuxiaokai
    创建时间：2021-06-15 22:16
    模块名称：搜索组件
    备注：
*/
<template>
    <s-card>
        <div v-if="config.isDev && showTip">
            {{ formInfo }}
        </div>
        <!-- 内容区域 -->
        <el-form ref="form" :label-width="labelWidth">
            <el-row>
                <slot />
            </el-row>
        </el-form>
        <template #operation>
            <div class="d-flex a-center">
                <el-button :size="config.renderConfig.layout.size" type="primary" :disabled="loading" @click="handleSearch">搜索</el-button>
                <el-button :size="config.renderConfig.layout.size" type="warning" :disabled="loading" @click="handleReset">重置</el-button>
                <el-button v-show="couldShowLoadMore" :size="config.renderConfig.layout.size" type="primary" :disabled="loading" @click="handleExpand">
                    <span v-if="!isFold">更多筛选</span>
                    <span v-else>折叠筛选</span>
                </el-button>
                <slot name="operation" />
            </div>
        </template>
    </s-card>
</template>

<script lang="ts">
import { defineComponent, VNode } from "vue"
import config from "@/../config/config"

export default defineComponent({
    props: {
        editData: { //传递进来得数据，会与组件内部formInfo进行合并
            type: Object,
            default: () => ({}),
        },
        showTip: { //是否formInfo打印,生产环境自动忽略当前值
            type: Boolean,
            default: true,
        },
        autoRequest: { //是否触发自动请求
            type: Boolean,
            default: false
        },
    },
    emits: ["change", "reset"],
    data() {
        return {
            labelWidth: "100px", //表单label宽度
            formInfo: {}, //搜索参数
            // //=====================================高级筛选相关====================================//
            couldShowLoadMore: false, //是否允许高级筛选
            isFold: true, //是否折叠
            //=====================================其他参数====================================//
            config, //-----------配置相关信息
            loading: false, //是否正在加载
        };
    },
    mounted() {
        this.initLabelWidth(); //初始化label的宽度
    },
    methods: {
        //初始化label的宽度
        initLabelWidth() {
            const searchItems: VNode[] = [];
            if (this.$slots.default) {
                const allSlots = this.$slots.default();
                this.$helper.forEachForest<VNode>(allSlots, (slot: VNode) => {
                    const slotType = slot.type;
                    if (typeof slotType === "object" && (slotType as Record<string, unknown>).name) {
                        searchItems.push(slot);
                    }
                })
            }
            const formDom: HTMLElement = this.$el;
            const labelDom = formDom.querySelector(".el-form-item__label") || document.body;
            const styleList = window.getComputedStyle(labelDom);
            const { font } = styleList;
            const maxLabelWidth = Math.max.apply(Math, searchItems.map((val) => {
                const { props } = val;
                const label: string = props ? (props.label || "") : "";
                const labelWidth = this.$helper.getTextWidth(label, font)
                return labelWidth;
            }));
            const realWidth = maxLabelWidth < 100 ? 100 : maxLabelWidth;
            this.labelWidth = `${Math.ceil(realWidth)}px`
        },
        //展开项目
        handleExpand() {
            // console.log(this.$helper.cloneDeep())
            // const el = this.formDom.$el;
            // if (this.isFold) {
            //     if (el) {
            //         el.style.height = `${this.itemDom.getBoundingClientRect().height * 1}px`;
            //         el.style.overflow = "hidden";
            //     }
            // } else if (el) {
            //     el.style.height = "auto";
            //     el.style.overflow = "visible";
            // }
            this.isFold = !this.isFold;
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
