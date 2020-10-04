/*
    创建者：shuxiaokai
    创建时间：2020-03-30 15:19
    模块名称：下拉菜单二次封装
    备注：xxxx
*/
<template>
    <s-col v-bind="$attrs">
        <!-- 存在el-form-item包裹 -->
        <el-form-item v-if="!noFormItem" :label="realLabel" :prop="prop" :label-width="labelWidth">
            <el-select 
                    v-if="multi"
                    v-model="multiData" 
                    v-bind="$attrs" 
                    :placeholder="placeholder" 
                    :multiple="multi"
                    filterable 
                    :size="config.renderConfig.layout.size"
                    :class="className"
                    clearable
                    @change="handleChange"
                    v-on="$listeners"
            >
                <el-option v-for="(item, index) in realSelectEnum" :key="index" :label="item[selectProps.name]" :value="item[selectProps.id]"></el-option>
            </el-select>
            <el-select 
                    v-else
                    v-model="singleData" 
                    v-bind="$attrs" 
                    :placeholder="placeholder" 
                    :multiple="multi"
                    filterable 
                    :size="config.renderConfig.layout.size"
                    :class="className"
                    clearable
                    @change="handleChange"
                    v-on="$listeners"
            >
                <el-option v-for="(item, index) in realSelectEnum" :key="index" :label="item[selectProps.name]" :value="item[selectProps.id]"></el-option>
            </el-select>
        </el-form-item>   
        <!-- 不存在el-form-item包裹 -->
        <el-select v-else-if="noFormItem && multi" v-model="multiData" v-bind="$attrs" :placeholder="placeholder" :multiple="multi" filterable :size="config.renderConfig.layout.size" :class="{'w-100': !className, className}" clearable @change="handleChange" v-on="$listeners">
            <el-option v-for="(item, index) in realSelectEnum" :key="index" :label="item[selectProps.name]" :value="item[selectProps.id]"></el-option>
        </el-select>   
        <el-select v-else-if="noFormItem && !multi" v-model="singleData" v-bind="$attrs" :placeholder="placeholder" :multiple="multi" filterable :size="config.renderConfig.layout.size" :class="{'w-100': !className, className}" clearable @change="handleChange" v-on="$listeners">
            <el-option v-for="(item, index) in realSelectEnum" :key="index" :label="item[selectProps.name]" :value="item[selectProps.id]"></el-option>
        </el-select>   
    </s-col>
</template>

<script>
export default {
    props: {
        label: { //文案
            type: String,
            default: ""
        },
        value: { //v-model绑定的值
            type: [String, Number, Array],
            default: ""
        },
        noFormItem: { //是否存在el-form-item包裹
            type: Boolean,
            default: false
        },
        multi: { //是否多选
            type: Boolean,
            default: false,
        },
        selectEnum: { //下拉菜单值
            type: Array,
            default() {
                return [];
            }
        },
        selectProps: { //下拉菜单props   用于id 和 name 映射
            type: Object,
            default() {
                return {
                    id: "id",
                    name: "name"
                };
            }
        },
        selectUrl: { //用于通过url直接在组件内部获取枚举值
            type: String,
            default: null
        },
        rawResult: { //是否以数组形式返回输入框的值
            type: Boolean,
            default: false
        },
        prop: { //表单验证prop值
            type: String,
            default: ""
        },
        stringId: { //枚举值id是string还是number
            type: Boolean,
            default: false
        },
        className: { //自定义class值
            type: String,
            default: "w-100"
        },
        labelWidth: {
            type: String,
            default: null
        },
    },
    data() {
        return {
            singleData: "", //无效字段，用于单选框
            multiData: [], //多选框中间参数
            privateSelectEnum: [], //下拉枚举值
        };
    },
    computed: {
        realLabel() { //实际label值，自动拼接
            if (this.label.endsWith("：")) {
                return this.label;
            } else if (this.label.endsWith(":")) {
                return this.label.replace(":", "：")
            } else {
                return this.label + "："
            }
        },
        placeholder() {
            return "请选择" + this.label;
        },
        realSelectEnum() {
            if (Array.isArray(this.selectEnum) && this.selectEnum.length > 0) {
                return this.selectEnum
            } else if (Array.isArray(this.privateSelectEnum) && this.privateSelectEnum.length > 0) {
                return this.privateSelectEnum;
            } else {
                return []
            }
        },
    },
    watch: {
        value: { //回显数据
            handler(value) {
                if (value && this.multi && this.multiData.length === 0) {
                    this.multiData = [];
                    let data = null;
                    if (typeof value === "string") {
                        data = value.split(",");
                    } else if (Array.isArray(value)) {
                        data = value;
                    }
                    data.forEach(val => {
                        this.multiData.push(val);
                    })
                } else if (value && !this.multi) { //单选有值的情况下
                    this.singleData = value;
                } else if (!value && !this.multi) { //单选没有值得情况
                    this.singleData = "";
                }
            },
            deep: true,
            immediate: true
        }
    },
    created() {
        if (this.selectUrl) { //如果存在selectUrl则请求数据
            this.getSelectEnum();
        }
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取下拉菜单枚举值
        getSelectEnum() {
            this.axios.get(this.selectUrl).then(res => {
                this.privateSelectEnum = res.data;
            }).catch(err => {
                this.$errorThrow(err, this);
            });
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        handleChange(val) {
            if (this.rawResult && this.multi) { //多选返回原始数据
                this.$emit("input", val);
                this.$emit("change", val);
            } else if (!this.rawResult && this.multi) { //多选不返回原始数据
                this.$emit("input", val.join(","));
                this.$emit("change", val.join(","));
            } else if (!this.multi) { //单选
                //如果是空字符，则返回null
                if (val === "") {
                    val = null
                }
                this.$emit("input", val);
                this.$emit("change", val);
            }
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
