/*
    创建者：shuxiaokai
    创建时间：2020-03-30 15:19
    模块名称：日期选择二次封装
    备注：xxxx
*/
<template>
    <s-col v-bind="$attrs">
        <!-- 存在el-form-item包裹 -->
        <el-form-item v-if="!noFormItem" :label="realLabel" :prop="prop" :label-width="labelWidth">
            <el-date-picker 
                    v-model="dateValue" 
                    v-bind="$attrs"
                    value-format="yyyy-MM-dd" 
                    :picker-options="customValidate || dateOptions" 
                    type="date" 
                    :placeholder="placeholder" 
                    clearable
                    :size="config.renderConfig.layout.size" 
                    :class="className" 
                    @change="handleChange"
                    v-on="$listeners"
            >
            </el-date-picker>
        </el-form-item>   
        <!-- 不存在el-form-item包裹 -->
        <el-date-picker 
                v-else
                v-model="dateValue" 
                v-bind="$attrs"
                value-format="yyyy-MM-dd" 
                :picker-options="customValidate || dateOptions" 
                type="date" 
                :placeholder="placeholder" 
                clearable
                :size="config.renderConfig.layout.size" 
                :class="className" 
                @change="handleChange"
                v-on="$listeners"
        >
        </el-date-picker> 
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
            type: String,
            default: ""
        },
        noFormItem: { //是否存在el-form-item包裹
            type: Boolean,
            default: false
        },
        dateLimit: { //日期限制   gt(大于今天) gte(大于等于今天) lt(小于今天) lte(小于等于今天)
            type: String,
            default: ""
        },
        prop: { //表单验证prop值
            type: String,
            default: ""
        },
        className: { //自定义class值
            type: String,
            default: "w-100"
        },
        labelWidth: {
            type: String,
            default: null
        },
        customValidate: {
            type: Object,
            default() {
                return null
            }
        },
    },
    data() {
        return {
            dateValue: "", //存放date选择的值，无意义，fix: 无法clear
            //=====================================日期参数====================================//
            pickerOptions: { //从此刻起大于今天
                disabledDate: time => {
                    return Date.now() > time.getTime();
                }
            }, 
            pickerOptions2: { //从此刻起大于等于今天
                disabledDate(time) {
                    return time.getTime() < Date.now() - 1000 * 60 * 60 * 24;
                }
            },    
            pickerOptions3: { //从此刻起小于今天
                disabledDate(time) {
                    return time.getTime() > Date.now() - 1000 * 60 * 60 * 24;
                }
            },   
            pickerOptions4: { //从此刻起小于等于今天
                disabledDate(time) {
                    return time.getTime() >= Date.now();
                }
            }, 
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
            return "请输入" + this.label;
        },
        dateOptions() {
            /*eslint-disable indent*/
            switch (this.dateLimit) {
                case "gt":
                    return this.pickerOptions
                case "gte":
                    return this.pickerOptions2
                case "lt":
                    return this.pickerOptions3
                case "lte":
                    return this.pickerOptions4    
                default:
                    return {};
            } 
        },
    },
    watch: {
        value: { //回显数据
            handler(value) {
                this.dateValue = value;
            },
            deep: true,
            immediate: true
        }
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        handleChange() {
            this.$emit("input", this.value);
            this.$emit("change", this.value);
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
