/*
    创建者：shuxiaokai
    创建时间：2021-08-17 21:28
    模块名称：域名、服务器地址、环境维护
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" width="70%" :title="$t('域名、服务器地址、环境维护')" @close="handleClose">
        <div class="host-wrap">
            <!-- 左侧新增数据 -->
            <s-resize-x :min="400" :max="600" :width="400" name="curd-host" tabindex="1" class="add-host">
                <s-fieldset :title="$t('符合规范的服务器地址')">
                    <ul>
                        <li class="mb-2">
                            <div class="mb-1">{{ $t("ip地址+路径(可选)") }}</div>
                            <div class="gray-600">
                                <span>{{ $t("例如") }}:</span>
                                <span class="ml-1">http://127.0.0.199:81</span>
                                <el-divider direction="vertical"></el-divider>
                                <span>http://127.0.0.199:81/api</span>
                            </div>
                        </li>
                        <li>
                            <div class="mb-1">域名+路径(可选)</div>
                            <div class="gray-600">
                                <span>{{ $t("例如") }}:</span>
                                <span class="ml-1">www.demo.com</span>
                                <el-divider direction="vertical"></el-divider>
                                <span>www.demo.com/api</span>
                            </div>
                        </li>
                    </ul>
                </s-fieldset>
                <el-form ref="form" :model="formInfo" :rules="rules" label-width="140px" class="mt-2">
                    <el-form-item :label="`${$t('服务器名称')}：`" prop="name">
                        <el-input v-model="formInfo.name" placeholder="例如：张三本地" class="w-100" maxlength="15" clearable show-word-limit></el-input>
                    </el-form-item>
                    <el-form-item :label="`${$t('服务器地址')}：`" prop="server">
                        <el-input v-model="formInfo.server" name="name" :placeholder="$t('服务器地址+请求地址')" class="w-100" maxlength="100" clearable>
                            <template #prepend>
                                <el-select v-model="formInfo.protocol" class="w-100px">
                                    <el-option value="http://" label="http://"></el-option>
                                    <el-option value="https://" label="https://"></el-option>
                                </el-select>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item :label="`${$t('是否共享')}：`" prop="name">
                        <el-radio-group v-model="formInfo.isLocal">
                            <el-radio :label="true">{{ $t("仅本地") }}</el-radio>
                            <el-radio :label="false">{{ $t("可共享") }}</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <div class="mb-2 bg-gray-200 h-30px d-flex a-center">{{ formInfo.protocol + formInfo.server }}</div>
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
                    <el-table-column :label="$t('服务器名称')" align="center">
                        <template #default="scope">
                            <el-input v-if="scope.row.__active" v-model="scope.row.name" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                            <span v-else>{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="$t('服务器地址')" align="center">
                        <template #default="scope">
                            <s-valid-input
                                v-if="editItem?._id === scope.row._id"
                                v-model="scope.row.url"
                                :error="errorInfo.error"
                                :error-tip="errorInfo.message"
                                placeholder="服务器地址必填"
                                @blur="handleCheckHost(scope.row.url)"
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
                            <el-button v-if="!editItem" type="text" @click="handleChangeEditNode(scope.row)">{{ $t("编辑") }}</el-button>
                            <el-button v-if="editItem?._id === scope.row._id" type="text" @click="handleSubmitEdit(scope.row)">{{ $t("确认") }}</el-button>
                            <el-button v-if="editItem?._id === scope.row._id" type="text" @click="handleCancelEdit(scope.row)">{{ $t("取消") }}</el-button>
                            <el-button type="text" @click="handleDeleteHost(scope.row)">{{ $t("删除") }}</el-button>
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
        const validateHost = (rule: string, value: string, callback: (err?: Error) => void) => {
            const ipReg = /^((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(\d|[1-9]\d|1\d{2}|2[0-5]{2})(:\d{2,5})?(\/.+)?$/; //ip+端口(端口不必填)
            const dominReg = /^[a-zA-Z0-9-_.]+\.[a-zA-Z]+(\/.+)?$/;
            if (value === "") {
                callback(new Error(this.$t("不能为空")));
            } else if (!value.match(ipReg) && !value.match(dominReg)) {
                callback(new Error(this.$t("服务器地址不符合规范")))
            } else {
                callback();
            }
        }
        return {
            //=====================================表单及表单验证====================================//
            formInfo: {
                name: "", //-------------------服务器名称
                protocol: "http://", //--------协议
                server: "", //-----------------服务器url
                isLocal: true, //是否为本地
            },
            rules: {
                name: [{ required: true, message: this.$t("请输入服务器名称"), trigger: "blur" }],
                server: [
                    { required: true, validator: validateHost, trigger: "blur" },
                ],
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
                    const url = this.formInfo.protocol + this.formInfo.server;
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
                    return;
                }
                const params = {
                    _id: row._id,
                    name: row.name,
                    url: row.url,
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
        handleCheckHost(url: string) {
            const ipReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(\d|[1-9]\d|1\d{2}|2[0-5]{2})(:\d{2,5})?(\/.+)?$/; //ip+端口(端口不必填)
            const dominReg = /^https?:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]+(\/.+)?$/;
            if (url.trim() === "") {
                this.errorInfo.error = true;
                this.errorInfo.message = this.$t("服务器地址不能为空");
            } else if (!url.match(ipReg) && !url.match(dominReg)) {
                this.errorInfo.error = true;
                this.errorInfo.message = this.$t("服务器地址不符合规范");
            } else {
                this.errorInfo.error = false;
            }
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
    overflow-y: auto;
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
