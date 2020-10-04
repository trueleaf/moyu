/*
    创建者：shuxiaokai
    创建时间：2020-02-17 16:59
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div v-if="type === 'custom'" v-bind="$attrs">
        <slot />
    </div>
    <!-- 分割线 -->
    <s-col v-else-if="type === 'divider'" oneLine>
        <el-divider content-position="left">
            <slot />
        </el-divider>        
    </s-col>
    <!-- 提交按钮 -->
    <s-col v-else-if="type === 'submit'" oneLine>
        <div class="d-flex a-center j-center">
            <slot />           
        </div>
    </s-col>
    <!-- 文件上传 -->
    <s-col v-else-if="type === 'upload'" oneLine>
        <s-upload v-model="formInfo[vModel]" v-bind="$attrs" v-on="$listeners">
            <div slot="tip"><slot /></div>
        </s-upload>
    </s-col>
    <s-col v-else v-bind="$attrs" :oneLine="oneLine" :halfLine="halfLine">
        <!-- 文本 -->
        <!-- <el-form-item v-if="type === 'text'" :label="realLabel">
            <span class="text-ellipsis gray-600">{{ formInfo[vModel] }}</span>
        </el-form-item> -->
        <s-text v-if="type === 'text'" v-model="formInfo[vModel]" :label="label" noCol v-bind="$attrs"></s-text>
        <!-- 普通输入框 -->
        <s-input 
                v-if="type === 'input'"
                v-model="formInfo[vModel]"
                v-bind="$attrs"
                :label="label"
                :labelWidth="labelWidth"
                :prop="prop || vModel"
                noCol
                @input="handleChange"
                v-on="$listeners"
        >
        </s-input>
        <!-- 密码输入框 -->
        <s-input 
                v-else-if="type === 'password'"
                v-model="formInfo[vModel]"
                v-bind="$attrs"
                :label="label"
                :prop="prop || vModel"
                :labelWidth="labelWidth"
                noCol
                type="password"
                show-password
                @input="handleChange"
                v-on="$listeners"
        >
        </s-input>
        <!-- 多行文本框 -->
        <s-input 
                v-else-if="type === 'textarea'"
                v-model="formInfo[vModel]"
                v-bind="$attrs"
                :label="label"
                :labelWidth="labelWidth"
                type="textarea"
                show-word-limit
                noCol
                :prop="prop || vModel"
                @input="handleChange"
                v-on="$listeners"
        >
        </s-input>
        <!-- 数字输入框 -->
        <s-input-number 
                v-else-if="type === 'number'"
                v-model="formInfo[vModel]"
                v-bind="$attrs"
                :label="label"
                :labelWidth="labelWidth"
                noCol
                :prop="prop || vModel"
                @input="handleChange"
                v-on="$listeners"
        >
        </s-input-number>
        <!-- 单选框(布尔值) -->
        <s-radio-bool 
                v-else-if="type === 'boolean'"
                v-model="formInfo[vModel]"
                v-bind="$attrs"
                :label="label"
                :labelWidth="labelWidth"
                noCol
                :prop="prop || vModel"
                @input="handleChange"
                v-on="$listeners"
        >
        </s-radio-bool>
        <!-- 单选框 -->
        <s-select 
                v-else-if="type === 'select'"
                v-model="formInfo[vModel]"
                v-bind="$attrs"
                :label="label"
                noCol
                :multi="multi"
                :labelWidth="labelWidth"
                :prop="prop || vModel"
                @input="handleChange"
                v-on="$listeners"
        >
        </s-select>
        <!-- 级联选择 -->
        <s-cascader 
                v-else-if="type === 'cascader'"
                :value="cascaderData"
                :vModels="vModels"
                v-bind="$attrs"
                :label="label"
                :labelWidth="labelWidth"
                noCol
                :prop="prop || vModel"
                @input="handleChange"
                v-on="$listeners"
        >
        </s-cascader>
        <!-- 单日期 -->
        <s-date 
                v-else-if="type === 'date'"
                v-model="formInfo[vModel]"
                v-bind="$attrs"
                :label="label"
                :labelWidth="labelWidth"
                noCol
                @change="handleChange"
                v-on="$listeners"
        >
        </s-date>
        <!-- 多日期 -->
        <s-daterange 
                v-else-if="type === 'daterange'"
                :vModel.sync="formInfo[vModel]"
                :vModel2.sync="formInfo[vModel2]"
                v-bind="$attrs"
                :label="label"
                :labelWidth="labelWidth"
                noCol
                @change="handleChange"
                v-on="$listeners"
        >
        </s-daterange>
    </s-col>
</template>

<script>
export default {
    name: "SSearchItem",
    props: {
        //=====================================公用====================================//
        label: { //文案
            type: String,
            default: ""
        },
        prop: { //制定某个参数进行校验
            type: String,
            default: ""
        },
        required: { //同上
            type: Boolean,
            default: false,
        },
        vModel: { //v-model绑定值
            type: String,
            default: ""
        },
        vModel2: { //第二个v-model值，用于日期范围选择
            type: String,
            default: ""
        },
        vModels: { //级联选择多个vmodel
            type: Array,
            default() {
                return [];
            }
        }, 
        type: { //搜索框类型  input select date daterange
            type: String,
            default: "input"
        },
        multi: { //是否多选
            type: Boolean,
            default: false,
        },
        oneLine: { //占满整行
            type: Boolean,
            default: false
        },
        halfLine: { //占半行
            type: Boolean,
            default: false
        },
        labelWidth: {
            type: String,
            default: ""
        },
        //=====================================规则相关====================================//
        sRule: { //自定义规则
            type: [Object, Array],
            default() {
                return [];
            }
        },
        minLen: { //最小长度
            type: Number,
            default: null
        },
        maxLen: { //最大长度
            type: Number,
            default: null
        },
        len: { //长度刚好等于
            type: Number,
            default: null
        },
        email: { //是否验证email类型
            type: Boolean,
            default: false
        },
        phone: { //是否验证手机号
            type: Boolean,
            default: false
        },
        nozh: { //是否不能包含中文
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            //=====================================级联选择器参数====================================//
            cascaderData: [], //级联选择器的值
            //=====================================图片上传====================================//
            //=========================================================================//
            debounceFn: null, //节流函数
        };
    },
    computed: {
     
    },
    watch: {
        formInfo: {
            handler() {
                if (this.type === "cascader") { //级联选择器处理
                    this.vModels.forEach(val => {
                        if (this.formInfo[val]) {
                            this.cascaderData.push(this.formInfo[val])
                        }
                    })
                }
            },
            deep: true, 
            immediate: true
        },
    },
    inject: ["formInfo", "rules"],
    created() {
       
    },
    methods: {
        //=====================================图片相关====================================//
        //图片上传成功
        // handleImgUploadSuccess(val) {
        //     this.formInfo[this.vModel] = val.join(",");
        // },
        //搜索框数据发生改变
        handleChange(value) {
            if (this.type === "cascader") {
                this.vModels.forEach((val, index) => { //清空以前数据
                    this.$set(this.formInfo, this.vModels[index], null)
                })
                value.forEach((val, index) => {
                    this.formInfo[this.vModels[index]] = val;
                })
            }
        },
    },
};
</script>



<style lang="scss">
.el-form-item {
    .w-100 {
        width: 100%!important;
    }
}
</style>
