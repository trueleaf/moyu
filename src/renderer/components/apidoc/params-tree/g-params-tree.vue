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
            node-key="_id"
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
                    <el-button
                        v-if="!disableAdd"
                        type="text"
                        :title="addNestTip"
                        icon="el-icon-plus"
                        :disabled="scope.data.readOnly || !nest"
                        @click="addNestTreeData(scope.data)"
                    >
                    </el-button>
                    <!-- 删除一行数据按钮 -->
                    <el-button
                        v-if="!disableDelete"
                        class="mr-2"
                        :disabled="scope.data._readOnly || (!scope.node.nextSibling && scope.node.level === 1)"
                        :title="`${(!scope.node.nextSibling && scope.node.level === 1) ? '此项不允许删除' : '删除当前行'}`"
                        type="text"
                        icon="el-icon-close"
                        @click="deleteTreeData(scope)"
                    >
                    </el-button>
                    <!-- 参数key值输入框 -->
                    <div class="w-20 mr-2 d-flex a-center">
                        <s-v-input
                            v-if="!readonlyKey"
                            v-model="scope.data.key"
                            size="mini"
                            :error="scope.data._keyError"
                            :disabled="checkInputDisable(scope)"
                            :title="convertPlaceholder(scope)"
                            :placeholder="convertPlaceholder(scope)"
                            :mind-params="mindParams"
                            remote
                            @mindParamsSelect="(val) => { covertMindParamsToRealParasm(scope.data, val) }"
                            @input="addNewLine(scope)"
                            @focus="enableDrag = false"
                            @blur="handleCheckKeyField(scope);enableDrag=true"
                        >
                        </s-v-input>
                        <div v-else class="readonly-key" @mouseover="() => enableDrag = false" @mouseout="() => enableDrag = true">{{ scope.data.key }}</div>
                    </div>
                    <!-- 请求参数类型 -->
                    <el-select v-model="scope.data.type" :disabled="scope.data._readOnly || (!nest && !enableFormData)" :title="disableTypeTip" placeholder="类型" size="mini" class="mr-2" @change="handleChangeParamsType(scope)">
                        <el-option :disabled="scope.data.children && scope.data.children.length > 0" label="String" value="string"></el-option>
                        <el-option :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Number" value="number"></el-option>
                        <el-option :disabled="!nest || (scope.data.children && scope.data.children.length > 0)" label="Boolean" value="boolean"></el-option>
                        <el-option :disabled="!nest" label="Object" value="object"></el-option>
                        <el-option :disabled="!nest" label="List | Array" value="array"></el-option>
                        <el-option :disabled="!enableFormData" title="传输数据类型为formData才能使用file类型" label="file" value="file"></el-option>
                    </el-select>
                    <!-- 参数值 -->
                    <!-- <s-v-input
                        v-if="scope.data.type !== 'boolean' && scope.data.type !== 'file'"
                        v-model="scope.data.value"
                        :disabled="scope.data._readOnly || scope.data.type === 'array' || scope.data.type === 'object'"
                        title="对象和数组不必填写参数值"
                        size="mini"
                        :error="scope.data._valueError"
                        class="w-25 mr-2"
                        :placeholder="`${scope.data._valuePlaceholder || '参数值'}`"
                        @focus="enableDrag = false"
                        @blur="enableDrag=true"
                    >
                    </s-v-input> -->
                    <el-popover
                        v-if="scope.data.type !== 'boolean' && scope.data.type !== 'file'"
                        v-model="scope.data._visible"
                        placement="top-start"
                        trigger="manual"
                        class="w-25 mr-2"
                    >
                        <s-mock
                            v-if="scope.data._visible"
                            :search-value="scope.data.value"
                            @mouseenter.native="handleMouseenterValue(scope.data)"
                            @mouseleave.native="handleMouseleaveValue(scope.data)"
                            @select="(item) => handleSelectMockValue(item, scope.data)"
                        >
                        </s-mock>
                        <el-input
                            slot="reference"
                            v-model="scope.data.value"
                            :disabled="scope.data._readOnly || scope.data.type === 'object'"
                            title="对象和数组不必填写参数值"
                            size="mini"
                            class="w-100"
                            :placeholder="getValuePlaceholder(scope.data)"
                            @input="handleInputValue(scope.data)"
                            @focus="handleFocusValue(scope.data)"
                            @blur="handleBlurValue(scope.data)"
                        >
                        </el-input>
                    </el-popover>
                    <div v-if="scope.data.type === 'file'" class="flex0 w-20">
                        <div class="fake-input" :class="{active: scope.data._name}" @mouseenter="() => enableDrag = false" @mouseleave="() => enableDrag = true">
                            <label v-show="!scope.data._name" for="fileInput" class="label">选择文件</label>
                            <el-popover v-show="scope.data._name" placement="top-start" trigger="hover" :content="scope.data._path" :open-delay="200">
                                <s-ellipsis-content slot="reference" :value="scope.data._name" max-width="100%"></s-ellipsis-content>
                            </el-popover>
                            <span v-if="scope.data._name" class="close el-icon-close" @click="handleClearSelectType(scope)"></span>
                        </div>
                        <input id="fileInput" class="d-none" type="file" @change="handleSelectFile($event, scope.data)">
                    </div>
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
                        @blur="handleCheckDescription(scope);enableDrag=true"
                    >
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
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数

export default {
    mixins: [mixin],
    props: {
        mindParams: { //联想参数
            type: Array,
            default() {
                return [];
            },
        },
        treeData: { //树形数据
            type: Array,
            default() {
                return []
            },
        },
        showCheckbox: { //是否展示checkbox, eg: 请求参数可以进行选择
            type: Boolean,
            default: false,
        },
        nest: { //是否允许参数嵌套，eg：当请求方式为get时，请求参数只能为扁平数据
            type: Boolean,
            default: false,
        },
        enableFormData: { //是否允许formData
            type: Boolean,
            default: false,
        },
        readonlyKey: { //key只读
            type: Boolean,
            default: false,
        },
        disableAdd: { //禁止新增
            type: Boolean,
            default: false,
        },
        disableDelete: { //禁止删除
            type: Boolean,
            default: false,
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
            }
            return "添加一条嵌套数据";
        },
        disableTypeTip() {
            if (!this.nest) {
                return "参数类型不允许改变，eg：当请求方式为get时，请求参数类型只能为string"
            }
            return "";
        },
        variables() { //全局变量
            return this.$store.state.apidoc.variables || [];
        },
    },
    watch: {
        treeData: {
            handler(val) {
                const set = new Set();
                this.defaultExpandedKeys?.forEach((key) => set.add(key));
                val[0]?.children?.forEach((params) => set.add(params._id));
                this.defaultExpandedKeys = Array.from(set)
                // Array.from(set).forEach((key) => this.defaultExpandedKeys.push(key))
            },
            deep: true,
            immediate: true,
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
                this.$refs.tree?.setChecked(params._id, true);
                this.defaultExpandedKeys.push(params._id);
            })
            data.value = "";
            this.$set(data, "_valueError", {
                error: false,
            });
            this.$set(data, "_valuePlaceholder", "对象和数组不必填写参数值");
            if (data.type !== "object" && data.type !== "array") {
                data.type = "object"
            }
        },
        //删除一条数据
        deleteTreeData({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            if (parentNode.level === 0) { //根节点直接删除，非根节点在children里删除
                const deleteIndex = parentData.findIndex((val) => val._id === data._id);
                if (parentData.length - 1 === deleteIndex) { //不允许删除最后一个元素
                    return;
                }
                parentData.splice(deleteIndex, 1);
            } else {
                const deleteIndex = parentData.children.findIndex((val) => val._id === data._id);
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
                error: false,
            })
            this.$set(data, "_descriptionError", {
                error: false,
            })
            data.key = val.key;
            data.type = val.type;
            data.value = val.value;
            data.required = val.required;
            data.description = val.description;
            if (val.children && val.children.length > 0) {
                data.children = val.children;
                this.defaultExpandedKeys.push(data._id);
            }
            // Object.assign(data, val);
        },
        //新增一行
        addNewLine({ node, data }) {
            if (node.level === 1 && this.nest) {
                return;
            }
            if (data.key && data.key.trim() !== "") {
                const parentNode = node.parent;
                const parentData = node.parent.data;
                if (parentNode.level === 0) { //根节点直接往数据里面push，非根节点往children里push
                    if (parentData[parentData.length - 1].key && parentData[parentData.length - 1].key.trim() !== "") {
                        parentData.push(this.generateProperty());
                    }
                } else if (parentData.children[parentData.children.length - 1].key && parentData.children[parentData.children.length - 1].key.trim() !== "") {
                    parentData.children.push(this.generateProperty());
                }
                this.$refs.tree?.setChecked(data._id, true);
            }
        },
        //校验key值是否满足规范
        handleCheckKeyField({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            const nodeIndex = (parentNode.level === 0) ? parentData.findIndex((val) => val._id === data._id) : parentData.children.findIndex((val) => val._id === data._id);
            if (parentNode.level === 0 && parentData.length === 1) { //根元素第一个可以不必校验因为参数可以不必填
                return;
            }
            if (nodeIndex !== parentData.length - 1) { //只要不是最后一个值都需要做数据校验
                if (data.key.trim() === "" || data.key.match(/(^\s+)|(\s+$)/)) { //非空校验
                    this.$set(data, "_keyError", {
                        error: true,
                        message: "不能存在空白字符串",
                    })
                } else {
                    this.$set(data, "_keyError", {
                        error: false,
                    })
                }
            }
        },
        //检查输入框是否disable
        checkInputDisable(scope) {
            const isComplex = scope.node.data.type === "object" || scope.node.data.type === "array"
            const isReadOnly = scope.data._readOnly;
            const parentIsArray = scope.node.parent.data.type === "array";
            const isRootObject = this.nest && scope.node.level === 1 && isComplex;
            return isReadOnly || parentIsArray || isRootObject;
        },
        //转换placeholder
        convertPlaceholder({ node }) {
            const isComplex = node.data.type === "array" || node.data.type === "object";
            if (node.level === 1 && isComplex) {
                return "根元素";
            }
            if (node.parent.data.type === "array") {
                return "父元素为数组不必填写参数名称";
            }
            return "参数名称"
        },
        //=====================================type操作====================================//
        //改变请求参数类型
        handleChangeParamsType({ data }) {
            if (data.type === "boolean") {
                data.value = "true";
            }
            if (data.type === "file") {
                data.value = "";
            }
            if (data.type === "number") {
                const couldConvertToNumber = !Number.isNaN(Number(data.value));
                if (!couldConvertToNumber) {
                    data.value = "0"
                }
            }
            if (data.type === "object" || data.type === "array") {
                if (data.type === "array" && data.children && data.children.length > 0) { //清空子元素所有参数名称
                    this.$helper.dfsForest(data.children, {
                        rCondition(value) {
                            return value.children;
                        },
                        rKey: "children",
                        hooks: (_data) => {
                            _data.key = "";
                            this.$set(_data, "_keyError", {
                                error: false,
                            }); //清除子元素key值校验
                        },
                    });
                }
                data.value = "";
                // data.children.splice(0, 1, this.generateProperty())
                this.defaultExpandedKeys.push(data._id);
                this.$set(data, "_valueError", {
                    error: false,
                });
                this.$set(data, "_valuePlaceholder", "对象和数组不必填写参数值");
            } else {
                this.$set(data, "_valuePlaceholder", "");
            }
        },
        //=====================================value操作====================================//
        //处理输入事件
        handleInputValue(row) {
            if (row.value.startsWith("@")) {
                this.$set(row, "_visible", true);
            } else {
                this.$set(row, "_visible", false);
            }
        },
        //focus事件
        handleFocusValue(row) {
            this.enableDrag = false;
            if (row.value.startsWith("@")) {
                this.$set(row, "_visible", true);
            }
            this.$set(row, "_mockFocus", true);
        },
        //处理blur事件
        handleBlurValue(row) {
            this.enableDrag = true;
            if (!row._mockEnter) {
                row._visible = false;
            }
            this.$set(row, "_mockFocus", false);
        },
        //处理mock弹窗enter效果
        handleMouseenterValue(row) {
            this.$set(row, "_mockEnter", true);
        },
        //处理mock弹窗leave效果
        handleMouseleaveValue(row) {
            if (!row._mockFocus) {
                this.$set(row, "_visible", false);
            }
            this.$set(row, "_mockEnter", false);
        },
        //选择mock值
        handleSelectMockValue(item, row) {
            this.$set(row, "_visible", false);
            row.value = `@${item.value}`;
        },
        //value placeholder处理
        getValuePlaceholder(data) {
            if (data.type === "object") {
                return "对象类型不必填写"
            }
            if (data.type === "array") {
                return "填写数字代表mock数据条数"
            }
            return "参数值"
        },
        //=====================================参数描述====================================//
        handleCheckDescription({ node, data }) {
            const parentNode = node.parent;
            const parentData = node.parent.data;
            const nodeIndex = (parentNode.level === 0) ? parentData.findIndex((val) => val._id === data._id) : parentData.children.findIndex((val) => val._id === data._id);
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
                        message: "不能为null或者undefined",
                    })
                } else if (data.description.trim() === "" || data.description.match(/(^\s+)|(\s+$)/)) { //非空校验
                    this.$set(data, "_descriptionError", {
                        error: true,
                        message: "不能存在空白字符串",
                    })
                } else {
                    this.$set(data, "_descriptionError", {
                        error: false,
                    })
                }
            }
        },
        //=====================================file操作====================================//
        //选中文件
        handleSelectFile(e, data) {
            const file = e.target.files[0];
            if (file) {
                file.arrayBuffer().then((res) => {
                    this.$set(data, "_value", res)
                })
                this.$set(data, "_name", file.name)
                this.$set(data, "_path", file.path)
                data.value = file.type;
            } else {
                data.value = ""
            }
        },
        //清空选中的文件
        handleClearSelectType(scope) {
            console.log("clear")
            this.$set(scope.data, "_name", "");
            this.$set(scope.data, "_path", "");
            this.$set(scope.data, "_value", "");
            this.$set(scope.data, "value", "");
        },
        //=====================================其他操作====================================//
        //选中所有数据
        selectAll() {
            return new Promise((resolve, reject) => {
                try {
                    setTimeout(() => {
                        this.$refs.tree?.setCheckedNodes(this.treeData);
                        resolve();
                    });
                } catch (error) {
                    reject(error)
                }
            })
        },
        //选中已经checked
        selectChecked() {
            return new Promise((resolve, reject) => {
                try {
                    setTimeout(() => {
                        const keys = [];
                        this.$helper.dfsForest(this.treeData, {
                            rCondition(value) {
                                return value.children;
                            },
                            rKey: "children",
                            hooks: (data) => {
                                if (data._select) {
                                    keys.push(data._id);
                                }
                            },
                        });
                        this.$refs.tree?.setCheckedKeys(keys);
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
            }
            if (this.nest && dropNode.parent.level === 0) { //只允许有一个根元素
                return false;
            }
            return true;
        },
        //处理nodedrop
        handleNodeDrop({ data }, dropNode, type) {
            if (type === "inner") {
                dropNode.data.type = "object";
                dropNode.data.value = "";
            }
            this.$refs.tree?.setChecked(data._id, true);
        },
        //是否勾选请求参数
        handleCheckChange(data, select) {
            this.$set(data, "_select", select);
            const checkedNodes = this.$refs.tree?.getCheckedNodes();
            const halfCheckedNodes = this.$refs.tree?.getHalfCheckedNodes();
            checkedNodes.forEach((val) => {
                this.$set(val, "_select", true)
            })
            halfCheckedNodes.forEach((val) => {
                this.$set(val, "_select", true)
            })
        },
        //改变变量信息
        convertVariable(val) {
            if (val == null) {
                return null;
            }
            const matchedData = val.toString().match(/{{\s*(\w+)\s*}}/);
            if (val && matchedData) {
                const varInfo = this.variables.find((v) => v.name === matchedData[1]);
                if (varInfo) {
                    return val.replace(/{{\s*(\w+)\s*}}/, varInfo.value);
                }
                return val;
            }
            return val;
        },
        //获取参数类型
        getType(value) {
            let result = "string";
            if (typeof value === "string") {
                result = "string"
            } else if (typeof value === "number") { //NaN
                result = "number"
            } else if (typeof value === "boolean") {
                result = "boolean"
            } else if (Array.isArray(value)) {
                result = "array"
            } else if (typeof value === "object" && value !== null) {
                result = "object"
            } else { // null undefined ...
                result = "string"
            }
            return result;
        },
    },
};
</script>

<style lang="scss">
.params-tree {
    overflow-y: auto;
    .fake-input {
        cursor: pointer;
        background: $gray-300;
        height: size(25);
        line-height: size(25);
        text-indent: 1em;
        width: 80%;
        position: relative;
        &.active {
            background: none;
            border: 1px solid $gray-300;
            cursor: auto;
        }
        .label {
            width: 100%;
            height: 100%;
            display: inline-block;
            cursor: pointer;
        }
        .close {
            position: absolute;
            right: size(3);
            top: size(4);
            font-size: fz(16);
            cursor: pointer;
            &:hover {
                color: $red;
            }
        }
    }
    .readonly-key {
        height: size(25);
        width: 100%;
        display: flex;
        align-items: center;
        border-bottom: 1px solid $gray-300;
        cursor: text;
        text-indent: 1em;
    }
    .collapse-transition {
        transition: none;
    }
    .el-tree-node__content {
        height: size(60);
    }
    .el-input__inner {
        border-radius: 0;
        border: none;
        border-bottom: 1px solid $gray-400;
        &:focus {
            border-bottom: 1px solid $theme-color;
        }
    }
    .el-input.is-disabled .el-input__inner {
        border-bottom: 1px solid $gray-400;
    }
    .el-tree-node:focus>.el-tree-node__content {
        background: none;
    }
    .custom-tree-node {
        width: 100%;
        display: flex;
        align-items: center;
    }
}
</style>
