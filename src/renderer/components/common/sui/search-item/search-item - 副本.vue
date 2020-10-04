/*
    创建者：shuxiaokai
    创建时间：2020-02-17 16:59
    模块名称：搜索项目
    备注：xxxx
*/
<template>

    <el-col v-if="type !== 'custom'" :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
        <!-- 普通输入框 -->
        <!-- <el-form-item v-if="type === 'input'" :label="realLabel">
            <el-input 
                    v-model="formInfo[vModel]" 
                    :placeholder="placeholder" 
                    :maxlength="100" 
                    :size="config.renderConfig.layout.size" 
                    class="w-100" 
                    clearable
                    @input="handleChange"
            >
            </el-input>
        </el-form-item> -->
        <s-input v-if="type === 'input'" v-model="formInfo[vModel]" :label="label" noCol @input="handleChange"></s-input>
        <!-- 单选框 -->
        <el-form-item v-else-if="type === 'select' && !multi" :label="realLabel">
            <el-select v-model="formInfo[vModel]" :placeholder="placeholder" filterable :size="config.renderConfig.layout.size" class="w-100" clearable @change="handleChange">
                <el-option v-for="(item, index) in realSelectEnum" :key="index" :label="item[selectProps.name]" :value="item[selectProps.id]"></el-option>
            </el-select>
        </el-form-item>
        <!-- 多选框 -->
        <el-form-item v-else-if="type === 'select' && multi" :label="realLabel">
            <el-select v-model="multiData" :placeholder="placeholder" filterable :size="config.renderConfig.layout.size" class="w-100" clearable multiple @change="handleChange">
                <el-option v-for="(item, index) in realSelectEnum" :key="index" :label="item[selectProps.name]" :value="item[selectProps.id]"></el-option>
            </el-select>
        </el-form-item>
        <!-- 单日期 -->
        <el-form-item v-else-if="type === 'date'" :label="realLabel">
            <el-date-picker 
                    v-model="formInfo[vModel]" 
                    value-format="yyyy-MM-dd" 
                    :picker-options="dateOptions" 
                    type="date" 
                    :placeholder="placeholder" 
                    clearable :size="config.renderConfig.layout.size" 
                    class="w-100" 
                    @change="handleChange"
            >
            </el-date-picker>
        </el-form-item>
        <!-- 多日期 -->
        <el-form-item v-else-if="type === 'daterange'" :label="realLabel">
            <el-date-picker 
                    v-model="time" 
                    value-format="yyyy-MM-dd" 
                    range-separator="-" 
                    type="daterange"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期" 
                    :picker-options="dateOptions"
                    clearable
                    :size="config.renderConfig.layout.size"
                    class="w-100"
                    @change="handleChange"
            >
            </el-date-picker>
        </el-form-item>
    </el-col>
    <div v-else>
        <slot />
    </div>
</template>

<script>
import { debounce } from "@/lib"
export default {
    name: "SSearchItem",
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
        type: { //搜索框类型  input select date daterange
            type: String,
            default: "input"
        },
        defaultValue: { //v-model默认值
            type: String,
            default: ""
        },
        maxLength: { //普通输入框最大长度
            type: Number,
            default: 100
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
        multi: { //下拉菜单是否支持多选
            type: Boolean,
            default: false
        },
        dateLimit: { //日期限制   gt(大于今天) gte(大于等于今天) lt(小于今天) lte(小于等于今天)
            type: String,
            default: ""
        }
    },
    data() {
        return {
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
            time: [], //日期时间中间参数   
            multiData: [], //多选框中间参数
            privateSelectEnum: [], //下拉枚举值
            //=========================================================================//
            debounceFn: null, //节流函数
        };
    },
    computed: {
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
        realLabel() {
            if (this.label.endsWith("：")) {
                return this.label;
            } else if (this.label.endsWith(":")) {
                return this.label.replace(":", "：")
            } else {
                return this.label + "："
            }
        },
        placeholder() {
            if (this.type === "input") {
                return "请输入" + this.label;
            } else {
                return "请选择" + this.label;
            }
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
        time: { //日期处理
            handler(val) {
                if (val && val[0] && val[1]) {
                    this.formInfo[this.vModel] = val[0];
                    this.formInfo[this.vModel2] = val[1];
                } else {
                    this.formInfo[this.vModel] = null;
                    this.formInfo[this.vModel2] = null;
                }
            },
            deep: true
        },
        multiData: { //处理多选数组转换为，分割
             handler(val) {
                this.formInfo[this.vModel] = val.join(",");
            },
            deep: true
        },
        formInfo: {
            handler(val) {
                if (this.type === "daterange") { //处理重置的时候日期清空
                    if (!this.formInfo[this.vModel] && !this.formInfo[this.vModel2]) {
                        this.time = [];
                    }
                }
            },
            deep: true
        },
    },
    inject: ["formInfo"],
    created() {
        if (this.selectUrl) { //如果存在selectUrl则请求数据
            this.getSelectEnum();
        }
    },
    methods: {
        //获取下拉菜单枚举值
        getSelectEnum() {
            this.axios.get(this.selectUrl).then(res => {
                this.privateSelectEnum = res.data;
            }).catch(err => {
                this.$errorThrow(err, this);
            });
        },
        //搜索框数据发生改变
        handleChange(val) {
            if (!this.getAncestorComponent("SSearch").autoRequest) {
                return;
            }
            if (!this.debounceFn) {
                this.debounceFn = debounce((args) => {
                    this.dispatch("SSearch", "_change", args); //hack change会触发栈溢出，不知道为什么
                }, 500);
            } 
            this.debounceFn(val);
        },
    },
};
</script>



<style lang="scss" scoped>
.el-date-editor.el-input, .el-date-editor.el-input__inner {
    width: 100%!important;
}
</style>
