/**
    创建者：shuxiaokai
    创建时间：2020-01-15 13:31"
    模块名称：服务器地址维护curd弹窗
    备注：xxxx
*/
<template>
    <s-curd-model v-if="visible" title="服务器地址维护" :left-width="500" class="host-manage" @close="closeModel">
        <!-- 新增数据 -->
        <div slot="left" class="pr-2">
            <!-- <el-divider content-position="left">添加域名</el-divider> -->
            <s-fieldset title="符合规范的服务器地址组成">
                <ul>
                    <li class="mb-2">
                        <div class="mb-1">ip地址+路径(可选)</div>
                        <div class="gray-600">
                            <span>eg:</span>
                            <span class="ml-1">http://127.0.0.199:81</span>
                            <el-divider direction="vertical"></el-divider>
                            <span>http://127.0.0.199:81/api</span>
                        </div>
                    </li>
                    <li>
                        <div class="mb-1">域名+路径(可选)</div>
                        <div class="gray-600">
                            <span>eg:</span>
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
                        <template slot="prepend">
                            <el-select v-model="formInfo.protocol" class="w-100px" size="mini">
                                <el-option value="http://" label="http://"></el-option>
                                <el-option value="https://" label="https://"></el-option>
                            </el-select>
                        </template>
                    </el-input>
                </el-form-item>
                <div class="mb-2 bg-gray-200 h-30px d-flex a-center">{{ url }}</div>
                <div class="d-flex j-end">
                    <el-button v-success="successLoading" :loading="loading" type="primary" size="mini" @click="handleAddHost">确认添加</el-button>
                </div>
            </el-form>
        </div>
        <!-- 数据展示 -->
        <div slot="right" class="ml-1 flex1">
            <el-divider content-position="left">数据展示</el-divider>
            <!-- 表格展示 -->
            <s-table ref="table" url="/api/project/doc_service" :params="{projectId: $route.query.id}">
                <el-table-column label="服务器名称" align="center">
                    <template slot-scope="scope">
                        <el-input v-if="scope.row.__active" v-model="scope.row.name" size="mini" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                        <span v-else>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="服务器地址" align="center">
                    <template slot-scope="scope">
                        <div class="h-60px d-flex a-center j-center">
                            <s-v-input
                                v-if="scope.row.__active"
                                v-model="scope.row.url"
                                :error="urlError"
                                tip="eg:http://10.1.0.0:20 https://baidu.com"
                                size="mini"
                                class="w-100"
                                maxlength="100"
                                clearable
                                @blur="handleCheckHost(scope.row.url)"
                            >
                            </s-v-input>
                            <span v-else>{{ scope.row.url }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button v-show="!scope.row.__active && !isEditing" type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button v-show="scope.row.__active" type="text" size="mini" @click="handleSubmitEdit(scope.row)">确认</el-button>
                        <el-button v-show="scope.row.__active" type="text" size="mini" @click="handleCancelEdit(scope.row)">取消</el-button>
                        <el-button type="text" size="mini" @click="handleDeleteProjectType(scope.row._id)">删除</el-button>
                    </template>
                </el-table-column>
            </s-table>
        </div>
    </s-curd-model>
</template>

<script>
export default {
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        const validateHost = (rule, value, callback) => {
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
            //=====================================请求参数====================================//
            formInfo: {
                name: "", //-------------------服务器名称
                protocol: "http://", //--------协议
                server: "", //-----------------服务器url
            },
            oldEditingData: null,
            //=====================================验证参数====================================//
            rules: {
                name: [{ required: true, message: "请输入服务器名称", trigger: "blur" }],
                server: [
                    { required: true, validator: validateHost, trigger: "blur" },
                ],
            },
            //=====================================其他参数====================================//
            urlError: { //-----------------请求url错误
                error: false,
                message: "请求url不能为空",
            },
            isEditing: false, //-------------------是否正在编辑
            loading: false, //---------------------添加按钮加载效果
            successLoading: false, //--------------是否添加成功
        };
    },
    computed: {
        docRules() { //文档规则
            return this.$store.state.apidocRules;
        },
        url() {
            return this.formInfo.protocol + this.formInfo.server;
        },
    },
    methods: {

        //=====================================前后端交互操作====================================//
        //新增表格数据
        handleAddHost() {
            const { total } = this.$refs.table;
            if (this.docRules.dominLimit <= total) {
                this.$message.warning(`限制可维护域名数不超过${this.docRules.dominLimit}个`);
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
                    this.successLoading = false;
                    this.axios.post("/api/project/doc_service", params).then(() => {
                        this.successLoading = true;
                        this.$refs.table.getData();
                        this.$emit("change");
                    }).catch((err) => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading = false;
                    });
                }
            });
        },
        //检查host值是否有效
        handleCheckHost(url) {
            console.log(url)
            // 0-9  10-99 100-199 200-255
            const ipReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(\d|[1-9]\d|1\d{2}|2[0-5]{2})(:\d{2,5})?(\/.+)?$/; //ip+端口(端口不必填)
            const dominReg = /^https?:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]+(\/.+)?$/;
            // console.log(url, !url.match(ipReg) && !url.match(dominReg))
            if (!url.match(ipReg) && !url.match(dominReg)) {
                this.urlError.error = true;
                this.urlError.message = "服务器地址不符合规范";
            } else if (url.trim() === "") {
                this.urlError.error = true;
                this.urlError.message = "服务器地址不能为空";
            } else {
                this.urlError.error = false;
            }
        },
        //=====================================修改====================================//
        //让当前行处于修改状态
        handleEdit(row) {
            this.$set(row, "__active", true);
            this.isEditing = true;
            this.oldEditingData = JSON.parse(JSON.stringify(row));
        },
        //确认修改当前行
        handleSubmitEdit(row) {
            this.handleCheckHost(row.url);
            if (this.urlError.error) {
                return;
            }
            row.__active = false;
            const params = row;
            this.axios.put("api/project/doc_service", params).then(() => {
                this.$message.success("修改成功");
                this.isEditing = false;
                this.$emit("change");
            }).catch((err) => {
                this.$errorThrow(err, this);
            });
        },
        //取消修改
        handleCancelEdit(row) {
            Object.assign(row, this.oldEditingData)
            row.__active = false;
            this.isEditing = false;
        },
        //=====================================删除====================================//
        //删除一个域名
        handleDeleteProjectType(_id) {
            this.$confirm("此操作将永久删除该域名, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.axios.delete("api/project/doc_service", { data: { ids: [_id] } }).then(() => {
                    this.$refs.table.getData();
                    this.$emit("change");
                }).catch((err) => {
                    this.$errorThrow(err, this);
                }).finally(() => {
                    this.isEditing = false;
                });
            }).catch((err) => {
                console.error(err);
            });
        },
        //=====================================其他操作====================================//
        //关闭弹窗
        closeModel() {
            this.isEditing = false;
            this.$emit("close");
            this.$emit("update:visible");
        },
    },
};
</script>
<style lang="scss">
.host-manage {
    .el-form-item__content {
        display: flex;
        align-items: center;
        height: size(40);
    }
}
</style>
