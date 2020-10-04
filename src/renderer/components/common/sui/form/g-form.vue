/*
    创建者：shuxiaokai
    创建时间：2020-02-20 22:32
    模块名称：表单填写
    备注：xxxx
*/
<template>
    <el-form ref="form" v-bind="$attrs" :model="formInfo" :rules="rules" :label-width="labelWidth" v-on="$listeners" @submit.native.prevent="handleSubmit">
        <div v-if="$root.ENVIROMENT === 'development' && showTip">
            {{ formInfo }}
        </div>
        <div v-if="$root.ENVIROMENT === 'development' && showRules">
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

<script>
export default {
    name: "SForm",
    props: {
        formInfo: {
            type: Object,
            default() {
                return {}
            }
        },
        editData: { //初始data，编辑时候使用
            type: Object,
            default() {
                return {};
            },
        },
        customData: { //自定义表单元素数据，自动合并到formInfo，会覆盖formInfo切记参数不要重名
            type: Object,
            default() {
                return {};
            }
        },
        showTip: { //是否formInfo打印,生产环境不生效
            type: Boolean,
            default: false,
        },
        showRules: { //展示rules,生产环境无效
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            rules: {}, //验证规则
        };
    },
    computed: {
        labelWidth() { //搜索框文案宽度
            const defaultSlots = this.$slots.default || [];
            const widgets = defaultSlots.map(val => {
                const componentOptions = val.componentOptions;
                const propsData = componentOptions ? componentOptions.propsData : null;
                // const hasOneLine = propsData && propsData.oneLine !== undefined && (propsData.oneLine === "" || propsData.oneLine);
                // const hasHalfLine = propsData && propsData.halfLine !== undefined && (propsData.halfLine === "" || propsData.halfLine);
                if (!propsData || !propsData.label) {
                    return 0;
                } else {
                    return val.componentOptions.propsData.label.length 
                }
            });
            let maxLen = Math.max.apply(Math, widgets) + 1;
            const fz = parseInt(window.getComputedStyle(document.documentElement)["fontSize"], 10) || 16; //根元素字体大小
            (maxLen > 10) && (maxLen = 10);
            (maxLen < 4) && (maxLen = 4);
            return maxLen * (fz + 5) + "px";
        },
    },
    watch: {
        editData: {
            handler(val) {
                this.$nextTick(() => { //首先处理初始化，然后再赋值formInfo
                    Object.assign(this.formInfo, val);
                })
            },
            deep: true,
            immediate: true
        },
        formInfo: {
            handler(val) {
                this.$nextTick(() => { //首先处理初始化，然后再赋值formInfo
                    Object.assign(this.editData, val);
                })
            },
            deep: true,
            immediate: true
        },
    },
    provide() {
        return {
            formInfo: this.formInfo, //表格参数
            rules: this.rules, //验证规则
        }
    },
    created() {
        this.initFormInfo(); //初始化表单参数
        this.initRules();
    },
    methods: {
        //初始化表单参数
        initFormInfo() {
            const defaultSlots = this.$slots.default || [];
            defaultSlots.forEach(components => {
                // console.log(components)
                const propsData = components.componentOptions ? components.componentOptions.propsData : null;
                if (!propsData || Object.keys(propsData).length === 0) { //跳过解析非s-form-item元素
                    console.warn("缺少s-form-item,数据无法自动绑定")
                    return;
                }
                const defaultValue = this.formInfo[propsData.vModel];
                if (propsData.type === "custom" || propsData.type === "divider" || propsData.type === "submit") { //自定义，分割线，submit按钮不处理
                    console.log("custom", propsData.type)
                } else if (propsData.type === "text") {
                    this.$set(this.formInfo, propsData.vModel, defaultValue || propsData.defaultValue || null);
                } else if (propsData.type === "radio") { //radio
                    this.$set(this.formInfo, propsData.vModel, defaultValue || propsData.defaultValue || null);
                } else if (propsData.type === "boolean") { //布尔值radio
                    this.$set(this.formInfo, propsData.vModel, propsData.trueValue || null);
                } else if (propsData.type === "select" && propsData.multi !== undefined) { //多选框初始数据为数组
                    this.$set(this.formInfo, propsData.vModel, defaultValue || propsData.defaultValue || null);
                } else if (propsData.type === "daterange") { //日期时间选择
                    this.$set(this.formInfo, propsData.vModel, defaultValue || propsData.defaultValue || null);
                    this.$set(this.formInfo, propsData.vModel2, defaultValue || propsData.defaultValue || null);
                } else if (propsData.type === "cascader") { //级联选择
                    propsData.cascaderOptions.forEach(val => {
                        this.$set(this.formInfo, val.vModel, val.value || this.formInfo[val.vModel] || null);
                    })
                } else {
                    this.$set(this.formInfo, propsData.vModel, defaultValue || propsData.defaultValue || null);
                }
            })
        },
        //初始化表单验证规则
        initRules() {
            const defaultSlots = this.$slots.default || [];
            let rulePath = null;
            // eslint-disable-next-line max-statements
            defaultSlots.forEach(components => {
                const propsData = components.componentOptions ? components.componentOptions.propsData : null;
                if (!propsData || Object.keys(propsData).length === 0) { //跳过解析非s-form-item元素
                    console.warn("缺少s-form-item,数据无法自动绑定")
                    return;
                }
                const ownRule = propsData.sRule
                //生成rule
                if (propsData.prop) {
                    this.$set(this.rules, propsData.prop, []);
                    rulePath = propsData.prop;
                } else if (propsData.vModel) {
                    this.$set(this.rules, propsData.vModel, [])
                    rulePath = propsData.vModel;
                } else if (propsData.cascaderOptions && propsData.type === "cascader") {
                    propsData.cascaderOptions.forEach(val => {
                        this.$set(this.rules, val.vModel, []);
                        if (val.required) {
                            this.rules[val.vModel].push({ required: true, message: `${val.errorMsg || ""}`, trigger: ["change"] })  
                        }
                    })
                }
                //填充必填项目rule规则
                if (propsData.required === "" || propsData.required) {
                    const inputType = propsData.type;
                    // console.log(propsData)
                    if (inputType == null || inputType === "input" || inputType === "textarea" || inputType === "remarks" || inputType === "password" || inputType === "number") { //普通输入框blur触发验证
                        this.rules[rulePath].push({ required: true, message: `请输入${propsData.label}`, trigger: "blur" })
                    } else if (inputType === "select" || inputType === "date" || inputType === "daterange") { //日期，单选，多选触发 blur
                        this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: "change" })
                        this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: "blur" })
                    } else if (inputType === "upload") {
                        this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: "change" })
                    } else if (inputType === "boolean") {
                        this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: ["blur", "change"] })
                    } else if (inputType === "radio") {
                        this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: ["blur", "change"] })
                    } else if (inputType === "cascader") {
                        // propsData.cascaderOptions.forEach(val => {
                        //     this.rules[val.vModel].push({ required: true, message: `请选择${propsData.label}`, trigger: ["blur", "change"] })
                        // })
                        // propsData.vModels.forEach(val => {
                        //     rulePath = propsData.vModel;     
                        //     this.rules[rulePath].push({ required: true, message: `请选择${propsData.label}`, trigger: ["blur", "change"] })                   
                        // })
                    }
                }    
                //填充自定义rule
                if (ownRule) { 
                    if (Array.isArray(ownRule)) {
                        ownRule.forEach(rule => {
                            this.rules[rulePath].push(rule);
                        })                            
                    } else {
                        this.rules[rulePath].push(ownRule);
                    }
                }
                //填充字符最小长度规则
                if (propsData.minLen) {
                    const inputType = propsData.type;
                    if (inputType == null || inputType === "input" || inputType === "password") { //普通输入框blur触发验证
                        this.rules[rulePath].push({ min: propsData.minLen, message: `${propsData.label}至少${propsData.minLen}位`, trigger: "blur" })
                    }
                } 
                //填充字符最大度规则
                if (propsData.maxLen) {
                    const inputType = propsData.type;
                    if (inputType == null || inputType === "input" || inputType === "password") { //普通输入框blur触发验证
                        this.rules[rulePath].push({ max: propsData.maxLen, message: `${propsData.label}最多${propsData.maxLen}位`, trigger: "blur" })
                    }
                } 
                //填充字符长度规则
                if (propsData.len) {
                    const inputType = propsData.type;
                    if (inputType == null || inputType === "input" || inputType === "password") { //普通输入框blur触发验证
                        this.rules[rulePath].push({ len: propsData.len, message: `${propsData.label}应该为${propsData.len}位`, trigger: "blur" })
                    }
                } 
                //填充email规则
                const validateEmail = (rule, value, callback) => {
                    if (value === null || value.match(/\w+@.*\.\w+/)) {
                        callback();
                    } else {
                        callback(new Error("请填写正确邮箱"));
                    }
                }
                if (propsData.email || propsData.email === "") {
                    const inputType = propsData.type;
                    if (inputType == null || inputType === "input") { //普通输入框才能填充email规则
                        this.rules[rulePath].push({ validator: validateEmail, trigger: "blur" })
                    }
                } 
                //填充手机号规则
                const validatePhone = (rule, value, callback) => {
                    if (value === null || value.match(/^\d{11}$/)) {
                        callback();
                    } else {
                        callback(new Error("请填写正确手机号"));
                    }
                }
                if (propsData.phone || propsData.phone === "") {
                    const inputType = propsData.type;
                    if (inputType == null || inputType === "input") { //普通输入框才能填充手机号规则
                        this.rules[rulePath].push({ validator: validatePhone, trigger: "blur" })
                    }
                } 
                //校验不能包含中文
                var validateNoZh = (rule, value, callback) => {
                    const pattern = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
                    if (value && pattern.exec(value)) {
                        callback(new Error("不能包含中文"));
                    } else {
                        callback();
                    }
                };
                if (propsData.nozh || propsData.nozh === "") {
                    const inputType = propsData.type;
                    if (inputType == null || inputType === "input") { //普通输入框才能填充校验中文规则
                        this.rules[rulePath].push({ validator: validateNoZh, trigger: "blur" })
                    }
                } 
            })
        },
        validate(fn) {
            this.$refs["form"].validate(fn);
        },
        //重置表单
        reset() { 
            this.$refs["form"].resetFields();
        },
        handleSubmit() {
            console.log(222)
        }
    }
};
</script>



<style lang="scss">

</style>
