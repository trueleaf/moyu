/**
    创建者：shuxiaokai
    创建时间：2020-01-15 13:31"
    模块名称：预设参数curd弹窗
    备注：xxxx
*/
<template>
    <s-curd-model v-if="visible" title="快捷参数维护" left-width="55%" width="80%" @close="closeModel">
        <!-- 新增数据 -->
        <div slot="left" v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="ml-1 flex1">
            <el-tabs v-model="activeName">
                <!-- 新增 -->
                <el-tab-pane label="新增参数" name="s-add">
                    <el-form ref="form" :model="addData" :rules="rules" label-width="120px">
                        <el-form-item label="参数名称：" prop="name">
                            <el-input v-model="addData.name" size="mini" placeholder="例如：默认返回值" class="w-80" maxlength="8" clearable show-word-limit></el-input>
                        </el-form-item>
                        <el-form-item label="参数类型：" prop="type">
                            <el-select v-model="addData.type" placeholder="请选择参数类型" size="mini">
                                <el-option label="请求参数" value="request"></el-option>
                                <el-option label="返回参数" value="response"></el-option>
                            </el-select>
                        </el-form-item>
                        <div class="scroll-y-450">
                            <s-collapse-card title="参数模板">
                                <s-params-tree 
                                    ref="requestParams"
                                    :tree-data="addData.presetParams"
                                    :mind-params="mindParams"
                                    nest
                                    enable-form-data
                                >
                                </s-params-tree>
                            </s-collapse-card>
                        </div>
                        <div class="d-flex j-end">
                            <el-button :loading="loading2" type="success" size="mini" @click="handleAddPresetParams">确认新增</el-button>
                        </div>
                    </el-form>  
                </el-tab-pane>
                <!-- 修改 -->
                <el-tab-pane label="修改参数" name="s-edit">
                    <el-form v-if="editData._id" ref="form" :model="editData" :rules="rules" label-width="120px">
                        <el-form-item label="参数名称：" prop="name">
                            <el-input v-model="editData.name" size="mini" placeholder="例如：默认返回值" class="w-80" maxlength="8" clearable show-word-limit></el-input>
                        </el-form-item>
                        <el-form-item label="参数类型：" prop="type">
                            <el-select v-model="addData.type" placeholder="请选择参数类型" size="mini">
                                <el-option label="请求参数" value="request"></el-option>
                                <el-option label="返回参数" value="response"></el-option>
                            </el-select>
                        </el-form-item>
                        <div class="scroll-y-450">
                            <s-collapse-card title="参数模板">
                                <s-params-tree 
                                    ref="requestParams"
                                    :tree-data="editData.presetParams"
                                    nest
                                    enable-form-data
                                    :mind-params="mindParams"
                                >
                                </s-params-tree>
                            </s-collapse-card>
                        </div>
                        <div class="d-flex j-end">
                            <el-button :loading="loading2" type="success" size="mini" @click="handleEditPresetParams">确认修改</el-button>
                        </div>
                    </el-form> 
                </el-tab-pane>
            </el-tabs>
        </div>
        <!-- 数据展示 -->
        <div slot="right" class="pr-2">
            <el-divider content-position="left">数据展示</el-divider>
            <s-table 
                    ref="table"
                    url="/api/project/doc_preset_params_list"
                    height="400px"
                    :params="{projectId: $route.query.id}"
                    deleteMany
                    deleteUrl="/api/project/doc_preset_params"
                    deleteKey="ids"
                    @deleteMany="$emit('change')"
                >
                <el-table-column label="参数名称" align="center">
                    <template slot-scope="scope">
                        <el-input v-if="scope.row.__active" v-model="scope.row.name" size="mini" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                        <span v-else>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="创建者名称" prop="creatorName" align="center"></el-table-column>
                <el-table-column label="参数类型" prop="presetParamsType" align="center">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.presetParamsType === 'request'" size="mini" type="success">请求参数</el-tag>
                        <el-tag v-if="scope.row.presetParamsType === 'response'" size="mini" type="primary">返回参数</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" size="mini" @click="handleChangeOpToEdit(scope.row)">编辑</el-button>
                        <el-button type="text" size="mini" @click="handleDelete(scope.row._id)">删除</el-button>
                    </template>
                </el-table-column>
                <!-- <el-button slot="operation" type="success" size="mini" @click="handleChangeOpToAdd">新增快捷参数</el-button> -->
            </s-table>
        </div>
    </s-curd-model>
</template>

<script>
import uuid from "uuid/v4"
export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        },
    },
    computed: {
        mindParams() { //----------联想参数
            const mindReq =  this.$store.state.apidoc.mindParams.mindRequestParams;
            const mindRes =  this.$store.state.apidoc.mindParams.mindResponseParams;
            return mindReq.concat(mindRes);
        },
    },
    data() {
        return {
            //=====================================请求参数====================================//
            addData: {
                _id: "",
                name: "", //-------------------参数名称
                type: "request", //------------参数类型
                presetParams: [
                    {
                        id: uuid(),
                        key: "", //--------------请求参数键
                        value: "", //------------请求参数值
                        type: "string", //-------------请求参数值类型
                        description: "", //------描述
                        required: true, //-------是否必填
                        children: [], //---------子参数
                    }
                ],
            },
            editData: {
                _id: "",
                name: "", //-------------------参数名称
                type: "", //------------------参数类型
                presetParams: [
                    {
                        id: uuid(),
                        key: "", //--------------请求参数键
                        value: "", //------------请求参数值
                        type: "string", //-------------请求参数值类型
                        description: "", //------描述
                        required: true, //-------是否必填
                        children: [], //---------子参数
                    }
                ],
            },
            //=====================================验证参数====================================//
            rules: {
                name: [{ required: true, message: "请输入服务器名称", trigger: "blur" }],
            },
            //=====================================其他参数====================================//
            activeName: "s-add", //参数操作
            operationType: "add", //----------------操作类型， add(新增) edit(编辑)
            loading: false, //----------------------表格加载效果
            loading2: false, //---------------------添加按钮加载效果
        };
    },
    created() {
        
    },
    methods: {
        //=====================================表格相关====================================//
        getData() {
            this.$refs["table"].getData();
        },
        //=====================================前后端交互操作====================================//
        //新增表格数据
        handleAddPresetParams() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    const params = {
                        name: this.addData.name,
                        presetParamsType: this.addData.type,
                        projectId: this.$route.query.id,
                        items: this.addData.presetParams,
                    };
                    this.loading2 = true;
                    this.axios.post("/api/project/doc_preset_params", params).then(() => {
                        this.getData();
                        this.$emit("change")
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        this.loading2 = false;
                    });
                } 
            });
        },
        //修改快捷操作
        handleEditPresetParams() {
            this.$refs["form"].validate(valid => {
                if (valid) {
                    const params = {
                        _id: this.editData._id,
                        name: this.editData.name,
                        presetParamsType: this.addData.type,
                        items: this.editData.presetParams,
                    };
                    this.loading2 = true;
                    this.axios.put("/api/project/doc_preset_params", params).then(() => {
                        this.getData();
                        this.$emit("change")
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        this.loading2 = false;
                    });
                } 
            });
        },
        //删除
        handleDelete(_id) {
            this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                this.axios.delete("/api/project/doc_preset_params", { data: { ids: [_id] }}).then(() => {
                    this.$message.success("删除成功");
                    this.getData();
                    this.$emit("change")
                }).catch(err => {
                    this.$errorThrow(err, this);
                });  
            }).catch(() => {
                    
            });
        },
        //=====================================操作====================================//
        //修改
        handleChangeOpToEdit(row) {
            this.activeName= "s-edit";
            this.editData._id = row._id;
            this.editData.name = row.name;
            this.editData.presetParams = JSON.parse(JSON.stringify(row.items));
        },
        //新增
        handleChangeOpToAdd() {
            if (this.operationType === "add") {
                this.$message.warning("在右侧进行新增");
                return
            }
            this.operationType = "add";
            this.formInfo.name = "";
            this.formInfo.presetParams = [this.generateParams()];
        },
        //=====================================其他操作====================================//
        generateParams(type = "string") {
            return {
                id: uuid(),
                key: "", //--------------请求参数键
                value: "", //------------请求参数值
                type, //-----------------请求参数值类型
                description: "", //------描述
                required: true, //-------是否必填
                children: [], //---------子参数
            }
        },
        //关闭弹窗
        closeModel() {
            this.$emit("update:visible", false);
        },
    }
};
</script>

