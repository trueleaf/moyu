/*
    创建者：shuxiaokai
    创建时间：2020-03-30 15:19
    模块名称：级联选择二次封装
    备注：xxxx
*/
<template>
    <s-col v-bind="$attrs">
        <!-- 存在el-form-item包裹 -->
        <el-form-item v-if="!noFormItem" :label="realLabel" :prop="prop" :label-width="labelWidth">
            <el-cascader
                    v-model="cascaderData"
                    v-bind="$attrs"
                    :placeholder="placeholder"
                    :props="props"
                    :size="config.renderConfig.layout.size"
                    :class="className"
                    clearable
                    @change="handleChange"
                    v-on="$listeners">
            </el-cascader>
        </el-form-item>   
        <!-- 不存在el-form-item包裹 -->
        <el-cascader
                v-else
                v-model="cascaderData"
                v-bind="$attrs"
                :placeholder="placeholder"
                :props="props"
                :size="config.renderConfig.layout.size"
                :class="className"
                clearable
                @change="handleChange"
                v-on="$listeners">
        </el-cascader>  
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
            type: Array,
            default() {
                return []
            }
        },
        noFormItem: { //是否存在el-form-item包裹
            type: Boolean,
            default: false
        },
        prop: { //表单验证prop值
            type: String,
            default: ""
        },
        url: {
            type: String,
            default: ""
        },
        pid: { //级联选择器传递父元素id映射
            type: String,
            default: "id"
        },
        vModels: { //级联选择多个vmodel
            type: Array,
            default() {
                return [];
            }
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
            props: {
                lazy: true,
                checkStrictly: true,
                // expandTrigger: "hover",
                lazyLoad: this.lazyLoad
            },
            cascaderData: [], //级联中间参数
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
    },
    watch: {
        value: {
            handler(value) {
                if (this.cascaderData.length === 0) {
                    this.cascaderData = [];
                    value.forEach((val) => {
                        this.cascaderData.push(val);
                    })
                }
            },
            deep: true
        }
    },
    created() {
        
    },
    methods: {
        //=====================================获取远程数据==================================//
        getData(pid) {
            const params = {};
            params[this.pid] = pid;
            return new Promise((resolve, reject) => {
                this.axios.get(this.url, { params }).then((res) => {
                    resolve(res.data);
                }).catch((err) => {
                    reject(err);
                });                
            });
        },       
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        handleChange(val) {
            this.$emit("change", val);
        },
        lazyLoad(node, resolve) {
            const { level } = node;
            const pid = node.data ? node.data.pid : null
            this.getData(pid).then((data) => {
                const node = data.map((val) => {
                    return {
                        pid: val.id,
                        value: val.id,
                        label: val.name,
                        leaf: level > 2
                    };
                })
                resolve(node);
            }).catch((err) => {
                this.$errorThrow(err, this);
            })
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
