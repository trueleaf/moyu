/*
    创建者：shuxiaokai
    创建时间：2020-07-07 15:56
    模块名称：
    备注：xxxx
*/
<template>
    <s-card2 :title="title" collapse :fold="fold" class="collapse-wrap">
        <slot name="operation" slot="operation" />
        <div class="params-edit">
            <el-tree 
                    ref="tree"
                    :data="treeData" 
                    :indent="50"
                    :highlight-current="true"
                    node-key="id" 
                    :expand-on-click-node="false" 
                    default-expand-all
                    :draggable="enableDrag"
                    :allow-drop="handleCheckNodeCouldDrop"
                    @node-drop="handleNodeDrop"
                    @check-change="handleCheckChange"
                    :show-checkbox="showCheckbox"
            >
                <template slot-scope="scope">
                    <div class="custom-tree-node">
                        <el-button type="text" :title="disableTitleTip" icon="el-icon-plus" :disabled="scope.data.type === 'file' || plain" @click="addNestTreeData(scope.data)"></el-button>
                        <el-button 
                                class="mr-2"
                                :disabled="!scope.node.nextSibling && scope.node.level === 1"
                                :title="`${(!scope.node.nextSibling && scope.node.level === 1) ? '此项不允许删除' : '删除当前项'}`"
                                type="text"
                                icon="el-icon-close"
                                @click="deleteTreeData(scope)">
                        </el-button>
                        <div class="w-20 mr-2 d-flex a-center">
                            <s-v-input 
                                    v-model="scope.data.key" 
                                    size="mini"
                                    :tip="keyTip"
                                    :error="scope.data._keyError"
                                    :disabled="scope.node.parent.data.type === 'array'"
                                    :title="`${scope.node.parent.data.type === 'array' ?  '父元素为list不必填写参数名称' : '参数名称，例如：age name job'}`"
                                    :placeholder="`${scope.node.parent.data.type === 'array' ?  '父元素为list不必填写参数名称' : '参数名称，例如：age name job'}`"
                                    remote
                                    @mindParamsSelect="(val) => { handleAddMindParams(scope.data, val) }"
                                    @input="addNewLine(scope)"
                                    @focus="enableDrag = false"
                                    @blur="handleCheckKey(scope);enableDrag=true"
                            >
                                <el-popover slot="tip" placement="top-start" trigger="hover" content="_id">
                                    <span slot="reference" class="theme-color ml-2">白名单</span>
                                </el-popover>
                            </s-v-input>
                        </div>
                        <el-select v-model="scope.data.type" :disabled="plain" :title="disableTypeTip" placeholder="类型" size="mini" class="mr-2" @change="handleChangeParamsType(scope.data)">
                            <el-option :disabled="scope.data.children && scope.data.children.length > 0" label="String" value="string"></el-option>
                            <el-option :disabled="isFormData || plain || (scope.data.children && scope.data.children.length > 0)" label="Number" value="number"></el-option>
                            <el-option :disabled="isFormData || plain || (scope.data.children && scope.data.children.length > 0)" label="Boolean" value="boolean"></el-option>
                            <el-option :disabled="isFormData || plain" label="Object" value="object"></el-option>
                            <el-option :disabled="isFormData || plain" label="List | Array" value="array"></el-option>
                            <el-option :disabled="!isFormData" label="file" value="file"></el-option>
                        </el-select>
                        <el-select v-if="scope.data.type === 'boolean'" v-model="scope.data.value" placeholder="请选择" size="mini" class="w-25 mr-2">
                            <el-option label="true" value="true"></el-option>
                            <el-option label="false" value="false"></el-option>
                        </el-select>
                        <s-v-input 
                                v-if="scope.data.type !== 'boolean' && scope.data.type !== 'file'"
                                :disabled="scope.data.type === 'array' || scope.data.type === 'object'"
                                title="对象和数组不必填写参数值"
                                v-model="scope.data.value"
                                size="mini"
                                :tip="valueTip"
                                :error="scope.data._valueError"
                                class="w-25 mr-2"
                                :placeholder="`${scope.data._valuePlaceholder || '参数值,例如：20 张三'}`"
                                @focus="enableDrag = false"
                                @blur="handleCheckValue(scope);enableDrag=true"
                        >
                        </s-v-input>
                        <el-select v-if="isFormData && scope.data.type === 'file'" v-model="scope.data.value" placeholder="浏览器限制" size="mini">
                            <el-option label="图片" value="image"></el-option>
                            <el-option label="pdf" value="pdf"></el-option>
                            <el-option label="word" value="word"></el-option>
                        </el-select>
                        <el-checkbox v-model="scope.data.required" label="必选"></el-checkbox>
                        <!-- {{ scope.data.value }} -->
                        <s-v-input 
                                v-model="scope.data.description"
                                size="mini" 
                                :tip="requiredTip"
                                :error="scope.data._descriptionError"
                                class="w-40 ml-2"
                                placeholder="参数描述与备注"
                                @focus="enableDrag = false"
                                @blur="handleCheckDescription(scope);enableDrag=true">
                        </s-v-input>
                    </div>
                </template>
            </el-tree>
        </div>     
    </s-card2>
</template>

<script>
import uuid from "uuid/v4"
import { dfsForest } from "@/lib/index"
export default {
    props: {
        title: { //-------------标题
            type: String,
            default: ""
        },
        treeData: { //----------树形结构数据
            type: Array,
            default() {
                return [];
            }
        },
        plain: { //-------------是否为扁平数据，扁平数据不允许嵌套并且数据类型只能为string
            type: Boolean,
            default: false
        },
        fold: { //--------------默认是否折叠
            type: Boolean,
            default: false
        },
        validKey: { //----------是否验证key值必须为指定类型
            type: Boolean,
            default: true
        },
        isFormData: { //----------是否为formData类型的文件上传
            type: Boolean,
            default: false
        },
        showCheckbox: { //是否展示checkbox
            type: Boolean,
            default: false
        },
        ready: { //是否完成第一次后台数据获取
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            //=====================================提示====================================//
            keyTip: {
                message: "字母,数字,驼峰命名",
                reference: "http://baidu.com"
            },
            valueTip: {
                message: "不能为空并且类型必须一致",
            },
            requiredTip: {
                message: "不能为空",
            },
            //=====================================其他参数====================================//
            enableDrag: true,
        };
    },
    computed: {
        disableTitleTip() {
            if (!this.plain) {
                return "点击添加嵌套数据"
            } else {
                return "当前请求类型只允许扁平数据，不允许存在复杂数据(GET请求只能发送查询字符串)"
            }
        },
        disableTypeTip() {
            if (this.plain) {
                return "get请求或者header的值只允许为string"
            } else {
                return ""
            }
        },
        keyWhiteList() {
            return this.$store.state.apidocRules.keyWhiteList
        }
    },
    watch: {
        ready: {
            handler(value) {
                if (value === true) { //第一次值改变
                    setTimeout(() => {
                        this.$refs["tree"].setCheckedNodes(this.treeData);
                    })
                }
            },
            immediate: true
        }
    },
    created() {
        
    },
    methods: {
        //=====================================参数操作====================================//
        //添加嵌套数据
        addNestTreeData(data) {
            if (data.children == null) {
                this.$set(data, "children", []);
            }
            const params = this.generateParams();
            data.children.push(params);
            setTimeout(() => { //hack
                this.$refs["tree"].setChecked(params.id, true);
            })
            data.value = "";
            this.$set(data, "_valueError", false);
            this.$set(data, "_valuePlaceholder", "对象和数组不必填写参数值");
            if (data.type === "object" || data.type === "array") {
                return
            } else { //默认设置为object
                data.type = "object"
            }
        },
        //删除数据
        deleteTreeData({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            if (parentNode.level === 0) { //根节点直接删除，非根节点在children里删除
                const deleteIndex = parentData.findIndex(val => val.id === data.id);
                if (parentData.length - 1 === deleteIndex) { //不允许删除最后一个元素
                    return;
                }
                parentData.splice(deleteIndex, 1);
            } else {
                const deleteIndex = parentData.children.findIndex(val => val.id === data.id);
                // if (parentData.children.length > 1 && deleteIndex === parentData.children.length - 1) { //子元素大于1的时候最后一个数据不允许被删除
                //     return;
                // } else {
                //     }
                parentData.children.splice(deleteIndex, 1)
            }
        },
        //新增一行
        addNewLine({ node, data }) {
            if (data.key && data.key.trim() !== "") {
                const parentNode = node.parent;
                const parentData = node.parent.data;
                if (parentNode.level === 0) { //根节点直接往数据里面push，非根节点往children里push
                    if (parentData[parentData.length - 1].key && parentData[parentData.length - 1].key.trim() !== "") {
                        parentData.push(this.generateParams());
                    }
                } else {
                    if (parentData.children[parentData.children.length - 1].key && parentData.children[parentData.children.length - 1].key.trim() !== "") {
                        parentData.children.push(this.generateParams());
                    }
                }
                // this.$set(data, "checked", true);
                this.$refs["tree"].setChecked(data.id, true);
            }
        },
        //改变参数类型
        handleChangeParamsType(data) {
            if (data.type === "boolean") {
                data.value = "true";
            }
            if (data.type === "file") {
                data.value = "image"
            }
            if (data.type === "object" || data.type === "array") {
                if (data.type === "array" && data.children && data.children.length > 0) { //清空子元素所有参数名称
                    dfsForest(data.children, {
                        rCondition(value) {
                            return value.children;
                        },
                        rKey: "children",
                        hooks: (data) => {
                            data.key = "";
                            this.$set(data, "_keyError", false); //清除子元素key值校验
                        }
                    });
                }
                data.value = "";
                this.$set(data, "_valueError", false);
                this.$set(data, "_valuePlaceholder", "对象和数组不必填写参数值");
            } else {
                this.$set(data, "_valuePlaceholder", "");
            }
        },
        handleCheckChange() {     
            //首先清空所有选中数据  
            dfsForest(this.treeData, {
                rCondition(value) {
                    return value.children;
                },
                rKey: "children",
                hooks: (data) => {
                    this.$set(data, "_select", false);
                }
            });
            const checkedNodes = this.$refs["tree"].getCheckedNodes();
            const halfCheckedNodes = this.$refs["tree"].getHalfCheckedNodes();
            checkedNodes.forEach(val => {
                this.$set(val, "_select", true)
            })
            halfCheckedNodes.forEach(val => {
                this.$set(val, "_select", true)
            })
        },
        //快捷新增一条参数
        handleAddMindParams(data, val) {
            if (this.plain && val.type !== "string") {
                val.type = "string";
            }
            val.uuid = uuid();
            // val._id = uuid(); //防止_id相同导致vue跟新错误
            // val.id = uuid(); //防止_id相同导致vue跟新错误
            Object.assign(data, val)
        },
        //=====================================数据校验====================================//
        //检查参数是否输入完备
        handleCheckKey({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            const nodeIndex = (parentNode.level === 0) ? parentData.findIndex(val => val.id === data.id) : parentData.children.findIndex(val => val.id === data.id);
            if (parentNode.level === 0 && parentData.length === 1) { //根元素第一个可以不必校验因为参数可以不必填
                return;
            }
            if (nodeIndex !== parentData.length - 1) { //只要不是最后一个值都需要做数据校验 
                if (this.keyWhiteList.includes(data.key)) { //白名单
                    this.$set(data, "_keyError", false)
                } else if (data.key.trim() === "") { //非空校验
                    this.$set(data, "_keyError", true)
                } else if (this.validKey && !data.key.match(/^[a-zA-Z0-9]*$/)) { //字母数据
                    this.$set(data, "_keyError", true)
                } else {
                    this.$set(data, "_keyError", false)
                }         
            } 
        },
        //检查参数值
        handleCheckValue({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            const nodeIndex = (parentNode.level === 0) ? parentData.findIndex(val => val.id === data.id) : parentData.children.findIndex(val => val.id === data.id);
            if (data.type === "object" || data.type === "array") { //数据和对象不必校验
                return;
            }
            if (parentNode.level === 0 && parentData.length === 1) { //根元素第一个可以不必校验因为参数可以不必填
                return;
            }
            if (nodeIndex !== parentData.length - 1) { //只要不是最后一个值都需要坐数据校验 
                console.log(data.value)
                if (data.value && data.value.trim() === "") { //非空校验
                    this.valueTip.message = "不能为空"
                    this.$set(data, "_valueError", true);
                } else if (data.type === "number" && !data.value.match(/^-?(0\.\d+|[1-9]+\.\d+|[1-9]\d{0,20}|[0-9])$/)) { //纯数字校验
                    this.valueTip.message = "不能为空，并且值必须为数字"
                    this.$set(data, "_valueError", true);
                } else {
                    this.$set(data, "_valueError", false);
                }                
            } 
        },
        //检查参数描述
        handleCheckDescription({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            const nodeIndex = (parentNode.level === 0) ? parentData.findIndex(val => val.id === data.id) : parentData.children.findIndex(val => val.id === data.id);
            if (parentNode.level === 0 && parentData.length === 1) { //根元素第一个可以不必校验因为参数可以不必填
                return;
            }
            if (nodeIndex !== parentData.length - 1) { //只要不是最后一个值都需要坐数据校验 
                if (data.description && data.description.trim() === "") { //非空校验
                    this.$set(data, "_descriptionError", true)
                } else {
                    this.$set(data, "_descriptionError", false)
                }                
            } 
        },
        //=====================================组件间交互====================================//  
        //生成请求数据
        generateParams(type = "string") {
            return {
                id: uuid(),
                key: "",
                description: "",
                type: type,
                value: "",
                required: true,
            }
        },
        //=====================================其他操作=====================================//
        //判断是否允许拖拽
        handleCheckNodeCouldDrop(draggingNode, dropNode, type) {
            if (this.plain) {
                return type !== "inner";
            } else {
                return true;
            }
        },
        handleNodeDrop({ data }, dropNode) {
            dropNode.data.type = "object";
            dropNode.data.value = "";
            this.$refs["tree"].setChecked(data.id, true);
        },
    }
};
</script>



<style lang="scss">
.collapse-wrap {
    .el-collapse-item__header {
        background: $gray-200;
    }
    .params-edit {
        overflow-y: auto;
        .el-tree-node__content {
            height: 60px;
        }
        .el-input__inner {
            border-radius: 0;
            border: none;
            border-bottom: 1px solid $gray-300;
        }
        .custom-tree-node {
            width: 100%;
            display: flex;
            align-items: center;
        }
    }
}
</style>
