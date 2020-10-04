/*
    创建者：shuxiaokai
    创建时间：2020-02-17 16:59
    模块名称：搜索组件
    备注：xxxx
*/
<template>
    <s-card class="s-search">
        <div v-if="$root.ENVIROMENT === 'development' && showTip">
            {{ formInfo }}
            {{ labelWidth }}
        </div>
        <!-- 内容区域 -->
        <el-form ref="form" :model="formInfo" :label-width="labelWidth">
            <el-row>
                <slot />
            </el-row>
        </el-form>
        <!-- 操作 -->
        <div slot="operation" class="d-flex a-center">
            <el-button :size="config.renderConfig.layout.size" type="primary" :disabled="loading" @click="handleSearch">搜索</el-button>
            <el-button :size="config.renderConfig.layout.size" type="warning" :disabled="loading" @click="handleReset">重置</el-button>
            <el-button v-show="couldExpand" :size="config.renderConfig.layout.size" type="primary" :disabled="loading" @click="handleExpand">
                <span v-if="!isExpand">更多筛选</span>
                <span v-else>折叠筛选</span>
            </el-button>
            <slot name="operation" />
        </div>
    </s-card>
</template>

<script>
import { debounce } from "@/lib"
export default {
    name: "SSearch",
    props: {
        customData: { //自定义表单元素数据，自动合并到formInfo，会覆盖formInfo切记参数不要重名
            type: Object,
            default() {
                return {};
            }
        },
        showTip: { //是否formInfo打印,生产环境自动忽略当前值
            type: Boolean,
            default: false,
        },
        autoRequest: { //是否触发自动请求
            type: Boolean,
            default: false
        },
        noFold: { //是否启用折叠
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            formInfo: {}, //搜索参数
            defaultFormInfo: {}, //初始formInfo值
            defaultCustomData: {}, //初始customData
            //=====================================高级筛选相关====================================//
            couldExpand: false, //是否允许高级筛选
            isExpand: true, //是否折叠
            itemDom: null, //每个搜索框高度
            formDom: null, //表单高度
            //=====================================其他参数====================================//
        };
    },
    computed: {
        labelWidth() { //搜索框文案宽度
            const widgets = this.$slots.default.map(val => {
                if (!val || !val.componentOptions || !val.componentOptions.propsData || !val.componentOptions.propsData.label) {
                    return 0;
                } else {
                    return val.componentOptions.propsData.label.length 
                }
            });
            let maxLen = Math.max.apply(Math, widgets) + 1; //加一增加了中文引号的宽度
            const fz = parseInt(window.getComputedStyle(document.documentElement)["fontSize"], 10) || 16; //根元素字体大小
            (maxLen > 10) && (maxLen = 10);
            (maxLen < 4) && (maxLen = 4);
            return maxLen * (fz + 5) + "px";
        },
        loading() {
            return this.$store.state.components.searchLoading;
        },
    },
    watch: {
        customData: {
            handler() {
                Object.assign(this.formInfo, this.customData);
            },
            deep: true,
            immediate: true
        },
    },
    provide() {
        return {
            formInfo: this.formInfo,
        }
    },
    created() {
        this.initFormInfo();
        this.$on("_change", () => { //自动触发搜索
            this.$emit("search", JSON.parse(JSON.stringify(this.formInfo)))
            this.$emit("change", this.formInfo);
        })
    },
    mounted() {
        this.calcCardHeight();
        window.addEventListener("resize", debounce(() => {
            this.calcCardHeight();
        }))
    },
    methods: {
        //=====================================初始化====================================//
        //初始化搜索参数
        initFormInfo() {
            this.$slots.default.forEach(components => {
                if (!components.componentOptions) {
                    throw new Error("请检查组件是否使用了v-if,可以尝试使用v-show解决当前问题");
                }
                const propsData = components.componentOptions.propsData;
                /*eslint-disable indent*/
                if (propsData.type === "custom") {
                    console.log("custom")
                } else if (propsData.type === "select" && propsData.multi !== undefined) { //多选框初始数据为数组
                    this.$set(this.formInfo, propsData.vModel, propsData.defaultValue || null);
                } else if (propsData.type === "daterange") {
                    this.$set(this.formInfo, propsData.vModel, propsData.defaultValue || null);
                    this.$set(this.formInfo, propsData.vModel2, propsData.defaultValue || null);
                } else if (propsData.type === "cascader") { //级联选择
                    // propsData.vModels && propsData.vModels.forEach(val => {
                    //     this.$set(this.formInfo, val, propsData.defaultValue || null);
                    // })
                    propsData.cascaderOptions.forEach(val => {
                        this.$set(this.formInfo, val.vModel, val.value || this.formInfo[val.vModel] || null);
                    })
                } else {
                    this.$set(this.formInfo, propsData.vModel, propsData.defaultValue || null);
                }
            })
            this.defaultFormInfo = JSON.parse(JSON.stringify(this.formInfo));
            this.defaultCustomData = JSON.parse(JSON.stringify(this.customData));
        },
        //计算卡片高度
        calcCardHeight() {
            if (this.noFold) {
                return
            }
            this.formDom = this.$refs["form"] || {};
            const boundClient = this.formDom.$el ? this.formDom.$el.getBoundingClientRect() : null;
            const realHeight = boundClient ? boundClient["height"] : 0;
            let itemHeight = 42;
            if (this.$slots.default && this.$slots.default[0].elm) {
                this.itemDom = this.$slots.default[0].elm
                itemHeight = this.itemDom.getBoundingClientRect()["height"];
            }
            console.log(realHeight, itemHeight, 9999)
            this.couldExpand = realHeight > 1 * itemHeight;
            if (realHeight === itemHeight) {
                this.isExpand = false;
            }
            this.handleExpand();
        },
        //=========================================================================//
        handleExpand() {
            const el = this.formDom.$el;
            if (this.isExpand) {
                el && (el.style.height = this.itemDom.getBoundingClientRect()["height"] * 1 + "px");
            } else {
                el && (el.style.height = "auto");
            }
            el && (el.style.overflow = "hidden");
            this.isExpand = !this.isExpand;
        },
        //=====================================emit====================================//
        //触发搜索事件
        handleSearch() {
            this.$emit("search", this.formInfo);
            this.$emit("change", this.formInfo); //绑定change事件可能导致内部change组件事件冒泡机制异常
        },
        //触发重置事件
        handleReset() {
            Object.assign(this.formInfo, this.defaultFormInfo);
            Object.assign(this.customData, this.defaultCustomData);
            this.$emit("reset", this.formInfo);
            this.$emit("change", this.formInfo);
        },
    }
};
</script>



<style lang="scss">
.s-search {
    .el-form-item {
        margin-bottom: 0;
    }
}
</style>
