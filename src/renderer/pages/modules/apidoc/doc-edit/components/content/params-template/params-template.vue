/*
    创建者：shuxiaokai
    创建时间：2021-01-27 22:18
    模块名称：参数模板维护
    备注：
*/
<template>
    <s-left-right class="params-template" left-width="60%">
        <div slot="right">
            <!-- 表格展示 -->
            <s-table
                    ref="table"
                    url="/api/project/doc_preset_params_list"
                    :params="{projectId: $route.query.id}"
                    deleteMany
                    deleteUrl="/api/project/doc_preset_params"
                    deleteKey="ids"
                >
                <el-table-column label="模板名称" align="center">
                    <template slot-scope="scope">
                        <el-input v-if="scope.row.__active" v-model="scope.row.name" size="mini" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                        <span v-else>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="创建者名称" prop="creatorName" align="center"></el-table-column>
                <el-table-column label="模板类型" prop="presetParamsType" align="center">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.presetParamsType === 'queryParams'" size="mini" type="success">请求参数(Params)</el-tag>
                        <el-tag v-if="scope.row.presetParamsType === 'requestBody'" size="mini" type="primary">请求参数(Body)</el-tag>
                        <el-tag v-if="scope.row.presetParamsType === 'responseParams'" size="mini" type="warning">返回参数</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" size="mini" @click="handleChangeOpToEdit(scope.row)">编辑</el-button>
                        <el-button type="text" size="mini" @click="handleDelete(scope.row._id)">删除</el-button>
                    </template>
                </el-table-column>
            </s-table>
        </div>
        <div slot="left">
            <el-tabs v-model="activeName">
                <!-- 新增模板 -->
                <el-tab-pane label="新增模板" name="s-add">
                    <el-form ref="form" inline :model="addData" :rules="rules" label-width="120px">
                        <el-form-item label="参数名称：" prop="name">
                            <el-input v-model="addData.name" size="mini" placeholder="例如：默认返回值" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                        </el-form-item>
                        <el-form-item label="参数类型：" prop="presetParamsType">
                            <el-select v-model="addData.presetParamsType" placeholder="请选择参数类型" size="mini" class="w-100">
                                <el-option label="请求参数(Params)" value="queryParams"></el-option>
                                <el-option label="请求参数(Body)" value="requestBody"></el-option>
                                <el-option label="返回参数" value="responseParams"></el-option>
                            </el-select>
                        </el-form-item>
                        <div class="scroll-y-450">
                            <s-collapse-card title="参数模板">
                                <s-params-tree
                                    ref="paramsTree"
                                    :tree-data="addData.items"
                                    nest
                                    :plain="addData.presetParamsType === 'queryParams'"
                                    enable-form-data
                                    :mind-params="mindParams[addData.presetParamsType]"
                                >
                                </s-params-tree>
                                <!-- json转换 -->
                                <div slot="operation">
                                    <div class="cursor-pointer hover-theme-color mr-3" @click.stop="dialogVisible = true">
                                        <span>json转换</span>
                                    </div>
                                </div>
                            </s-collapse-card>
                        </div>
                        <div class="d-flex j-end">
                            <el-button :loading="loading2" type="success" size="mini" @click="handleAddTemplate">确认新增</el-button>
                        </div>
                    </el-form>
                </el-tab-pane>
                <!-- 修改模板 -->
                <el-tab-pane label="修改模板" name="s-edit">
                    <s-loading :loading="loading">
                        <el-form v-if="editData._id" ref="form" :model="editData" :rules="rules" label-width="120px">
                            <el-form-item label="参数名称：" prop="name">
                                <el-input v-model="editData.name" size="mini" placeholder="例如：默认返回值" class="w-80" maxlength="8" clearable show-word-limit></el-input>
                            </el-form-item>
                            <el-form-item label="参数类型：" prop="type">
                                <el-select v-model="editData.presetParamsType" placeholder="请选择参数类型" size="mini">
                                    <el-option label="请求参数" value="request"></el-option>
                                    <el-option label="返回参数" value="response"></el-option>
                                </el-select>
                            </el-form-item>
                            <div class="scroll-y-450">
                                <s-collapse-card title="参数模板">
                                    <s-params-tree
                                        ref="requestParams"
                                        :tree-data="editData.items"
                                        nest
                                        enable-form-data
                                        :mind-params="mindParams[editData.presetParamsType]"
                                        :plain="editData.presetParamsType === 'queryParams'"
                                    >
                                    </s-params-tree>
                                </s-collapse-card>
                            </div>
                            <div class="d-flex j-end">
                                <el-button :loading="loading3" type="success" size="mini" @click="handleEditPresetParams">确认修改</el-button>
                            </div>
                        </el-form>
                    </s-loading>
                </el-tab-pane>
            </el-tabs>
            <s-json-schema :visible.sync="dialogVisible" :mind-params="mindParams.queryParams" @success="handleConvertJsonToParams"></s-json-schema>
        </div>
    </s-left-right>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import jsonSchema from "@/pages/modules/apidoc/doc-edit/dialog/json-schema.vue"

export default {
    mixins: [mixin],
    components: {
        "s-json-schema": jsonSchema,
    },
    data() {
        return {
            //=================================表单与表格参数================================//
            addData: {
                name: "", //-----------------------------------模板名称
                presetParamsType: "", //------------模板类型
                items: [], //----------------------------------参数信息
            },
            editData: {
                _id: "", //------------------------------------模板id
                name: "", //-----------------------------------模板名称
                presetParamsType: "", //------------模板类型
                items: [], //----------------------------------参数信息
            },
            //===================================枚举参数====================================//
            rules: {
                name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
                presetParamsType: [{ required: true, message: "请选择模板类型", trigger: "change" }],
            },
            //===================================业务参数====================================//

            //===================================其他参数====================================//
            activeName: "s-add", //当前tab切换状态
            dialogVisible: false, //json转换弹窗
            loading: false, //----------------------编辑加载效果
            loading2: false, //---------------------添加按钮加载效果
            loading3: false, //---------------------修改按钮加载效果
        };
    },
    computed: {
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //初始化
        init() {
            this.addData.items.push(this.generateProperty());
        },
        //=====================================前后端交互====================================//
        //新增模板
        handleAddTemplate() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    const params = {
                        projectId: this.$route.query.id,
                        ...this.addData,
                    };
                    this.loading2 = true;
                    this.axios.post("/api/project/doc_preset_params", params).then(() => {
                        this.$refs.table.getData();
                        this.$store.commit("apidoc/addPresetParams", params);
                        this.$emit("change")
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading2 = false;
                    });
                }
            });
        },
        //修改参数信息
        handleChangeOpToEdit(row) {
            this.activeName = "s-edit";
            if (this.loading) {
                return;
            }
            this.loading = true;
            const params = {
                projectId: this.$route.query.id,
                _id: row._id,
            };
            this.axios.get("/api/project/doc_preset_params", { params }).then((res) => {
                this.editData.name = row.name;
                this.editData._id = res.data._id;
                this.editData.presetParamsType = row.presetParamsType;
                this.editData.items = [];
                const lastItem = res.data.items[res.data.items.length - 1];
                res.data.items.forEach((val) => {
                    this.editData.items.push(val);
                })
                if (lastItem.key || lastItem.value) {
                    this.editData.items.push(this.generateProperty())
                }
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //将json数据转换为参数
        handleConvertJsonToParams(result, convertType) {
            if (convertType === "append") {
                result.forEach((val) => {
                    this.addData.items.unshift(val);
                })
            } else if (convertType === "override") {
                this.addData.items = result;
            }
            this.$refs.paramsTree.selectChecked();
        },
        //确认修改
        handleEditPresetParams() {
            this.loading3 = true;
            const params = {
                projectId: this.$route.query.id,
                ...this.editData,
            };
            this.axios.put("/api/project/doc_preset_params", params).then(() => {
                this.$refs.table.getData();
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading3 = false;
            });
        },
        //删除模板
        handleDelete(id) {
            this.$confirm("此操作将永久删除此条记录, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const params = {
                    ids: [id],
                    projectId: this.$route.query.id,
                };
                this.axios.delete("/api/project/doc_preset_params", { data: params }).then(() => {
                    this.$refs.table.getData();
                }).catch((err) => {
                    console.error(err);
                }).finally(() => {
                    this.loading = false;
                });
            }).catch((err) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.params-template {
    padding: size(20);
    height: calc(100vh - #{size(100)});
}
</style>
