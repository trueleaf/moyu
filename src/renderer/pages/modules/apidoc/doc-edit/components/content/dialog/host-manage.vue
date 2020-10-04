/**
    创建者：shuxiaokai
    创建时间：2020-01-15 13:31"
    模块名称：域名维护curd弹窗
    备注：xxxx
*/
<template>
    <s-curd-model v-if="visible" title="域名维护" :left-width="500" @close="closeModel">
        <!-- 新增数据 -->
        <div slot="left" class="pr-2">
            <el-divider content-position="left">添加域名</el-divider>
            <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px">
                <el-form-item label="服务器名称：" prop="name">
                    <el-input v-model="formInfo.name" size="mini" placeholder="例如：张三本地" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="域名(ip)：" prop="url">
                    <el-input v-model="formInfo.url" name="name" size="mini" placeholder="例如：http://127.0.0.1:8080,http://baidu.com" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
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
                <el-table-column label="服务器url" align="center">
                    <template slot-scope="scope">
                        <div class="h-60px d-flex a-center j-center">
                            <s-v-input 
                                    v-if="scope.row.__active"
                                    v-model="scope.row.url" 
                                    :error="!isValidUrl" 
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
            default: false
        },
    },
    data() {
        const validateHost = (rule, value, callback) => {
            if (value === "") {
                callback(new Error("例如：http://192.168.0.0:8080 https://baidu.com,不支持localhost"));
            } else {
                const ipReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(\d|[1-9]\d|1\d{2}|2[0-5]{2}):\d{2,5}$/; //ip+端口
                const dominReg = /^https?:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]+$/;
                if (value.match(ipReg) || value.match(dominReg)) {
                    callback()
                } else {
                    callback(new Error("例如：http://192.168.0.0:8080 https://baidu.com,不支持localhost"))
                }
            }
        }
        return {
            //=====================================请求参数====================================//
            formInfo: {
                name: "", //-------------------服务器名称
                url: "", //--------------------服务器url
            },
            oldEditingData: null,
            //=====================================验证参数====================================//
            rules: {
                name: [{ required: true, message: "请输入服务器名称", trigger: "blur" }],
                url: [
                    { required: true, validator: validateHost, trigger: "blur" },
                ],
            },
            //=====================================其他参数====================================//
            isValidUrl: true, //-------------------是否显示服务器url验证错误信息
            isEditing: false, //-------------------是否正在编辑
            loading: false, //---------------------添加按钮加载效果
            successLoading: false, //--------------是否添加成功
        };
    },
    created() {
    },
    methods: {

        //=====================================前后端交互操作====================================//
        //新增表格数据
        handleAddHost() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    this.loading = true;
                    const params = {
                        name: this.formInfo.name,
                        url: this.formInfo.url,
                        projectId: this.$route.query.id
                    };
                    this.successLoading = false;
                    this.axios.post("/api/project/doc_service", params).then(() => {
                        this.successLoading = true;
                        this.$refs["table"].getData();
                        this.$emit("change");
                    }).catch(err => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading = false;
                    });                    
                } 
            });
        },
        //检查host值是否有效
        handleCheckHost(url) {
            // 0-9  10-99 100-199 200-255
            const ipReg = /^https?:\/\/((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(\d|[1-9]\d|1\d{2}|2[0-5]{2}):\d{2,}$/; //ip+端口
            const dominReg = /^https?:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]+$/;
            if (!url.match(ipReg) && !url.match(dominReg)) {
                this.isValidUrl = false;
            } else {
                this.isValidUrl = true;
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
            if (!this.isValidUrl) {
                return;
            }
            row.__active = false;
            const params = row;
            this.axios.put("api/project/doc_service", params).then(() => {
                this.$message.success("修改成功");
                this.isEditing = false;
                this.$emit("change");
            }).catch(err => {
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
                type: "warning"
            }).then(() => {
                this.axios.delete("api/project/doc_service", { data: { ids: [_id] }}).then(() => {
                    this.$refs["table"].getData();
                    this.$emit("change");
                }).catch(err => {
                    this.$errorThrow(err, this);
                }).finally(() => {
                    this.isEditing = false;
                });  
            }).catch(() => {
                    
            });
        },
        //=====================================其他操作====================================//
        //关闭弹窗
        closeModel() {
            this.isEditing = false;
            this.$emit("close");
            this.$emit("update:visible");
        },
    }
};
</script>

