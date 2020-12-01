/*
    创建者：shuxiaokai
    创建时间：2020-11-25 17:25
    模块名称：配置页面
    备注：xxxx
*/
<template>
    <div class="config">
        <el-form ref="form" :model="copyApiRules" :rules="rules" class="h-100" label-position="top" label-width="150px">
            <el-tabs v-model="activeName" tab-position="left">
                <el-tab-pane label="接口限制" name="s-a">
                    <el-form-item label="单个目录最大允许文档数量" prop="fileInFolderLimit">
                        <el-input-number v-model="copyApiRules.fileInFolderLimit" :controls="false" size="mini" :step="1" class="w-100" :min="1" :max="999999999"></el-input-number>
                    </el-form-item>
                    <el-form-item label="每个项目限制配置域名个数" prop="dominLimit">
                        <el-input-number v-model="copyApiRules.dominLimit" size="mini" :controls="false" :step="1" class="w-100" :min="1" :max="999999999"></el-input-number>
                    </el-form-item>
                    <el-form-item label="请求方式配置">
                        <s-collapse v-for="(item, index) in copyApiRules.requestConfig.config" :key="index" :active="false" class="w-100">
                            <span slot="title" :style="{color: item.iconColor}">{{ item.nickname }}</span>
                            <el-form-item label="图标颜色" prop="fileInFolderLimit">
                                <div class="d-flex a-center">
                                    <el-color-picker v-model="item.iconColor" size="mini"></el-color-picker>
                                    <div class="tabs ml-2">
                                        <span :style="{color: item.iconColor}">{{ item.nickname }}</span>
                                        <span class="item-text">示例{{ item.nickname }}接口</span>
                                    </div>
                                </div>
                            </el-form-item>
                            <el-form-item label="允许传参方式" prop="fileInFolderLimit">
                                <el-checkbox-group v-model="item.enabledContenType">
                                    <el-checkbox v-for="(ct) in copyApiRules.requestConfig.contentTypeEnum" :key="ct.value" :label="ct.value" :disabled="item.name === 'get'">{{ ct.name }}</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                        </s-collapse>
                    </el-form-item>
                    <div class="w-100 d-flex j-center">
                        <el-button size="small" type="success" @click="saveConfig">保存配置</el-button>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="权限管理" name="s-b"></el-tab-pane>
            </el-tabs>
        </el-form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            rules: {},
            activeName: "s-a",
            copyApiRules: {}
        };
    },
    watch: {
        "$store.state.apidocRules": {
            handler(val) {
                this.copyApiRules = JSON.parse(JSON.stringify(val))
            },
            immediate: true,
            deep: true
        }
    },
    created() {
        
    },
    methods: {
        //保存配置信息
        saveConfig() {
            this.$store.commit("apidocRules/changeRules", this.copyApiRules);
        }
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.config {
    width: 90%;
    min-width: size(768);
    margin: 0 auto;
    border-radius: $border-radius-sm;
    height: calc(100vh - #{size(100)});
    padding: size(10) size(0) size(10) size(20);
    .tabs {
        @include tabs;
    }
    .el-tabs {
        height: 100%;
    }
    .el-tabs--left, .el-tabs--right {
        overflow-y: auto;
        width: 60%;
        padding: 0 size(20);
    }
    .el-form-item {
        margin-bottom: 0;
    }
    .el-form-item__content {
        line-height: size(28);
    }
    .el-form-item__label {
        color: $gray-600;
    }
}
</style>
