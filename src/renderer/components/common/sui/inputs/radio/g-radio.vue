/*
    创建者：shuxiaokai
    创建时间：2020-05-20 15:19
    模块名称：radio二次封装
    备注：xxxx
*/
<template>
    <s-col v-bind="$attrs">
        <!-- 存在el-form-item包裹 -->
        <el-form-item v-if="!noFormItem" :label="realLabel" :prop="prop" :label-width="labelWidth">
            <el-radio-group 
                    :value="value"
                    v-bind="$attrs"
                    :placeholder="placeholder" 
                    :size="config.renderConfig.layout.size" 
                    :class="className" 
                    @change="handleInput"
                    v-on="$listeners"

            >
                <el-radio v-for="(item, index) in options" :key="index" :label="item.id">{{ item.name }}</el-radio>
            </el-radio-group>
        </el-form-item>   
        <!-- 不存在el-form-item包裹 -->
        <el-radio-group 
                v-else
                :value="value"
                v-bind="$attrs"
                :placeholder="placeholder" 
                :size="config.renderConfig.layout.size" 
                :class="className" 
                @change="handleInput"
                v-on="$listeners"

        >
            <el-radio v-for="(item, index) in options" :key="index" :label="item.id">{{ item.name }}</el-radio>
        </el-radio-group>  
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
            type: [String, Number],
            default: ""
        },
        noFormItem: { //是否存在el-form-item包裹
            type: Boolean,
            default: false
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
        options: { //配置信息
            type: Array,
            default() {
                return [];
            }
        },
    },
    data() {
        return {};
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
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        handleInput() {
            this.$emit("input", this.value);
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
