/*
    创建者：shuxiaokai
    创建时间：2021-06-15 21:09
    模块名称：表单组件
    备注：
*/
<template>
    <el-form ref="form" v-bind="$attrs" :model="formInfo" :label-width="labelWidth" :rules="rules" @submit.prevent="handleSubmit">
        <div v-if="config.isDev && showTips">
            {{ formInfo }}
        </div>
        <div v-if="config.isDev && showRules">
            {{ rules }}
        </div>
        <el-row>
            <slot />
        </el-row>
        <div class="d-flex a-center j-center">
            <slot name="operation" />
        </div>
    </el-form>
</template>

<script lang="ts">
import { defineComponent, VNode } from "vue"
import { ElForm } from "@@/elementui"
import config from "@/../config/config"

export default defineComponent({
    provide() {
        return {
            formInfo: this.formInfo, //将formInfo注入到item中
        };
    },
    props: {
        /**
         * 表单数据
         */
        editData: {
            type: Object,
            default: () => ({})
        },
        /**
         * 是否formInfo打印,生产环境不生效
         */
        showTips: {
            type: Boolean,
            default: false,
        },
        /**
         * 展示rules,生产环境无效
         */
        showRules: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            formInfo: {} as Record<string, unknown>, //---搜索参数
            rules: {
                // loginName: [{ required: true, message: "xxx", trigger: "blur" }],
            } as Record<string, unknown[]>, //----验证规则
            config, //------------------------------------配置信息
            labelWidth: "100px", //-----------------------表单label宽度
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
        this.initRules(); //初始化规则校验
    },
    methods: {
        //初始化label的宽度
        initLabelWidth() {
            const formItems: VNode[] = [];
            if (this.$slots.default) {
                const allSlots = this.$slots.default();
                this.$helper.forEachForest<VNode>(allSlots, (slot: VNode) => {
                    const slotType = slot.type;
                    if (typeof slotType === "object" && (slotType as Record<string, unknown>).name) {
                        formItems.push(slot);
                    }
                })
            }
            const formDom: HTMLElement = this.$el;
            const labelDom = formDom.querySelector(".el-form-item__label") || document.body;
            const styleList = window.getComputedStyle(labelDom);
            const { font } = styleList;
            const maxLabelWidth = Math.max.apply(Math, formItems.map((val) => {
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
                    if (typeof slotType === "object" && (slotType as Record<string, unknown>).name) {
                        if (props && props.prop) {
                            this.formInfo[props.prop] = null;
                        }
                    }
                })
            }
        },
        //初始化规则
        initRules() {
            if (this.$slots.default) {
                const allSlots = this.$slots.default();
                let rulePath: string;
                this.$helper.forEachForest<VNode>(allSlots, (slot: VNode) => {
                    const slotType = slot.type;
                    const propsData = slot.props;
                    if (typeof slotType === "object" && (slotType as Record<string, unknown>).name === "FormItem") {
                        if (propsData && propsData.prop) {
                            this.rules[propsData.prop] = [];
                            rulePath = propsData.prop;
                        }
                        //填充必填项目rule规则
                        if (propsData && (propsData.required === "" || propsData.required)) {
                            const inputType = propsData.type;
                            if (inputType == null || inputType === "input" || inputType === "textarea" || inputType === "remarks" || inputType === "password" || inputType === "number") { //普通输入框blur触发验证
                                this.rules[rulePath].push({ required: true, message: `请输入${propsData.label}`, trigger: "blur" });
                            } else if (inputType === "select" || inputType === "date" || inputType === "daterange") { //日期，单选，多选触发 blur
                                this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: "change" });
                                this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: "blur" });
                            } else if (inputType === "upload") {
                                this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: "change" });
                            } else if (inputType === "boolean") {
                                this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: ["blur", "change"] });
                            } else if (inputType === "radio") {
                                this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: ["blur", "change"] });
                            }
                        }
                        //填充字符最小长度规则
                        if (propsData && propsData.minLen) {
                            const inputType = propsData.type;
                            if (inputType == null || inputType === "input" || inputType === "password") { //普通输入框blur触发验证
                                this.rules[rulePath].push({ min: propsData.minLen, message: `${propsData.label}至少${propsData.minLen}位`, trigger: "blur" });
                            }
                        }
                        //填充字符最大度规则
                        if (propsData && propsData.maxLen) {
                            const inputType = propsData.type;
                            if (inputType == null || inputType === "input" || inputType === "password") { //普通输入框blur触发验证
                                this.rules[rulePath].push({ max: propsData.maxLen, message: `${propsData.label}最多${propsData.maxLen}位`, trigger: "blur" });
                            }
                        }
                        //填充字符长度规则
                        if (propsData && propsData.len) {
                            const inputType = propsData.type;
                            if (inputType == null || inputType === "input" || inputType === "password") { //普通输入框blur触发验证
                                this.rules[rulePath].push({ len: propsData.len, message: `${propsData.label}应该为${propsData.len}位`, trigger: "blur" });
                            }
                        }
                        //填充email规则
                        const validateEmail = (rule: unknown, value: string, callback: (err?: Error) => void) => {
                            if (value === null || value.match(/\w+@.*\.\w+/)) {
                                callback();
                            } else {
                                callback(new Error("请填写正确邮箱"));
                            }
                        };
                        if (propsData && (propsData.email || propsData.email === "")) {
                            const inputType = propsData.type;
                            if (inputType == null || inputType === "input") { //普通输入框才能填充email规则
                                this.rules[rulePath].push({ validator: validateEmail, trigger: "blur" });
                            }
                        }
                        //填充手机号规则
                        const validatePhone = (rule: unknown, value: string, callback: (err?: Error) => void) => {
                            if (value === null || value.match(/^\d{11}$/)) {
                                callback();
                            } else {
                                callback(new Error("请填写正确手机号"));
                            }
                        };
                        if (propsData && (propsData.phone || propsData.phone === "")) {
                            const inputType = propsData.type;
                            if (inputType == null || inputType === "input") { //普通输入框才能填充手机号规则
                                this.rules[rulePath].push({ validator: validatePhone, trigger: "blur" });
                            }
                        }
                    }
                })
            }
        },
        //手动校验
        validate(fn: () => void) {
            (this.$refs.form as ElForm).validate(fn);
        },
        //重置表单
        reset() {
            (this.$refs.form as ElForm).resetFields();
        },
        handleSubmit() {
            console.log(22)
        },
    },
})
</script>

<style lang="scss">

</style>
