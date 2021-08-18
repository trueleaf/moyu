/*
    创建者：shuxiaokai
    创建时间：2021-08-17 21:28
    模块名称：域名、服务器地址、环境维护
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" width="70%" title="域名、服务器地址、环境维护" @close="handleClose">
        <div class="host-wrap">
            <!-- 左侧新增数据 -->
            <s-resize-x :min="400" :max="600" :width="400" name="curd-host" tabindex="1" class="add-host">
                <s-fieldset title="符合规范的服务器地址">
                    <ul>
                        <li class="mb-2">
                            <div class="mb-1">ip地址+路径(可选)</div>
                            <div class="gray-600">
                                <span>例如:</span>
                                <span class="ml-1">http://127.0.0.199:81</span>
                                <el-divider direction="vertical"></el-divider>
                                <span>http://127.0.0.199:81/api</span>
                            </div>
                        </li>
                        <li>
                            <div class="mb-1">域名+路径(可选)</div>
                            <div class="gray-600">
                                <span>例如:</span>
                                <span class="ml-1">www.demo.com</span>
                                <el-divider direction="vertical"></el-divider>
                                <span>www.demo.com/api</span>
                            </div>
                        </li>
                    </ul>
                </s-fieldset>
                <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px" class="mt-2">
                    <el-form-item label="服务器名称：" prop="name">
                        <el-input v-model="formInfo.name" size="mini" placeholder="例如：张三本地" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                    </el-form-item>
                    <el-form-item label="服务器地址：" prop="server">
                        <el-input v-model="formInfo.server" name="name" size="mini" placeholder="服务器地址+请求地址" class="w-100" maxlength="100" clearable>
                            <template #prepend>
                                <el-select v-model="formInfo.protocol" class="w-100px" size="mini">
                                    <el-option value="http://" label="http://"></el-option>
                                    <el-option value="https://" label="https://"></el-option>
                                </el-select>
                            </template>
                        </el-input>
                    </el-form-item>
                    <div class="mb-2 bg-gray-200 h-30px d-flex a-center">{{ formInfo.protocol + formInfo.server }}</div>
                    <div class="d-flex j-end">
                        <el-button v-success="isSuccess" :loading="loading" type="primary" size="mini" @click="handleAddHost">确认添加</el-button>
                    </div>
                </el-form>
            </s-resize-x>
            <!-- 右侧数据展示 -->
            <div class="flex1">
                <s-table ref="table" url="/api/project/doc_service" :params="{projectId: $route.query.id}" delete-many delete-url="/api/project/doc_service" @deleteMany="getTableData">
                    <el-table-column label="服务器名称" align="center">
                        <template #default="scope">
                            <el-input v-if="scope.row.__active" v-model="scope.row.name" size="mini" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                            <span v-else>{{ scope.row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="服务器地址" align="center">
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
                    <el-table-column label="操作" align="center">
                        <template #default="scope">
                            <el-button v-if="!editItem" type="text" size="mini" @click="handleChangeEditNode(scope.row)">编辑</el-button>
                            <el-button v-if="editItem?._id === scope.row._id" type="text" size="mini" @click="handleSubmitEdit(scope.row)">确认</el-button>
                            <el-button v-if="editItem?._id === scope.row._id" type="text" size="mini" @click="handleCancelEdit(scope.row)">取消</el-button>
                            <el-button type="text" size="mini" @click="handleDeleteHost(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>
                </s-table>
            </div>
        </div>
        <template #footer>
            <el-button size="mini" type="warning" @click="handleClose">关闭</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { ResponseTable } from "@@/global"
import { ApidocProjectHost } from "@@/store"

type HostInfo = ApidocProjectHost & {
    _originValue?: string,
};

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
                callback(new Error("不能为空"));
            } else if (!value.match(ipReg) && !value.match(dominReg)) {
                callback(new Error("服务器地址不符合规范"))
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
            },
            rules: {
                name: [{ required: true, message: "请输入服务器名称", trigger: "blur" }],
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
        //获取data数据
        getTableData() {
            this.$refs.table.getData<ResponseTable<ApidocProjectHost[]>>().then((res) => {
                this.$store.commit("apidoc/baseInfo/changeProjectHosts", res.data.rows)
            });
        },
        //确认添加host
        handleAddHost() {
            const { total } = this.$refs.table;
            if (this.dominLimit <= total) {
                this.$message.warning(`限制可维护域名数不超过${this.dominLimit}个`);
                return
            }
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    const params = {
                        name: this.formInfo.name,
                        url: this.formInfo.protocol + this.formInfo.server,
                        projectId: this.$route.query.id,
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
                const params = {
                    _id: row._id,
                    name: row.name,
                    url: row.url,
                };
                this.axios.put("api/project/doc_service", params).then(() => {
                    this.$message.success("修改成功");
                    this.editItem = null;
                }).catch((err) => {
                    console.error(err);
                });
            }
            console.log(row)
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
            this.$confirm("此操作将永久删除该域名, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
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
                this.errorInfo.message = "服务器地址不能为空";
            } else if (!url.match(ipReg) && !url.match(dominReg)) {
                this.errorInfo.error = true;
                this.errorInfo.message = "服务器地址不符合规范";
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
    .add-host {
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
