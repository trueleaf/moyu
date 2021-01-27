/*
    创建者：shuxiaokai
    创建时间：2021-01-27 15:18
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
                    @deleteMany="handleDeleteMany"
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
                        <el-tag v-if="scope.row.presetParamsType === 'queryParams'" size="mini" type="success">params</el-tag>
                        <el-tag v-if="scope.row.presetParamsType === 'requestBody'" size="mini" type="primary">body</el-tag>
                        <el-tag v-if="scope.row.presetParamsType === 'responseParams'" size="mini" type="warning">response</el-tag>
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
                            </s-collapse-card>
                        </div>
                        <div class="d-flex j-end">
                            <el-button :loading="loading2" type="success" size="mini" @click="handleAddTemplate">确认新增</el-button>
                        </div>
                    </el-form>
                </el-tab-pane>
                <!-- 修改模板 -->
                <el-tab-pane label="修改模板" name="s-edit">
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
                                    :tree-data="editData.presetParams"
                                    nest
                                    enable-form-data
                                    :mind-params="mindParams[editData.presetParamsType]"
                                    :plain="editData.presetParamsType === 'queryParams'"
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
    </s-left-right>
</template>

<script>
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import paramsTree from "../apidoc/components/params-tree/params-tree.vue"

export default {
    mixins: [mixin],
    components: {
        "s-params-tree": paramsTree,
    },
    data() {
        return {
            //=================================表单与表格参数================================//
            addData: {
                name: "", //-----------------------------------模板名称
                presetParamsType: "queryParams", //------------模板类型
                items: [], //----------------------------------参数信息
            },
            editData: {
                _id: "", //------------------------------------模板id
                name: "", //-----------------------------------模板名称
                presetParamsType: "queryParams", //------------模板类型
                items: [], //----------------------------------参数信息
            },
            //===================================枚举参数====================================//
            rules: {
                name: [{ required: true, message: "请输入模板名称", trigger: "blur" }],
                presetParamsType: [{ required: true, message: "请选择模板类型", trigger: "change" }],
            },
            //===================================业务参数====================================//

            //===================================其他参数====================================//
            activeName: "s-add",
            loading: false, //----------------------表格加载效果
            loading2: false, //---------------------添加按钮加载效果
        };
    },
    computed: {
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
    },
    mounted() {
        this.addData.items.push(this.generateProperty());
    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//
        //批量删除模板
        handleDeleteMany() {

        },
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
            console.log(this.addData)
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
