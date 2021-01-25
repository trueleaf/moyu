/*
    创建者：shuxiaokai
    创建时间：2020-09-25 13:08"
    模块名称：将返回值转换为element表单
    备注：xxxx
*/
<template>
    <s-dialog title="返回参数转换" :isShow="visible" @close="handleClose">
        <el-tree 
                ref="tree"
                :data="codeData" 
                :indent="50"
                :highlight-current="true"
                node-key="id" 
                :expand-on-click-node="false" 
                default-expand-all
                :draggable="enableDrag"
                :allow-drop="handleCheckNodeCouldDrop"
                check-strictly
                @node-drop="handleNodeDrop"
                @check-change="handleCheckChange"
                show-checkbox
        >
         <template slot-scope="scope">
            <div class="custom-tree-node">
                {{ scope.data.key || "object" }}                   
            </div>
        </template>
        </el-tree>
        <div slot="footer">
            <el-button v-copy="elTableColumnStr" size="mini" type="primary" @click="handleSubmit">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: { //弹窗是否显示
            type: Boolean,
            default: false
        },
        codeData: {
            type: [Object, Array],
            default() {
                return {};
            }
        },
    },
    data() {
        return {
            enableDrag: true,
            selectData: [],
            elTableColumnStr: ""
        };
    },
    created() {

    },
    methods: {
        //=====================================树形组件操作====================================//
        handleSelectionChange() {

        },
        //判断是否允许拖拽
        handleCheckNodeCouldDrop(draggingNode, dropNode, type) {
            return type !== "inner";
        },
        handleNodeDrop() {

        },
        handleCheckChange() {
            this.selectData = this.$refs.tree.getCheckedNodes();
            this.elTableColumnStr = this.convertToTableCode();
        },
        convertToTableCode() {
            let tableCodeStr = "";
            this.selectData.forEach((data) => {
                tableCodeStr += `<el-table-column prop="${data.key}" label="${data.description}" align="center"></el-table-column>\n`
            })
            return tableCodeStr;
        },
        //=====================================组件间交互====================================//  
        handleSubmit() {
            this.handleClose();
        },
        //=====================================其他操作=====================================//
        handleClose() {
            this.$emit("update:visible", false);
        },
    }
};
</script>



<style lang="scss">

</style>
