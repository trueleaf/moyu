/*
    创建者：shuxiaokai
    创建时间：2021-08-02 21:25
    模块名称：保存文档
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" title="保存接口" width="40%" @close="handleClose">
        <el-form ref="form" :model="formInfo" :rules="rules" label-width="100px" class="save-doc">
            <el-form-item label="接口名称" prop="name">
                <el-input v-model="formInfo.name" name="name" placeholder="请输入接口名称" class="w-100" maxlength="100" show-word-limit clearable></el-input>
            </el-form-item>
            <div class="pt-1"></div>
            <s-fieldset title="选择需要挂载的节点">
                <div class="gray-500 f-sm mb-1">若不选择，则会挂载在根节点</div>
                <s-loading :loading="loading2">
                    <el-tree
                        ref="docTree"
                        :data="navTreeData"
                        node-key="_id"
                        show-checkbox
                        :expand-on-click-node="true"
                        :check-strictly="true"
                        @check="handleCheckChange"
                    >
                        <template #default="scope">
                            <div
                                class="custom-tree-node"
                                tabindex="0"
                            >
                                <!-- 文件夹渲染 -->
                                <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px" />
                                <span :title="scope.data.name" class="node-name text-ellipsis ml-1">{{ scope.data.name }}</span>
                            </div>
                        </template>
                    </el-tree>
                </s-loading>
            </s-fieldset>
        </el-form>
        <template #footer>
            <el-button :loading="loading" :title="!formInfo.name ? '请输入接口名称' : ''" :disabled="!formInfo.name" type="primary" @click="handleSaveDoc">保存</el-button>
            <el-button type="warning" @click="handleClose">取消</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts" setup>
import { ref, Ref, onMounted, nextTick } from "vue"
import { ApidocDetail } from "@@/global";
import { TreeNodeOptions } from "element-plus/es/components/tree/src/tree.type";
import { router } from "@/router";
import { axios } from "@/api/api"
import { store } from "@/store";
import { event } from "@/helper";

type FormInfo = {
    name: string, //接口名称
    pid: string, //需要挂载的目录
}

defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
})
const emit = defineEmits(["update:modelValue", "success"]);
const formInfo: Ref<FormInfo> = ref({
    name: "",
    pid: ""
})
const rules = ref({
    name: [{ required: true, message: "接口名称必填", trigger: "blur" }],
});
/*
|--------------------------------------------------------------------------
| 挂载树
|--------------------------------------------------------------------------
*/
const projectId = router.currentRoute.value.query.id as string;
const loading = ref(false); //保存按钮loading状态
const loading2 = ref(false);
const navTreeData = ref([]);
//目标树
const docTree: Ref<TreeNodeOptions["store"] | null> = ref(null);
const currentMountedNode: Ref<ApidocDetail | null> = ref(null);
//节点选中状态改变时候
const handleCheckChange = (data: ApidocDetail, { checkedKeys } : { checkedKeys: ApidocDetail[] }) => {
    docTree.value?.setCheckedKeys([]);
    if (checkedKeys.length > 0) {
        docTree.value?.setCheckedKeys([data._id]);
    }
    currentMountedNode.value = data;
}
onMounted(() => {
    loading2.value = true;
    const params = {
        projectId,
    };
    axios.get("/api/project/doc_tree_folder_node", { params }).then((res) => {
        navTreeData.value = res.data;
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading2.value = false;
    });
})
const handleClose = () => {
    emit("update:modelValue", false)
    event.emit("tabs/cancelSaveTab")
}
const handleSaveDoc = () => {
    const docInfo = JSON.parse(JSON.stringify(store.state["apidoc/apidoc"].apidoc))
    docInfo.info.name = formInfo.value.name;
    docInfo.info.creator = store.state.permission.userInfo.realName
    docInfo.pid = currentMountedNode.value?._id;
    docInfo.projectId = projectId;
    docInfo.sort = Date.now();
    const params = {
        docInfo
    }
    loading.value = true;
    axios.post("/api/project/save_doc", params).then((res) => {
        store.dispatch("apidoc/banner/getDocBanner", { projectId })
        store.commit("apidoc/apidoc/changeApidocId", res.data);
        store.commit("apidoc/apidoc/changeApidocName", formInfo.value.name);
        store.commit("apidoc/tabs/changeTabInfoById", {
            id: store.state["apidoc/apidoc"].savedDocId,
            field: "label",
            value: formInfo.value.name,
        })
        store.commit("apidoc/tabs/changeTabInfoById", {
            id: store.state["apidoc/apidoc"].savedDocId,
            field: "_id",
            value: res.data,
        })
        nextTick(() => {
            store.commit("apidoc/tabs/changeTabInfoById", {
                id: res.data,
                field: "saved",
                value: true,
            })
            event.emit("tabs/saveTabSuccess")
        })
        emit("update:modelValue", false)
    }).catch((err) => {
        console.error(err);
        event.emit("tabs/saveTabError")
    }).finally(() => {
        loading.value = false;
    });
}
</script>

<style lang="scss">
.save-doc {
    max-height: 70vh;
    margin: 0 auto;
    .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        overflow: hidden;
        height: size(30);
        &:hover {
            .more {
                display: block;
            }
        }
        &>img {
            width: size(16);
            height: size(16);
        }
        .file-icon {
            font-size: fz(14);
            margin-right: size(5);
        }
        .folder-icon {
            color: $yellow;
            flex: 0 0 auto;
            width: size(16);
            height: size(16);
            margin-right: size(5);
        }
        .node-label-wrap {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: hidden;
            .node-top {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .node-bottom {
                color: $gray-500;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
    .el-tree-node__content {
        height: size(30);
        display: flex;
        align-items: center;
    }
    .el-tree-node__content>.el-tree-node__expand-icon {
        transition: none; //去除所有动画
        padding-top: 0;
        padding-bottom: 0;
        margin-top: -1px;
    }
}
</style>
