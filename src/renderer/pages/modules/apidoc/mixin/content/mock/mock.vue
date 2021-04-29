/*
    创建者：shuxiaokai
    创建时间：2021-04-28 22:41
    模块名称：mock管理
    备注：
*/
<template>
    <div class="s-mock">
        <s-fieldset title="新增Mock规则" class="w-50">
            <el-form ref="form" :model="formInfo" label-width="150px">
                <el-form-item label="占位符名称：">
                    <el-input v-model="formInfo.name" :size="config.renderConfig.layout.size" placeholder="例如cname" maxlength="100" clearable></el-input>
                </el-form-item>
                <el-form-item label="占位符解释：">
                    <el-input v-model="formInfo.name" :size="config.renderConfig.layout.size" placeholder="例如：中文名称" maxlength="100" clearable></el-input>
                </el-form-item>
            </el-form>
        </s-fieldset>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            formInfo: {},
            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.s-mock {
    padding: size(20);
}
</style>
