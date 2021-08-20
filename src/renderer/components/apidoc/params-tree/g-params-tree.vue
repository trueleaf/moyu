/*
    创建者：shuxiaokai
    创建时间：2021-08-20 21:57
    模块名称：参数录入树形组件
    备注：
*/
<template>
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
        <template #default="scope">
            <div class="custom-tree-node">
                aaa{{ scope.data }}
            </div>
        </template>
    </el-tree>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, PropType } from "vue"
import { TreeNodeOptions } from "element-plus/packages/tree/src/tree.type"
import { ApidocProperty } from "@@/global"
type TreeNode = {
    level: number,
    data: ApidocProperty,
    parent: TreeNode
}

export default defineComponent({
    props: {
        /**
         * 参数数据
         */
        paramsData: {
            type: Array as PropType<ApidocProperty[]>,
            default: () => [],
        },
        /**
         * 是否展示checkbox
         */
        showCheckbox: {
            type: Boolean,
            default: false,
        },
        /**
         * 是否允许添加子参数，eg：当请求方式为GET时，请求参数只能为扁平数据
         */
        nest: {
            type: Boolean,
            default: false,
        },
        /**
         * 字段field是否只读，Path参数字段值不允许修改
         */
        readonlyKey: {
            type: Boolean,
            default: false,
        },
        /**
         * 禁止新增，Path参数字段值不允许新增
         */
        disableAdd: {
            type: Boolean,
            default: false,
        },
        /**
         * 禁止新增，Path参数字段值不允许删除
         */
        disableDelete: { //禁止删除
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const treeData = ref(props.paramsData);
        const defaultExpandedKeys: Ref<string[]> = ref([]);
        const tree: Ref<TreeNodeOptions["store"] | null> = ref(null)
        /*
        |--------------------------------------------------------------------------
        | 拖拽相关处理
        |--------------------------------------------------------------------------
        |
        */
        const enableDrag = ref(true);
        const handleCheckNodeCouldDrop = (draggingNode: TreeNode, dropNode: TreeNode, type: "inner" | "prev") => {
            if (!props.nest) {
                return type !== "inner";
            }
            if (props.nest && dropNode.parent.level === 0) { //只允许有一个根元素
                return false;
            }
            return true;
        }
        const handleNodeDrop = (draggingNode: TreeNode, dropNode: TreeNode, type: "inner" | "prev") => {
            if (type === "inner") {
                dropNode.data.type = "object";
                dropNode.data.value = "";
            }
            // tree.value.setChecked(draggingNode.data._id, true, false);
        }

        const handleCheckChange = (data: ApidocProperty, select: boolean) => {
            console.log(2, data, select)
        }

        return {
            tree,
            treeData,
            enableDrag,
            handleCheckNodeCouldDrop,
            handleNodeDrop,
            handleCheckChange,
            defaultExpandedKeys,
        };
        
    },
})
</script>

<style lang="scss">

</style>
