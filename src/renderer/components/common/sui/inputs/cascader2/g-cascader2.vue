/*
    创建者：shuxiaokai
    创建时间：2020-05-12 16:22
    模块名称：
    备注：xxxx
*/
<template>
    <s-col v-bind="$attrs" halfLine>
        <!-- 存在el-form-item包裹 -->
        <div v-if="!noFormItem" :label-width="labelWidth">
            <div class="d-flex">
                <div v-for="(item, index) in options" :key="index">
                    <el-form-item v-if="index === 0" :prop="item.vModel" :label="realLabel" class="flex1">
                        <el-select
                                v-model="cascaderData[item.vModel]"
                                :size="config.renderConfig.layout.size"
                                class="w-100"
                                clearable
                                filterable
                                :placeholder="item.placeholder"
                                @change="(val) => { handleChange(val, item, index) }">
                            <el-option v-for="(item2, index2) in cascaderEnum[index]" :key="index2" :value="item2.id" :label="item2.name"></el-option>
                        </el-select>
                    </el-form-item>    
                    
                    <el-form-item v-else :prop="item.vModel" label-width="0px" class="flex1">
                        <el-select
                                v-model="cascaderData[item.vModel]"
                                :size="config.renderConfig.layout.size"
                                class="w-100"
                                clearable
                                filterable
                                :placeholder="item.placeholder"
                                @change="(val) => { handleChange(val, item, index) }">
                            <el-option v-for="(item2, index2) in cascaderEnum[index]" :key="index2" :value="item2.id" :label="item2.name"></el-option>
                        </el-select>
                    </el-form-item>    
                </div>
            </div>
        </div>   
        <!-- 不存在el-form-item包裹 -->
        <div v-else class="d-flex">
            <!-- {{ cascaderData }} -->
            <div v-for="(item, index) in options" :key="index">
                <el-select v-model="cascaderData[item.vModel]" size="mini" class="w-100" name="name" clearable filterable :placeholder="item.placeholder" @change="(val) => { handleChange(val, item, index) }">
                    <el-option v-for="(item2, index2) in cascaderEnum[index]" :key="index2" :value="item2.id" :label="item2.name"></el-option>
                </el-select>
            </div>
        </div>
    </s-col>


</template>

<script>
export default {
    props: {
        url: { //请求url
            type: String,
            default: ""
        },
        /*
            options: [
                {
                    vModel: "province", //绑定值
                    placeholder: "省", //placeholder
                    value: 51, //默认值
                },
                {
                    vModel: "city",
                    placeholder: "市",
                    value: 5101
                },
                {
                    vModel: "county",
                    placeholder: "区",
                    value: 510104
                }
            ]
        */
        options: {
            type: Array,
            default() {
                return [];
            }
        },
        pid: {
            type: String,
            default: "id"
        },
        label: { //文案
            type: String,
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
        labelWidth: { //label宽度
            type: String,
            default: null
        },
    },
    data() {
        return {
            cascaderData: {}, //级联数据
            cascaderEnum: []
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
    },
    watch: {
        options: {
            handler() {
                this.init();
            },
            deep: true,
            immediate: true
        }
    },
    created() {
        //this.init();
    },
    methods: {
        /** 
         * @description        注意，在s-form里面改变级联参数的值只会生效一次(准确的说，只能在级联数组为空的时候才能生效)，但是不影响组件内部自己改变
         * @autor              shuxiaokai
         * @create             2020-05-20 14:36
         */
        async init() {
            this.cascaderEnum = []
            for (let i = 0; i < this.options.length; i++) {
                this.$set(this.cascaderData, this.options[i].vModel, this.options[i].value || null);

                console.log(this.options[i].value, this.cascaderEnum[i])
                if (i === 0) {
                    const areaData = await this.getData();
                    this.$set(this.cascaderEnum, i, areaData)
                } 
                if (i !== this.options.length - 1 && this.options[i].value && (!this.cascaderEnum[i + 1] || this.cascaderEnum[i + 1].length === 0)) {
                    const areaData = await this.getData(this.options[i].value);
                    this.$set(this.cascaderEnum, i + 1, areaData)
                }
            }
            console.log(this.cascaderEnum)
        },
        //=====================================获取远程数据==================================//
        getData(pid) {
            const params = {};
            params[this.pid] = pid;
            return new Promise((resolve, reject) => {
                this.axios.get(this.url, { params }).then(res => {
                    resolve(res.data);
                }).catch(err => {
                    reject(err);
                });                
            });
        },
        handleChange(val, item, index) {
            if (!val) { //清空级联数据
                this.cascaderEnum.splice(index + 1);
                this.options.forEach((opt, i) => {
                    if (i > index) {
                        this.cascaderData[opt.vModel] = null;
                    }
                })
            } else if (val) { //选择某个级联数据
                this.cascaderEnum.splice(index + 1);
                this.options.forEach((opt, i) => {
                    if (i > index) {
                        this.cascaderData[opt.vModel] = null;
                    }
                })
                this.getData(val).then(data => {
                    this.cascaderEnum.push(data)
                });
            }
            this.$emit("input", this.cascaderData);
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
