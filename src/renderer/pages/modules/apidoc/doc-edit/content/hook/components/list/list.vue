/*
    创建者：shuxiaokai
    创建时间：2022-02-02 10:49
    模块名称：脚本列表
    备注：
*/
<template>
    <div>
        <!-- 表格展示 -->
        <s-table
            ref="table"
            url="/api/apidoc/project/code"
            :params="{ projectId }"
            :delete-params="{ projectId }"
            delete-many
            delete-url="/api/apidoc/project/code"
            delete-key="ids"
            @deleteMany="getTableData"
        >
            <el-table-column prop="codeName" label="名称" align="center"></el-table-column>
            <el-table-column prop="creator" label="创建者" align="center"></el-table-column>
            <el-table-column prop="remark" label="备注" align="center"></el-table-column>
            <el-table-column label="操作" align="center">
                <template #default="scope">
                    <el-button link type="primary" text @click="handleJumpToEdit(scope.row)">修改</el-button>
                    <el-button link type="primary" text @click="handleViewCode(scope.row)">查看</el-button>
                    <el-button link type="primary" text @click="handleDeleteCode(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </s-table>
        <s-dialog v-model="dialogVisible" width="40%" title="代码预览" @close="handleClose">
            <pre>{{ code }}</pre>
        </s-dialog>
    </div>
</template>

<script lang="ts" setup>
import { ref, Ref } from "vue"
import { ElMessageBox } from "element-plus";
import { router } from "@/router";
import type { ApidocCodeInfo } from "@@/global"
import { event } from "@/helper";
import { $t } from "@/i18n/i18n"
import { axios } from "@/api/api";

const projectId = ref(router.currentRoute.value.query.id as string); //项目id
const table: Ref<{ getData: () => void } | null> = ref(null); //table实例
const dialogVisible = ref(false); //是否展示代码弹窗
const code = ref("");
const getTableData = () => {
    table.value?.getData();
}
//修改源码
const handleJumpToEdit = (row: ApidocCodeInfo) => {
    event.emit("apidoc/hook/jumpToEdit", row)
}
//查看代码
const handleViewCode = (row: ApidocCodeInfo) => {
    code.value = row.code
    dialogVisible.value = true;
}
//删除代码
const handleDeleteCode = (row: ApidocCodeInfo) => {
    ElMessageBox.confirm($t("此操作将永久删除此条记录, 是否继续?"), $t("提示"), {
        confirmButtonText: $t("确定"),
        cancelButtonText: $t("取消"),
        type: "warning"
    }).then(() => {
        const params = {
            projectId: projectId.value,
            ids: [row._id],
        };
        axios.delete("/api/apidoc/project/code", { data: params }).then(() => {
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
//关闭预览弹窗
const handleClose = () => {
    dialogVisible.value = false;
}

</script>

<style lang="scss">

</style>
