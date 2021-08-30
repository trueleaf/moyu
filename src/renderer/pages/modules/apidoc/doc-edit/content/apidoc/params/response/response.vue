/*
    创建者：shuxiaokai
    创建时间：2021-08-30 21:39
    模块名称：返回参数
    备注：
*/
<template>
    <div class="response-params">
        <s-collapse-card v-for="(item, index) in responseData" :key="index" :fold="index !== 0">
            <template #head>
                <div class="h-100 d-flex a-center">
                    <div class="">
                        <span v-if="!currentEditNode" class="edit-title">名称：{{ item.title }}</span>
                        <input
                            v-if="currentEditNode && currentEditNode.title === item.title"
                            :ref="bindRef"
                            v-model="currentEditNode._title"
                            class="edit-input"
                            :class="{error: currentEditNode._title.length === 0}"
                            type="text"
                            placeholder="不能为空"
                            @click.stop="() => {}"
                            @keydown.enter="handleConfirmTitle(item, index)"
                        >
                    </div>
                    <el-divider v-if="!currentEditNode" direction="vertical"></el-divider>
                    <div>
                        <span v-if="!currentEditNode">状态码：{{ item.statusCode }}</span>                        
                    </div>
                    <el-divider v-if="!currentEditNode" direction="vertical"></el-divider>
                    <div>
                        <span v-if="!currentEditNode">返回格式：{{ item.value.dataType }}</span>
                    </div>

                    <span v-if="currentEditNode && currentEditNode.title === item.title" class="ml-1 cursor-pointer theme-color" @click.stop="handleConfirmTitle(item, index)">确定</span>
                    <span v-if="currentEditNode && currentEditNode.title === item.title" class="ml-1 cursor-pointer theme-color" @click.stop="handleCancelEdit">取消</span>
                    <span v-if="!currentEditNode" title="修改名称" class="edit-icon el-icon-edit" @click.stop="handleChangeEditNode(item, index)"></span>
                </div>
            </template>
            <template #tail>
                <div class="d-flex">
                    <div v-if="index === 0" class="green cursor-pointer" @click="handleAddResponse">新增</div>
                    <div v-if="index !== 0" class="red cursor-pointer" @click="handleDeleteResponse(index)">删除</div>
                </div>
            </template>
        </s-collapse-card>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, Ref } from "vue"
import { store } from "@/store/index"
import { ApidocResponseParams } from "@@/global"


/*
|--------------------------------------------------------------------------
| 编辑操作
|--------------------------------------------------------------------------
|
*/
//当前编辑的节点
const currentEditNode: Ref<null | { title: string, _title: string }> = ref(null);
const inputRefs: unknown[] = [];
//ref绑定
const bindRef = (el: unknown) => {
    if (el) {
        inputRefs.push(el);
    }
}
//确定修改title
const handleConfirmTitle = (item: ApidocResponseParams, index: number) => {
    if (currentEditNode.value && currentEditNode.value._title) {
        store.commit("apidoc/apidoc/changeResponseParamsTitleByIndex", {
            index,
            title: currentEditNode.value._title,
        });
        currentEditNode.value = null;
    }
}
//取消编辑
const handleCancelEdit = () => {
    currentEditNode.value = null;
}
//改变当前编辑的节点
const handleChangeEditNode = (item: ApidocResponseParams, index: number) => {
    const value = {
        title: item.title,
        _title: item.title,
    };
    currentEditNode.value = value;
    setTimeout(() => {
        if (inputRefs[index]) {
            (inputRefs[index] as HTMLInputElement).focus();
        }
    })
}


//新增一个response
const handleAddResponse = () => {
    console.log(2)
}
//删除一个response
const handleDeleteResponse = (index: number) => {
    console.log(3, index)
}
//response参数值
const responseData = computed(() => {
    return store.state["apidoc/apidoc"].apidoc.item.responseParams;
}) 
</script>

<style lang="scss">
.response-params {
    .edit-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        cursor: pointer;
        width: size(40);
        margin-top: size(2);
        &:hover {
            color: $theme-color;
        }
    }
    .edit-input {
        border: 1px solid $gray-600;
        font-size: fz(14);
        height: size(20);
        line-height: size(20);
        &.error {
            border: 1px solid $red;
        }
    }
}
</style>
