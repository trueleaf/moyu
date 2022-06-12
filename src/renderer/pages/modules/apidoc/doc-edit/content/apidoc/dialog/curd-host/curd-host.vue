/*
    创建者：shuxiaokai
    创建时间：2021-08-17 21:28
    模块名称：域名、接口前缀
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" width="85%" :title="$t('域名、接口前缀')" @close="handleClose">
        <div class="host-wrap">
            <!-- 左侧新增数据 -->
            <s-resize-x :min="450" :max="700" :width="450" name="curd-host" tabindex="1" class="add-host">
                <s-fieldset :title="$t('什么是接口前缀')">
                    <img :src="require('@/assets/imgs/apidoc/prefix.png')" alt="接口前缀" class="px-2 border-gray-400">
                    <img :src="require('@/assets/imgs/apidoc/prefix.gif')" alt="接口前缀" class="px-2 border-gray-400">
                </s-fieldset>
                <el-form ref="form" :model="formInfo" :rules="rules" label-width="140px" class="mt-2">
                    <el-form-item :label="`${$t('前缀名称')}：`" prop="name">
                        <el-input v-model="formInfo.name" placeholder="例如：张三本地" :size="config.renderConfig.layout.size" class="w-100" maxlength="15" clearable show-word-limit></el-input>
                    </el-form-item>
                    <el-form-item :label="`${$t('前缀值')}：`" prop="name">
                        <el-input v-model="formInfo.url" placeholder="例如：http://192.168.0.31:8080" :size="config.renderConfig.layout.size" class="w-100" maxlength="255" clearable show-word-limit></el-input>
                    </el-form-item>
                    <el-form-item :label="`${$t('是否共享')}：`" prop="name">
                        <el-radio-group v-model="formInfo.isLocal">
                            <el-radio :label="true">{{ $t("仅本地") }}</el-radio>
                            <el-radio :label="false">{{ $t("可共享") }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <div class="d-flex j-end">
                        <el-button v-success="isSuccess" :loading="loading" type="primary" @click="handleAddHost">确认添加</el-button>
                    </div>
                </el-form>
            </s-resize-x>
            <!-- 右侧数据展示 -->
            <div class="flex1">
                <s-table
                    ref="table"
                    url="/api/project/doc_service"
                    :params="{projectId: $route.query.id}"
                    delete-many
                    delete-url="/api/project/doc_service"
                    :res-hook="handleHookResponse"
                    @deleteMany="getTableData"
                >
                    <el-table-column :label="$t('前缀名称')" align="center">
                        <template #default="scope">
                            <el-input v-if="editItem?._id === scope.row._id" v-model="scope.row.name" type="textarea" :autosize="{ minRows: 3 }" :size="config.renderConfig.layout.size" class="w-100" maxlength="15" clearable show-word-limit></el-input>
                            <span v-else>{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('接口前缀')" align="center" width="300px">
                        <template #default="scope">
                            <s-valid-input
                                v-if="editItem?._id === scope.row._id"
                                v-model="scope.row.url"
                                :error="errorInfo.error"
                                :error-tip="errorInfo.message"
                                placeholder="接口前缀必填"
                            >
                            </s-valid-input>
                            <div v-else class="url-wrap">{{ scope.row.url }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('是否共享')" align="center">
                        <template #default="scope">
                            <span v-if="scope.row.isLocal" class="orange">{{ $t("仅本地") }}</span>
                            <span v-else class="green">{{ $t("可共享") }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('操作')" align="center">
                        <template #default="scope">
                            <el-button v-if="!editItem" type="primary" text @click="handleChangeEditNode(scope.row)">{{ $t("编辑") }}</el-button>
                            <el-button v-if="editItem?._id === scope.row._id" type="primary" text @click="handleSubmitEdit(scope.row)">{{ $t("确认") }}</el-button>
                            <el-button v-if="editItem?._id === scope.row._id" type="primary" text @click="handleCancelEdit(scope.row)">{{ $t("取消") }}</el-button>
                            <el-button link type="primary" text @click="handleDeleteHost(scope.row)">{{ $t("删除") }}</el-button>
                        </template>
                    </el-table-column>
                </s-table>
            </div>
        </div>
        <template #footer>
            <el-button type="warning" @click="handleClose">{{ $t("关闭") }}</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { ResponseTable } from "@@/global"
import { ApidocProjectHost } from "@@/store"
import { apidocCache } from "@/cache/apidoc"

type HostInfo = ApidocProjectHost & {
    _originValue?: string,
    isLocal?: boolean,
};

type HookThis = {
    tableData: HostInfo[],
    total: number,
}

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue"],
    data() {
        return {
            //=====================================表单及表单验证====================================//
            formInfo: {
                name: "", //-------------------前缀名称
                url: "", //--------------------接口前缀地址
                isLocal: true, //--------------是否为本地
            },
            rules: {
                name: [{ required: true, message: this.$t("请输入前缀名称"), trigger: "blur" }],
            },
            //=====================================其他参数====================================//
            errorInfo: {
                error: false,
                message: "",
            },
            editItem: null as HostInfo | null, //当前正在被编辑的数据
            isSuccess: false,
            loading: false,
        };
    },
    computed: {
        dominLimit() {
            return this.$store.state["apidoc/baseInfo"].rules.dominLimit;
        },
    },
    methods: {
        //返回钩子
        handleHookResponse(res: ResponseTable<HostInfo[]>, _this: HookThis) {
            const localData = apidocCache.getApidocServer(this.$route.query.id as string)
            _this.tableData = res.data.rows.concat(localData);
            _this.total = res.data.total + localData.length
        },
        //获取data数据
        getTableData() {
            this.$refs.table.getData<ResponseTable<ApidocProjectHost[]>>().then((res) => {
                this.$store.commit("apidoc/baseInfo/changeProjectHosts", res.data.rows)
            });
        },
        //确认添加host
        handleAddHost() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const { url } = this.formInfo;
                    const projectId = this.$route.query.id as string;
                    //保存为本地
                    if (this.formInfo.isLocal) {
                        const serverInfo = {
                            url,
                            name: this.formInfo.name,
                            isLocal: true,
                            _id: this.$helper.uuid(),
                        }
                        this.isSuccess = true;
                        setTimeout(() => {
                            this.isSuccess = false;
                        }, 300)
                        apidocCache.addApidocServer(serverInfo, projectId);
                        this.getTableData();
                        return;
                    }
                    this.loading = true;
                    const params = {
                        name: this.formInfo.name,
                        url,
                        projectId,
                    };
                    this.isSuccess = false;
                    this.axios.post("/api/project/doc_service", params).then(() => {
                        this.isSuccess = true;
                        this.getTableData();
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                }
            });
        },
        //=====================================节点编辑====================================//
        //改变正在编辑的节点
        handleChangeEditNode(row: HostInfo) {
            this.editItem = row;
            this.editItem._originValue = row.url;
        },
        //提交编辑
        handleSubmitEdit(row: HostInfo) {
            if (!this.errorInfo.error) {
                const originHost = this.$store.state["apidoc/apidoc"].apidoc.item.url.host;
                const isEditCurrenSelectedHost = originHost === row._originValue;
                if (row.isLocal) {
                    const serverInfo = {
                        url: row.url,
                        name: row.name,
                        isLocal: true,
                        _id: this.$helper.uuid(),
                    }
                    apidocCache.deleteApidocServer(row._originValue as string, this.$route.query.id as string);
                    apidocCache.addApidocServer(serverInfo, this.$route.query.id as string);
                    this.editItem = null;
                    if (isEditCurrenSelectedHost) { //同时修改本地server
                        this.$store.commit("apidoc/apidoc/changeApidocHost", row.url)
                    }
                    this.getTableData()
                    return;
                }
                const params = {
                    _id: row._id,
                    name: row.name,
                    url: row.url,
                    isLocal: row.isLocal
                };
                this.axios.put("api/project/doc_service", params).then(() => {
                    this.$message.success(this.$t("修改成功"));
                    this.$store.commit("apidoc/baseInfo/updateHostById", params);
                    if (isEditCurrenSelectedHost) { //同时修改本地server
                        this.$store.commit("apidoc/apidoc/changeApidocHost", row.url)
                    }
                    this.editItem = null;
                }).catch((err) => {
                    console.error(err);
                });
            }
        },
        //取消编辑
        handleCancelEdit(row: HostInfo) {
            row.url = this.editItem?._originValue as string;
            this.editItem = null;
        },
        //删除一个host
        handleDeleteHost(row: HostInfo) {
            const params = {
                ids: [row._id]
            };
            this.$confirm(this.$t("此操作将永久删除此条记录, 是否继续?"), this.$t("提示"), {
                confirmButtonText: this.$t("确定"),
                cancelButtonText: this.$t("取消"),
                type: "warning",
            }).then(() => {
                if (row.isLocal) {
                    apidocCache.deleteApidocServer(row.url, this.$route.query.id as string);
                    this.editItem = null;
                    this.getTableData()
                    return;
                }
                this.axios.delete("/api/project/doc_service", { data: params }).then(() => {
                    this.getTableData();
                }).catch((err) => {
                    console.error(err);
                }).finally(() => {
                    this.editItem = null;
                });
            }).catch((err: Error | string) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                console.error(err);
            });
        },
        //=====================================其他操作====================================//
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
    },
})
</script>

<style lang="scss">
.host-wrap {
    display: flex;
    // overflow-y: auto;
    .add-host {
        flex: 0 0 auto;
        padding-right: size(10);
        margin-right: size(10);
        border-right: 1px solid $gray-400;
    }
    .url-wrap {
        height: size(45);
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
