/**
    创建者：shuxiaokai
    创建时间：2020-01-15 13:31"
    模块名称：全局变量curd弹窗
    备注：xxxx
*/
<template>
    <s-curd-model v-if="visible" title="全局变量维护" :left-width="400" @close="closeModel">
        <!-- 新增数据 -->
        <div slot="left" class="pr-2">
            <el-divider content-position="left">添加全局变量</el-divider>
            <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px">
                <el-form-item label="变量名称：" prop="name">
                    <el-input v-model="formInfo.name" size="mini" placeholder="请输入变量名称" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
                <el-form-item label="变量值：" prop="value">
                    <el-input v-model="formInfo.value" size="mini" placeholder="请输入变量值" class="w-100" maxlength="999" clearable></el-input>
                </el-form-item>
                <el-form-item label="值类型" prop="type">
                    <el-select v-model="formInfo.type" size="mini" class="w-100">
                        <el-option value="string" label="string"></el-option>
                        <el-option value="number" label="number"></el-option>
                        <el-option value="boolean" label="boolean"></el-option>
                    </el-select>
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
            <s-table ref="table" url="/api/project/project_variable" tooltip-effect="light" :params="{ projectId: $route.query.id }">
                <el-table-column label="变量名称" align="center">
                    <template slot-scope="scope">
                        <el-input v-if="scope.row.__active" v-model="scope.row.name" size="mini" class="w-100" maxlength="100" clearable></el-input>
                        <span v-else>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="变量值" align="center" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <el-input v-if="scope.row.__active" v-model="scope.row.value" size="mini" class="w-100" maxlength="999" clearable></el-input>
                        <span v-else>{{ scope.row.value }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="变量值类型" align="center">
                    <template slot-scope="scope">
                        <el-select v-if="scope.row.__active" v-model="scope.row.type" size="mini" class="w-100">
                            <el-option value="string" label="string"></el-option>
                            <el-option value="number" label="number"></el-option>
                            <el-option value="boolean" label="boolean"></el-option>
                        </el-select>
                        <span v-else>{{ scope.row.type }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="创建者" align="center" prop="creator"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button v-show="!scope.row.__active && !isEditing" type="text" size="mini" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button v-show="scope.row.__active" type="text" size="mini" @click="handleSubmitEdit(scope.row)">确认</el-button>
                        <el-button v-show="scope.row.__active" type="text" size="mini" @click="handleCancelEdit(scope.row)">取消</el-button>
                        <el-button type="text" @click="handleDelete(scope.row._id)">删除</el-button>
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
            default: true
        },
    },
    data() {
        return {
            //=====================================请求参数====================================//
            formInfo: {
                name: "", //------------变量名称
                value: "", //-----------变量值
                type: "string", //------------变量类型
            },
            //=====================================表格参数====================================//
            oldEditingData: null,
            //=====================================验证参数====================================//
            rules: {
                name: [{ required: true, message: "请输入变量名称", trigger: "blur" }],
                value: [{ required: true, message: "请输入变量值", trigger: "blur" }],
            },
            //=====================================其他参数====================================//
            isEditing: false,
            loading: false, //=====================添加按钮加载效果
            successLoading: false, //===============是否添加成功
        };
    },
    created() {
    },
    methods: {
        getData() {
            this.$refs["table"].getData();
            this.$store.dispatch("apidoc/getDocVariable", {
                projectId: this.$route.query.id
            });
        },
        //=====================================前后端交互操作====================================//
        //新增表格数据
        handleAddHost() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    this.loading = true;
                    const params = Object.assign(this.formInfo, {
                        projectId: this.$route.query.id
                    });
                    this.successLoading = false;
                    this.axios.post("/api/project/project_variable", params).then(() => {
                        this.successLoading = true;
                        this.$emit("change")
                        this.getData();
                    }).catch(err => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading = false;
                    });                    
                } 
            });
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
            row.__active = false;
            const params = row;
            this.axios.put("/api/project/project_variable", params).then(() => {
                this.$message.success("修改成功");
                this.$emit("change")
                this.getData();
                this.isEditing = false;
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
        //删除一个数据
        handleDelete(_id) {
            this.$confirm("此操作将永久删除该域名, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                this.axios.delete("/api/project/project_variable", { data: { ids: [_id] }}).then(() => {
                    this.$message.success("删除成功");
                    this.$emit("change")
                    this.getData();
                }).catch(err => {
                    this.$errorThrow(err, this);
                });  
            }).catch(() => {
                    
            });
        },
        //=====================================其他操作====================================//
        /** 
            @description  关闭弹窗
            @autor        shuxiaokai
            @create       2019-10-19 22:39"
        */
        closeModel() {
            this.$emit("update:visible", false)
            this.$emit("close");
        },
    }
};
</script>

