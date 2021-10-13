/*
    创建者：shuxiaokai
    创建时间：2021-10-11 22:26
    模块名称：在线链接
    备注：
*/
<template>
    <div class="online-link">
        <div class="w-70 m-auto">
            <s-fieldset>
                <template #title>
                    <span>在线链接</span>
                    <span class="orange f-sm ml-2 text-normal cursor-pointer" @click="dialogVisible = true">
                        <i class="el-icon-circle-plus-outline"></i>
                        <span>生成链接</span>
                    </span>
                </template>
                <s-table ref="table" url="/api/project/export/online_list" :params="{ projectId }" plain>
                    <el-table-column prop="shareName" label="链接名称" align="center"></el-table-column>
                    <el-table-column prop="projectName" label="项目名称" align="center"></el-table-column>
                    <el-table-column label="过期截至" align="center">
                        <template #default="scope">
                            <span v-countdown="scope.row.expire"></span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center">
                        <template #default="scope">
                            <el-button v-copy="generateUrlAndPassword(scope.row)" type="text" size="mini">复制</el-button>
                            <el-button type="text" size="mini" @click="handleOpenEditDialog(scope.row)">修改</el-button>
                            <el-button type="text" size="mini" @click="handleDeleteItem(scope.row.projectId, scope.row._id)">删除</el-button>
                        </template>
                    </el-table-column>
                </s-table>
            </s-fieldset>
        </div>
        <s-add-dialog v-if="dialogVisible" v-model="dialogVisible" @success="handleAddSuccess"></s-add-dialog>
        <s-edit-dialog v-if="dialogVisible2 && editData" v-model="dialogVisible2" :data="editData" @success="handleEditSuccess"></s-edit-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref } from "vue"
import { ElMessageBox } from "element-plus"
import sAddDialog from "./dialog/add.vue"
import sEditDialog from "./dialog/edit.vue"
import { axios } from "@/api/api"
import config from "@/../config/config"
import { router } from "@/router"

type LinkInfo = {
    expire: number,
    projectId: string,
    shareName: string,
    password: string,
    projectName: string,
    selectedDocs: string[],
    _id: string,
}
const projectId = router.currentRoute.value.query.id as string; //项目id
const table: Ref<{ getData: () => void } | null> = ref(null); //table实例
const editData: Ref<LinkInfo | null> = ref(null);
const dialogVisible = ref(false); //是否显示弹窗
const dialogVisible2 = ref(false); //编辑弹窗

//生成链接和密码
const generateUrlAndPassword = (linkInfo: LinkInfo) => {
    const url = `${config.renderConfig.share.baseUrl}/#/?shareId=${linkInfo._id}&shareName=${linkInfo.shareName}&expire=${linkInfo.expire}`;
    return `
    链接：${url}   
    密码：${linkInfo.password || "不需要密码"}
    `
}
//删除某个链接
const handleDeleteItem = (projectId: string, _id: string) => {
    ElMessageBox.confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
    }).then(() => {
        const params = {
            projectId,
            _id,
        };
        axios.delete("/api/project/export/online", { data: params }).then(() => {
            table.value?.getData();
        }).catch((err) => {
            console.error(err);
        });
    }).catch((err) => {
        if (err === "cancel" || err === "close") {
            return;
        }
        console.error(err);
    });
}
//打开生成链接弹窗
const handleOpenEditDialog = (row: LinkInfo) => {
    editData.value = row;
    dialogVisible2.value = true;
}
//添加成功刷新页面
const handleAddSuccess = () => {
    table.value?.getData();
}
//编辑成功刷新页面
const handleEditSuccess = () => {
    table.value?.getData();
}


</script>

<style lang="scss">
.online-link {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    width: 100%;
}
</style>
