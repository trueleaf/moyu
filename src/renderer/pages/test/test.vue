/*
    创建者：shuxiaokai
    创建时间：2020-06-01 17:06
    模块名称：
    备注：xxxx
*/
<template>
    <el-form ref="form" class="server-code w-80 m-auto" :model="formInfo" :rules="rules" label-width="150px">
        <el-divider content-position="left">全局配置</el-divider>
        <el-row>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
                <el-form-item label="英文名称：">
                    <el-input v-model="formInfo.name" size="mini" placeholder="例如：user" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="6">
                <el-form-item label="中文名称：">
                    <el-input v-model="formInfo.name" size="mini" placeholder="例如：用户" class="w-100" maxlength="100" clearable></el-input>
                </el-form-item>
            </el-col>
        </el-row>
        <s-fieldset title="控制器">
            <div class="d-flex j-end">
                <el-button size="mini" type="success">新增</el-button>
                <el-button size="mini" type="success">修改</el-button>
                <el-button size="mini" type="success">分页列表</el-button>
                <el-button size="mini" type="success">详情</el-button>
                <el-button size="mini" type="success">删除</el-button>
            </div>
            <el-divider content-position="left">新增数据</el-divider>
            <el-table :data="tableInfo" stripe border size="mini">
                <el-table-column prop="name" label="英文名称" align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.name" name="name" size="mini" placeholder="例如：user" class="w-100" maxlength="100" clearable></el-input>
                    </template>
                </el-table-column>
                <el-table-column prop="comment" label="中文注释" align="center">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.name" name="name" size="mini" placeholder="例如：用户名称" class="w-100" maxlength="100" clearable></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="字段类型" align="center" width="600px">
                    <template slot-scope="scope">
                        <el-radio-group v-model="scope.row.type" size="mini">
                            <el-radio label="string">字符串</el-radio>
                            <el-radio label="number">数字</el-radio>
                            <el-radio label="boolean">布尔</el-radio>
                            <el-radio label="array">数组</el-radio>
                            <el-radio label="array<string>">数字数组</el-radio>
                            <el-radio label="array<number>">字符串数组</el-radio>
                        </el-radio-group>
                    </template>
                </el-table-column>
                <el-table-column prop="" label="是否必填" align="center">
                    <template slot-scope="scope">
                        <el-checkbox v-model="scope.row.required">必填</el-checkbox>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="200px">
                    <template>
                        <el-button type="text">新增一行</el-button>
                    </template>
                </el-table-column>
            </el-table>
           
        </s-fieldset>
        
    </el-form>
</template>

<script>
export default {
    data() {
        return {
            tableInfo: [
                {}
            ],
            formInfo: {},
            rules: {},
        };
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.server-code {
    .el-form-item {
        margin-bottom: 0;
    }
    .el-divider--horizontal {
        margin: 10px 0;
    }
}
</style>
