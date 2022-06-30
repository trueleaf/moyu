/*
    创建者：shuxiaokai
    创建时间：2021-06-15 22:16
    模块名称：搜索组件
    备注：
*/
<template>
    <s-card class="s-search">
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
                <el-button v-show="couldShowLoadMore" :size="config.renderConfig.layout.size" type="primary" :disabled="loading" @click="toggleExpand">
                    <span v-if="isFold">更多筛选</span>
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
    provide() {
        return {
            formInfo: this.formInfo, //将formInfo注入到item中
        };
    },
    props: {
        /**
         * 传递进来得数据，会与组件内部formInfo进行合并
         */
        editData: {
            type: Object,
            default: () => ({}),
        },
        /**
         * 是否formInfo打印,生产环境自动忽略当前值
         */
        showTip: {
            type: Boolean,
            default: true,
        },
        /**
         * 是否触发自动请求
         */
        autoRequest: {
            type: Boolean,
            default: false
        },
        /**
         * 折叠后显示高度
         */
        foldedHeight: {
            type: Number,
            default: 50,
        },
    },
    emits: ["search", "reset", "change"],
    data() {
        return {
            formInfo: {} as Record<string, unknown>, //---搜索参数
            originFormInfo: {}, //------------------------原始formInfo值(reset时候会用到)
            //=====================================其他参数====================================//
            couldShowLoadMore: false, //------------------是否允许高级筛选
            labelWidth: "100px", //-----------------------表单label宽度
            config, //------------------------------------配置相关信息
            isFold: false, //-----------------------------是否折叠
            loading: false, //----------------------------是否正在加载
        };
    },
    watch: {
        editData: {
            handler(data) {
                Object.keys(data).forEach((key) => {
                    this.formInfo[key] = data[key]
                });
            },
            deep: true,
            immediate: true,
        },
    },
    mounted() {
        this.initLabelWidth(); //初始化label的宽度
        this.initFormData(); //初始化表单数据绑定
        this.checkFormHeight(); //检查是否显示折叠按钮
        this.$helper.event.on("searchItem/change", this.handleChangeEvent);
    },
    beforeUnmount() {
        this.$helper.event.off("searchItem/change", this.handleChangeEvent);
    },
    methods: {
        //处理change事件
        handleChangeEvent() {
            this.$nextTick(() => {
                this.$emit("change", this.formInfo);
            });
        },
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
            // eslint-disable-next-line prefer-spread
            const maxLabelWidth = Math.max.apply(Math, searchItems.map((val) => {
                const { props } = val;
                const label: string = props ? (props.label || "") : "";
                const labelWidth = this.$helper.getTextWidth(label, font)
                return labelWidth;
            }));
            const realWidth = maxLabelWidth < 100 ? 100 : maxLabelWidth;
            this.labelWidth = `${Math.ceil(realWidth)}px`
        },
        //初始化表单参数
        initFormData() {
            if (this.$slots.default) {
                const allSlots = this.$slots.default();
                this.$helper.forEachForest<VNode>(allSlots, (slot: VNode) => {
                    const slotType = slot.type;
                    const { props } = slot;
                    if (typeof slotType === "object" && (slotType as Record<string, unknown>).name === "SearchItem") {
                        if (props && props.prop) {
                            this.formInfo[props.prop] = null;
                        }
                    }
                })
                this.originFormInfo = JSON.parse(JSON.stringify(this.formInfo));
            }
        },
        //检查是否显示折叠按钮
        checkFormHeight() {
            const { form } = this.$refs;
            const formDom = form.$el;
            const formHeight = formDom.getBoundingClientRect().height;
            if (formHeight > this.foldedHeight * 2) {
                this.couldShowLoadMore = true;
                this.isFold = true;
                formDom.style.height = `${this.foldedHeight}px`;
                formDom.style.overflow = "hidden";
            }
        },
        //展开折叠项目
        toggleExpand() {
            const { form } = this.$refs;
            const formDom = form.$el;
            if (!this.isFold) {
                formDom.style.height = `${this.foldedHeight}px`;
                formDom.style.overflow = "hidden";
            } else {
                formDom.style.height = "auto";
                formDom.style.overflow = "visible";
            }
            this.isFold = !this.isFold;
        },
        //触发搜索事件
        handleSearch() {
            this.$emit("change", this.formInfo);
            this.$emit("search", this.formInfo);
        },
        //触发重置事件
        handleReset() {
            Object.assign(this.formInfo, this.originFormInfo);
            this.$emit("change", this.formInfo);
            this.$emit("reset");
        },
    },
})
</script>

<style lang="scss">
.s-search {
    .el-form-item {
        margin-bottom: size(10);
    }
}
</style>
