/*
    创建者：shuxiaokai
    创建时间：2020-10-17 12:51
    模块名称：参数树
    备注：xxxx
*/
<template>
    <div class="params-tree">
        <el-tree 
                ref="tree"
                :data="treeData" 
                :indent="50"
                :highlight-current="true"
                node-key="id" 
                :expand-on-click-node="false" 
                :draggable="enableDrag"
                :allow-drop="handleCheckNodeCouldDrop"
                :show-checkbox="showCheckbox"
                :default-expanded-keys="defaultExpandedKeys"
                @node-drop="handleNodeDrop"
                @check-change="handleCheckChange"
        >
            <template slot-scope="scope">
                <div class="custom-tree-node">
                    <!-- 新增嵌套数据按钮 -->
                    <el-button type="text" :title="addNestTip" icon="el-icon-plus" :disabled="scope.data._readOnly || !nest" @click="addNestTreeData(scope.data)"></el-button>
                    <!-- 删除一行数据按钮 -->
                    <el-button 
                            class="mr-2"
                            :disabled="scope.data._readOnly || (!scope.node.nextSibling && scope.node.level === 1)"
                            :title="`${(!scope.node.nextSibling && scope.node.level === 1) ? '此项不允许删除' : '删除当前行'}`"
                            type="text"
                            icon="el-icon-close"
                            @click="deleteTreeData(scope)">
                    </el-button>
                    <!-- 参数key值输入框 -->
                    <div class="w-20 mr-2 d-flex a-center">
                        <s-v-input 
                                v-model="scope.data.key" 
                                size="mini"
                                :error="scope.data._keyError"
                                :disabled="scope.data._readOnly || scope.node.parent.data.type === 'array'"
                                :title="`${scope.node.parent.data.type === 'array' ?  '父元素为数组不必填写参数名称' : ''}`"
                                :placeholder="`${scope.node.parent.data.type === 'array' ?  '父元素为数组不必填写参数名称' : '参数名称，例如：age name'}`"
                                :mind-params="mindParams"
                                remote
                                @mindParamsSelect="(val) => { covertMindParamsToRealParasm(scope.data, val) }"
                                @input="addNewLine(scope)"
                                @focus="enableDrag = false"
                                @blur="handleCheckKeyField(scope);enableDrag=true"
                        >
                        </s-v-input>
                    </div>
                    <!-- 请求参数类型 -->
                    <el-select v-model="scope.data.type" :disabled="scope.data._readOnly || (!nest && !enableFormData)" :title="disableTypeTip" placeholder="类型" size="mini" class="mr-2" @change="handleChangeParamsType(scope.data)">
                        <el-option :disabled="scope.data.children && scope.data.children.length > 0" label="String" value="string"></el-option>
                        <el-option :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Number" value="number"></el-option>
                        <el-option :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Boolean" value="boolean"></el-option>
                        <el-option :disabled="!nest" label="Object" value="object"></el-option>
                        <el-option :disabled="!nest" label="List | Array" value="array"></el-option>
                        <el-option :disabled="!enableFormData" title="传输数据类型为formData才能使用file类型" label="file" value="file"></el-option>
                    </el-select>
                    <!-- 参数值 -->
                    <s-v-input 
                            v-if="scope.data.type !== 'boolean' && scope.data.type !== 'file'"
                            :disabled="scope.data._readOnly || scope.data.type === 'array' || scope.data.type === 'object'"
                            title="对象和数组不必填写参数值"
                            v-model="scope.data.value"
                            size="mini"
                            :error="scope.data._valueError"
                            class="w-25 mr-2"
                            :placeholder="`${scope.data._valuePlaceholder || '参数值,例如：20 张三'}`"
                            @focus="enableDrag = false"
                            @blur="handleCheckValue(scope);enableDrag=true"
                    >
                    </s-v-input>
                    <input v-if="scope.data.type === 'file'" class="w-25" type="file" @change="handleSelectFile($event, scope.data)">
                    <!-- <s-file-select v-if="scope.data.type === 'file'" class="w-25">
                        <div class="text-center">
                            <button>选择文件</button>
                        </div>
                    </s-file-select> -->
                    <el-select v-if="scope.data.type === 'boolean'" v-model="scope.data.value" placeholder="请选择" size="mini" class="w-25 mr-2">
                        <el-option label="true" value="true"></el-option>
                        <el-option label="false" value="false"></el-option>
                    </el-select>
                    <!-- 参数是否必填 -->
                    <el-checkbox v-model="scope.data.required" :disabled="scope.data._readOnly" label="必有"></el-checkbox>
                    <!-- 参数描述 -->
                    <s-v-input 
                            v-model="scope.data.description"
                            size="mini" 
                            :error="scope.data._descriptionError"
                            :disabled="scope.node.parent.data.type === 'array'"
                            class="w-40 ml-2"
                            placeholder="参数描述与备注"
                            @focus="enableDrag = false"
                            @blur="handleCheckDescription(scope);enableDrag=true">
                    </s-v-input>
                    <!-- 
                    <el-select v-if="isFormData && scope.data.type === 'file'" v-model="scope.data.value" placeholder="浏览器限制" size="mini">
                        <el-option label="图片" value="image"></el-option>
                        <el-option label="pdf" value="pdf"></el-option>
                        <el-option label="word" value="word"></el-option>
                    </el-select>
                    -->
                </div>
            </template>
        </el-tree> 
    </div>  
</template>

<script>
import { dfsForest } from "@/lib/index"
import mixin from "../../mixin" //公用数据和函数
export default {
    mixins: [mixin],
    props: {
        mindParams: { //联想参数
            type: Array,
            default() {
                return [];
            }
        },
        treeData: { //树形数据
            type: Array,
            default() {
                return []
            }
        },
        showCheckbox: { //是否展示checkbox, eg: 请求参数可以进行选择
            type: Boolean,
            default: false
        },
        nest: { //是否允许参数嵌套，eg：当请求方式为get时，请求参数只能为扁平数据
            type: Boolean,
            default: false,
        },
        enableFormData: { //是否允许formData
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            defaultExpandedKeys: [],
            enableDrag: true, //是否允许拖拽
        };
    },
    computed: {
        addNestTip() {
            if (!this.nest) {
                return "参数不允许嵌套，eg：当请求方式为get时，请求参数只能为扁平数据";
            } else {
                return "添加一条嵌套数据";
            }
        },
        disableTypeTip() {
            if (!this.nest) {
                return "参数类型不允许改变，eg：当请求方式为get时，请求参数类型只能为string"
            } else {
                return ""
            }
        },
        variables() { //全局变量
            return this.$store.state.apidoc.variables || [];
        },
    },
    created() {

    },
    methods: {
        //=====================================一条数据的操作，新增嵌套数据，删除嵌套数据====================================//
        //添加一个嵌套数据
        addNestTreeData(data) {
            const params = this.generateProperty();
            if (data.children == null) { //如果children无值则默认添加为空数组，防止异常或者数据无法响应式变化
                this.$set(data, "children", []);
            }
            data.children.push(params);
            setTimeout(() => { //hack，添加一个数据默认选中当前数据
                this.$refs["tree"]?.setChecked(params.id, true);
            })
            data.value = "";
            this.$set(data, "_valueError", {
                error: false
            });
            this.$set(data, "_valuePlaceholder", "对象和数组不必填写参数值");
            if (data.type === "object" || data.type === "array") {
                return
            } else { //默认设置为object
                data.type = "object"
            }
            this.defaultExpandedKeys.push(params.id);
        },
        //删除一条数据
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
                parentData.children.splice(deleteIndex, 1)
            }
        },
        //===================================key值操作======================================//
        //将快捷参数数据转换为一条请求参数
        covertMindParamsToRealParasm(data, val) {
            if (!this.nest && val.type !== "string") { //禁止嵌套并且参数类型不是字符串的统一转换为字符串
                val.type = "string";
            }
            val.uuid = this.$helper.uuid();
            //通过快捷参数带出的数据需要把错误校验去掉
            this.$set(data, "_valueError", {
                error: false
            })
            this.$set(data, "_descriptionError", {
                error: false
            })
            Object.assign(data, val);
        },
        //新增一行
        addNewLine({ node, data }) {
            if (data.key && data.key.trim() !== "") {
                const parentNode = node.parent;
                const parentData = node.parent.data;
                if (parentNode.level === 0) { //根节点直接往数据里面push，非根节点往children里push
                    if (parentData[parentData.length - 1].key && parentData[parentData.length - 1].key.trim() !== "") {
                        parentData.push(this.generateProperty());
                    }
                } else {
                    if (parentData.children[parentData.children.length - 1].key && parentData.children[parentData.children.length - 1].key.trim() !== "") {
                        parentData.children.push(this.generateProperty());
                    }
                }
                this.$refs["tree"]?.setChecked(data.id, true);
            }
        },
        //校验key值是否满足规范
        handleCheckKeyField({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            const nodeIndex = (parentNode.level === 0) ? parentData.findIndex(val => val.id === data.id) : parentData.children.findIndex(val => val.id === data.id);
            if (parentNode.level === 0 && parentData.length === 1) { //根元素第一个可以不必校验因为参数可以不必填
                return;
            }
            if (nodeIndex !== parentData.length - 1) { //只要不是最后一个值都需要做数据校验 
                if (data.key.trim() === "" || data.key.match(/(^\s+)|(\s+$)/)) { //非空校验
                    this.$set(data, "_keyError", {
                        error: true,
                        message: "不能存在空白字符串"
                    })
                } else {
                    this.$set(data, "_keyError", {
                        error: false
                    })
                }         
            } 
        },    
        //=====================================type操作====================================//
        //改变请求参数类型
        handleChangeParamsType(data) {
            if (data.type === "boolean") {
                data.value = "true";
            }
            if (data.type === "file") {
                data.value = "";
            }
            if (data.type === "number") {
                const couldConvertToNumber = !isNaN(Number(data.value));
                if (!couldConvertToNumber) {
                    data.value = "0"
                }
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
                            this.$set(data, "_keyError", {
                                error: false
                            }); //清除子元素key值校验
                        }
                    });
                }
                data.value = "";
                this.$set(data, "_valueError", {
                    error: false
                });
                this.$set(data, "_valuePlaceholder", "对象和数组不必填写参数值");
            } else {
                this.$set(data, "_valuePlaceholder", "");
            }
        },
        //=====================================value操作====================================//
        handleCheckValue({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            const nodeIndex = (parentNode.level === 0) ? parentData.findIndex(val => val.id === data.id) : parentData.children.findIndex(val => val.id === data.id);
            const realValue = this.convertVariable(data.value);
            // console.log(realValue)
            if (data.type === "object" || data.type === "array") { //数据和对象不必校验
                return;
            }
            if (parentNode.level === 0 && parentData.length === 1) { //根元素第一个可以不必校验因为参数可以不必填
                return;
            }
            if (nodeIndex !== parentData.length - 1) { //只要不是最后一个值都需要作数据校验 
                console.log(this.getType(realValue), this._isNumberLike(realValue))
                if (data.type === "number" && !this._isNumberLike(realValue)) {
                    this.$set(data, "_valueError", {
                        error: true,
                        message: "参数值必须为数字类型"
                    });
                } else if (realValue == null) {
                    this.$set(data, "_valueError", {
                        error: true,
                        message: "不能为null或者undefined"
                    });
                } else if (realValue.trim() === "" || realValue.match(/(^\s+)|(\s+$)/)) { //前后不能存在空格中间可以存在空格
                    this.$set(data, "_valueError", {
                        error: true,
                        message: "不能存在空白字符串"
                    });
                } else {
                    this.$set(data, "_valueError", {
                        error: false,
                    });
                }     
            } 
        },
        //=====================================参数描述====================================//
        handleCheckDescription({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            const nodeIndex = (parentNode.level === 0) ? parentData.findIndex(val => val.id === data.id) : parentData.children.findIndex(val => val.id === data.id);
            if (parentNode.level === 0 && parentData.length === 1) { //根元素第一个可以不必校验因为参数可以不必填
                return;
            }
            if (parentData.type === "array") { //父元素为数组不用书写描述
                return
            }
            if (nodeIndex !== parentData.length - 1) { //只要不是最后一个值都需要坐数据校验 
                if (data.description == null) {
                    this.$set(data, "_descriptionError", {
                        error: true,
                        message: "不能为null或者undefined"
                    })
                }else if (data.description.trim() === "" || data.description.match(/(^\s+)|(\s+$)/)) { //非空校验
                    this.$set(data, "_descriptionError", {
                        error: true,
                        message: "不能存在空白字符串"
                    })
                } else {
                    this.$set(data, "_descriptionError", {
                        error: false
                    })
                }                
            } 
        },
        //=====================================file操作====================================//
        handleSelectFile(e, data) {
            const file = e.target.files[0];
            if (file) {
                file.arrayBuffer().then(res => {
                    this.$set(data, "_value", res)
                    data.value = file.type;
                    // console.log(222, res, data)
                })
            } else {
                data.value = ""
            }
            console.log(file)
        },
        //=====================================其他操作====================================//
        //选中所有数据
        selectAll() {
            return new Promise((resolve, reject) => {
                try {
                    setTimeout(() => {
                        this.$refs["tree"]?.setCheckedNodes(this.treeData);
                        resolve();
                    })             
                } catch (error) {
                    reject(error)
                }
            })
        },  
        //选中已经checked
        selectChecked(){
            return new Promise((resolve, reject) => {
                try {
                    setTimeout(() => {
                        const keys = [];
                        dfsForest(this.treeData, {
                            rCondition(value) {
                                return value.children;
                            },
                            rKey: "children",
                            hooks: (data) => {
                                if (data._select) {
                                    keys.push(data.id);
                                }
                            }
                        });
                        this.$refs["tree"]?.setCheckedKeys(keys);
                        resolve();
                    })                    
                } catch (error) {
                    reject(error)
                }
            })
        },
       
        //判断是否允许拖拽
        handleCheckNodeCouldDrop(draggingNode, dropNode, type) {
            if (!this.nest) {
                return type !== "inner";
            } else {
                return true;
            }
        },
        //处理nodedrop
        handleNodeDrop({ data }, dropNode, type) {
            if (type === "inner") {
                dropNode.data.type = "object";
                dropNode.data.value = "";
            }
            this.$refs["tree"]?.setChecked(data.id, true);
        },
        //是否勾选请求参数
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
            const checkedNodes = this.$refs["tree"]?.getCheckedNodes();
            const halfCheckedNodes = this.$refs["tree"]?.getHalfCheckedNodes();
            checkedNodes.forEach(val => {
                this.$set(val, "_select", true)
            })
            halfCheckedNodes.forEach(val => {
                this.$set(val, "_select", true)
            })
        },
        //改变变量信息
        convertVariable(val) {
            if (val == null) {
                return;
            }
            const matchedData = val.toString().match(/{{\s*(\w+)\s*}}/);
            if (val && matchedData) {
                const varInfo = this.variables.find(v => {
                    return v.name === matchedData[1];
                });
                if (varInfo) {
                    return val.replace(/{{\s*(\w+)\s*}}/, varInfo.value);
                } else {
                    return val;
                }
            } else {
                return val;
            }
        },
        //获取参数类型
        getType(value) {
            if (typeof value === "string") {
                return "string"
            } else if (typeof value === "number") { //NaN
                return "number"
            } else if (typeof value === "boolean") {
                return "boolean"
            } else if (Array.isArray(value)) {
                return "array"
            } else if (typeof value === "object" && value !== null) {
                return "object"
            } else { // null undefined ...
                return "string"
            }
        }
    }
};
</script>



<style lang="scss">
.params-tree {
    overflow-y: auto;
    .el-tree-node__content {
        height: size(60);
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
</style>
