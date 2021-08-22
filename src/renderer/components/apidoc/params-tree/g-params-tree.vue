/*
    创建者：shuxiaokai
    创建时间：2021-08-20 21:57
    模块名称：参数录入树形组件
    备注：
*/
<template>
    <el-tree
        ref="tree"
        :data="data"
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
                <!-- 新增嵌套数据按钮 -->
                <el-button
                    v-if="!disableAdd"
                    type="text"
                    :title="addNestTip"
                    icon="el-icon-plus"
                    :disabled="!nest"
                    @click="addNestTreeData(scope.data)"
                >
                </el-button>
                <!-- 删除一行数据按钮 -->
                <el-button
                    v-if="!disableDelete"
                    class="mr-2"
                    :disabled="!scope.node.nextSibling && scope.node.level === 1"
                    :title="`${(!scope.node.nextSibling && scope.node.level === 1) ? '此项不允许删除' : '删除当前行'}`"
                    type="text"
                    icon="el-icon-close"
                    @click="deleteTreeData(scope)"
                >
                    {{ scope.node.level }}
                </el-button>
            </div>
        </template>
    </el-tree>
</template>

<script lang="ts" setup>
import { ref, Ref, PropType, defineProps, computed } from "vue"
import type { TreeNodeOptions } from "element-plus/packages/tree/src/tree.type"
import type { ApidocProperty } from "@@/global"
import { apidocGenerateProperty } from "@/helper/index"
import { store } from "@/store"

type TreeNode = {
    level: number,
    data: ApidocProperty,
    parent: TreeNode
}
const props = defineProps({
    /**
     * 参数数据
     */
    data: {
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
});

/*
|--------------------------------------------------------------------------
| 基础变量
|--------------------------------------------------------------------------
|
*/
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
/*
|--------------------------------------------------------------------------
| 数据增删改查
|--------------------------------------------------------------------------
|
*/
//新增按钮title提示信息
const addNestTip = computed(() => {
    if (!props.nest) {
        return "参数不允许嵌套，例如：当请求方式为get时，请求参数只能为扁平数据";
    }
    return "添加一条嵌套数据";
})
//新增嵌套数据
const addNestTreeData = (data: ApidocProperty) => {
    const params = apidocGenerateProperty();
    store.commit("apidoc/apidoc/addNestParams", {
        data,
        params,
    });
    setTimeout(() => { //hack，添加一个数据默认选中当前数据
        tree.value?.setChecked(params._id, true, true);
        defaultExpandedKeys.value.push(params._id);
    })
}
//删除一条数据
const deleteTreeData = (node: TreeNode) => {
    console.log(node)
    // const parentNode = node.parent;
    // const parentData = node.parent.data;
    // if (parentNode.level === 0) { //根节点直接删除，非根节点在children里删除
    //     const deleteIndex = parentData.findIndex((val) => val._id === data._id);
    //     if (parentData.length - 1 === deleteIndex) { //不允许删除最后一个元素
    //         return;
    //     }
    //     parentData.splice(deleteIndex, 1);
    // } else {
    //     const deleteIndex = parentData.children.findIndex((val) => val._id === data._id);
    //     parentData.children.splice(deleteIndex, 1)
    // }
};

const handleCheckChange = (data: ApidocProperty, select: boolean) => {
    console.log(2, data, select)
}
</script>

<style lang="scss">

</style>
