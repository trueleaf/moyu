/*
    创建者：shuxiaokai
    创建时间：2020-03-30 15:19
    模块名称：日期范围选择二次封装
    备注：xxxx
*/
<template>
    <s-col v-bind="$attrs">
        <!-- 存在el-form-item包裹 -->
        <el-form-item v-if="!noFormItem" :label="realLabel" :prop="prop" :label-width="labelWidth">
            <el-date-picker 
                    v-model="time" 
                    v-bind="$attrs"
                    value-format="yyyy-MM-dd" 
                    range-separator="-" 
                    type="daterange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期" 
                    :picker-options="dateOptions"
                    clearable
                    :size="config.renderConfig.layout.size"
                    :class="className"
                    @change="handleChange"
            >
            </el-date-picker>
            <slot name="tail" />
        </el-form-item>   
        <!-- 不存在el-form-item包裹 -->
        <el-date-picker 
                v-else
                v-model="time" 
                v-bind="$attrs"
                value-format="yyyy-MM-dd" 
                range-separator="-" 
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期" 
                :picker-options="dateOptions"
                clearable
                :size="config.renderConfig.layout.size"
                :class="className"
                @change="handleChange"
        >
        </el-date-picker>
        <slot name="tail" />
    </s-col>
</template>

<script>
export default {
    props: {
        label: { //文案
            type: String,
            default: ""
        },
        vModel: { //v-model绑定值
            type: String,
            default: ""
        },
        vModel2: { //第二个v-model值，用于日期范围选择
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
        // rawResult: { //是否返回原始数据
        //     type: Boolean,
        //     default: false
        // },
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
    },
    data() {
        return {
            time: [], //存放date选择的值
            //=====================================日期参数====================================//
            pickerOptions: { //从此刻起大于今天
                disabledDate(time) {
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
        time: { //日期处理
            handler(val) {
                if (val && val[0] && val[1]) {
                    this.$emit("update:vModel", val[0])
                    this.$emit("update:vModel2", val[1])
                } else {
                    this.$emit("update:vModel", null)
                    this.$emit("update:vModel2", null)
                }
            },
            deep: true
        },
        vModel: { //回显数据
            handler(value) {
                if (!value) {
                    this.time = []
                } else {
                    this.time = [value, this.vModel2]
                }
            },
            deep: true,
        },
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
