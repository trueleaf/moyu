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
            >
                <template slot-scope="scope">
                    <div class="custom-tree-node">
                        <el-button type="text" title="新增嵌套数据" icon="el-icon-plus" @click="addNestTreeData(scope.data)"></el-button>
                        <el-button 
                                class="mr-2"
                                :disabled="!scope.node.nextSibling && scope.node.level === 1"
                                :title="`${(!scope.node.nextSibling && scope.node.level === 1) ? '此项不允许删除' : '删除当前项'}`"
                                type="text"
                                icon="el-icon-close"
                                @click="deleteTreeData(scope)">
                        </el-button>
                        <!-- 参数名称 -->
                        <div class="w-10 mr-2 d-flex a-center">
                            <s-v-input 
                                    v-model="scope.data.key" 
                                    size="mini"
                                    placeholder="参数名称"
                                    class="w-100"
                                    remote
                                    @mindParamsSelect="(val) => { handleAddMindParams(scope.data, val) }"
                                    @input="addNewLine(scope)"
                                    @focus="enableDrag = false"
                                    @blur="enableDrag=true"
                            >
                            </s-v-input>
                        </div>
                        <!-- 参数类型 -->
                        <el-select v-model="scope.data.type" placeholder="类型" size="mini" class="mr-2" @change="handleChangeParamsType(scope.data)">
                            <el-option :disabled="scope.data.children && scope.data.children.length > 0" label="String" value="String"></el-option>
                            <el-option :disabled="(scope.data.children && scope.data.children.length > 0)" label="Number" value="Number"></el-option>
                            <el-option :disabled="(scope.data.children && scope.data.children.length > 0)" label="Boolean" value="Boolean"></el-option>
                            <el-option label="Object" value="Object"></el-option>
                            <el-option label="Array" value="Array"></el-option>
                            <el-option label="Date" value="Date"></el-option>
                            <el-option label="ObjectId" value="ObjectId"></el-option>
                        </el-select>
                        <!-- 默认值 -->
                        <s-v-input 
                                :disabled="scope.data.type === 'Array' || scope.data.type === 'Object' || scope.data.type === 'ObjectId'"
                                title="对象和数组不必填写参数值"
                                v-model="scope.data.default"
                                size="mini"
                                class="w-10 mr-2"
                                placeholder="默认值"
                                @focus="enableDrag = false"
                                @blur="enableDrag=true"
                        >
                        </s-v-input>
                        <!-- 是否必填 -->
                        <el-checkbox v-model="scope.data.required" label="必填"></el-checkbox>
                        <!-- 参数描述与备注 -->
                        <s-v-input 
                                v-model="scope.data.comment"
                                size="mini" 
                                class="w-15 mx-2"
                                placeholder="参数描述与备注"
                                @focus="enableDrag = false"
                                @blur="enableDrag=true">
                        </s-v-input>
                        <!-- 字符串类型单独处理 -->
                        <template v-if="scope.data.type === 'String'">
                            <el-select v-model="scope.data.stringOp.limit" placeholder="限制" multiple size="mini" class="w-10 mr-2">
                                <el-option label="trim" value="trim"></el-option>
                                <el-option label="lowercase" value="lowercase"></el-option>
                                <el-option label="uppercase" value="uppercase"></el-option>
                            </el-select>
                            <el-input-number 
                                v-model="scope.data.stringOp.minlength"
                                size="mini"
                                placeholder="最小长度"
                                :controls="false"
                                class="w-5 mr-2"
                                @focus="enableDrag = false"
                                @blur="enableDrag=true">
                            </el-input-number>
                            <el-input-number 
                                v-model="scope.data.stringOp.maxlength"
                                size="mini"
                                placeholder="最大长度"
                                :controls="false"
                                class="w-5"
                                @focus="enableDrag = false"
                                @blur="enableDrag=true">
                            </el-input-number>
                            <s-v-input 
                                v-model="scope.data.stringOp.enum"
                                size="mini" 
                                class="w-15 mx-2"
                                placeholder="枚举值逗号分隔"
                                @focus="enableDrag = false"
                                @blur="enableDrag=true">
                            </s-v-input>
                        </template>
                        <!-- 数字类型单独处理 -->
                        <template v-if="scope.data.type === 'Number'">
                            <el-input-number 
                                v-model="scope.data.numberOp.min"
                                size="mini"
                                placeholder="最小值"
                                :controls="false"
                                class="w-5 mr-2"
                                @focus="enableDrag = false"
                                @blur="enableDrag=true">
                            </el-input-number>
                            <el-input-number 
                                v-model="scope.data.numberOp.max"
                                size="mini"
                                placeholder="最大值"
                                :controls="false"
                                class="w-5"
                                @focus="enableDrag = false"
                                @blur="enableDrag=true">
                            </el-input-number>
                            <s-v-input 
                                v-model="scope.data.numberOp.enum"
                                size="mini" 
                                class="w-15 mx-2"
                                placeholder="枚举值逗号分隔"
                                @focus="enableDrag = false"
                                @blur="enableDrag=true">
                            </s-v-input>
                        </template>
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
        fold: { //--------------默认是否折叠
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            //=====================================其他参数====================================//
            enableDrag: true,
        };
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
            if (data.type === "Object" || data.type === "Array") {
                return
            } else { //默认设置为Object
                data.type = "Object"
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
        //快捷新增一条参数
        handleAddMindParams(data, val) {
            val.uuid = uuid();
            Object.assign(data, val)
        },
        //=====================================组件间交互====================================//  
        //生成请求数据
        generateParams(type = "String") {
            return {
                id: uuid(),
                key: "", 
                type: "String",
                default: "",
                required: true,
                children: [],
                comment: "",
                stringOp: {
                    limit: [],
                    minlength: 0,
                    maxlength: 255,
                    enum: "",
                    match: null,
                },
                numberOp: {
                    limit: [],
                    min: 0,
                    max: 999999,
                    enum: "",
                },
                DateOp: {},
                _enableAdd: true,
                _enableEdit: true,
                _enableList: false,
                _enableField: true,
                _enableEnumField: false,
                _uniqueAdd: false,
                _uniqueEdit: false,
                _tip: "",
            }
        },
        //=====================================其他操作=====================================//
        //判断是否允许拖拽
        handleCheckNodeCouldDrop(draggingNode, dropNode, type) {
            // if (type === "inner") {
            //     console.log(dropNode)
            // }
            return type !== "inner";
        },
        handleNodeDrop({ data }) {
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
