/*
    创建者：shuxiaokai
    创建时间：2020-12-03 10:43
    模块名称：api规则
    备注：xxxx
*/
<template>
    <s-loading :loading="loading">
        <el-form v-flex1="20" ref="form" :model="copyApiRules" class="api-rule" label-width="220px">
            <!-- 基础配置 -->
            <s-fieldset title="基础配置">
                <s-config label="单个目录最大允许文档数量" :has-check="false" description="限制单个目录下文档个数，提高可阅读性">
                    <el-input-number v-model="copyApiRules.fileInFolderLimit" :controls="false" size="mini" :step="1" class="w-60" :min="4" :max="255"></el-input-number>
                </s-config>
                <s-config label="每个项目限制配置域名个数" :has-check="false" description="提高可阅读性">
                    <el-input-number v-model="copyApiRules.dominLimit" size="mini" :controls="false" :step="1" class="w-60" :min="1" :max="255"></el-input-number>
                </s-config>
                <s-config label="参数备注是否必填" :has-check="false" description="开启后将会对录入参数备注进行非空校验">
                    <el-radio-group v-model="copyApiRules.requireDescription">
                        <el-radio :label="true">必填</el-radio>
                        <el-radio :label="false">非必填</el-radio>
                    </el-radio-group>
                </s-config>
                <s-config label="参数值是否必填" :has-check="false" description="开启后将会对录入参数值进行非空校验">
                    <el-radio-group v-model="copyApiRules.requireValue">
                        <el-radio :label="true">必填</el-radio>
                        <el-radio :label="false">非必填</el-radio>
                    </el-radio-group>
                </s-config>
                <s-config label="是否开启折叠动画" :has-check="false" description="开启后将会对性能产生一定的影响">
                    <el-radio-group v-model="copyApiRules.enableCollapseAnimation">
                        <el-radio :label="true">开启</el-radio>
                        <el-radio :label="false">关闭</el-radio>
                    </el-radio-group>
                </s-config>
            </s-fieldset>
            <!-- 请求方式 -->
            <s-fieldset title="请求方式配置">
                <s-collapse v-for="(item, index) in copyApiRules.requestMethods" :key="index" :active="false" class="w-100">
                    <span slot="title" class="d-flex w-100 a-center" :style="{color: item.iconColor}">
                        <span class="w-100px mr-2">{{ item.name }}</span>
                        <span>
                            <span class="gray-800">支持Content-Type：</span>
                            <span v-for="(ct, index) in item.enabledContenType" :key="ct" class="gray-600">
                                <span>{{ ct }}</span>
                                <el-divider v-if="index !== item.enabledContenType.length - 1" direction="vertical"></el-divider>
                            </span>
                        </span>
                        <span v-if="item.enabled" class="ml-auto green">(已启用)</span>
                        <span v-else class="ml-auto gray-500">(已禁用)</span>
                    </span>
                    <el-form-item label="允许传参方式：" label-width="120px" prop="fileInFolderLimit">
                        <el-checkbox-group v-model="item.enabledContenType">
                            <el-checkbox v-for="(ct) in copyApiRules.contentType" :key="ct.value" :label="ct.value" :disabled="item.name === 'get'">{{ ct.name }}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="图标颜色：" label-width="120px" prop="fileInFolderLimit">
                        <div class="d-flex a-center">
                            <el-color-picker v-model="item.iconColor" size="mini"></el-color-picker>
                            <div class="tabs ml-2">
                                <span :style="{color: item.iconColor}">{{ item.name }}</span>
                                <span class="item-text">示例{{ item.name }}接口</span>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item label="是否启用：" label-width="120px" prop="fileInFolderLimit">
                        <el-radio-group v-model="item.enabled">
                            <el-radio :label="true">启用</el-radio>
                            <el-radio :label="false">禁用</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </s-collapse>
            </s-fieldset>
            <div class="w-100 d-flex j-center mt-2">
                <el-button size="small" type="success" :loading="loading" @click="saveConfig">保存配置</el-button>
            </div>
        </el-form>
    </s-loading>
</template>

<script>
export default {
    data() {
        return {
            scrollEvent: null,
            copyApiRules: {},
            loading: true,
        };
    },
    // watch: {
    //     "$store.state.apidocRules": {
    //         handler(val) {
    //             this.copyApiRules = JSON.parse(JSON.stringify(val))
    //             this.loading = false;
    //         },
    //         // immediate: true,
    //         deep: true
    //     }
    // },
    created() {
        this.getRules();
    },
    methods: {
        //获取规则数据
        getRules() {
            this.loading = true;
            this.$store.dispatch("apidocRules/getRuels", {
                projectId: this.$route.query.id,
            }).then((res) => {
                this.copyApiRules = JSON.parse(JSON.stringify(res.data))
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //保存配置信息
        saveConfig() {
            this.loading = true;
            const params = {
                projectId: this.$route.query.id,
                ...this.copyApiRules,
            };
            this.axios.put("/api/apidoc/project/project_rules", params).then(() => {
                this.$store.commit("apidocRules/changeRules", {
                    ...JSON.parse(JSON.stringify(this.copyApiRules)),
                })
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //改变ContentType值
        handleChangeContentType() {
            // this.copyApiRules.requestMethods.forEach((val) => {
            //     const enabledContenType = val.enabledContenType;
            //     const delIndex = enabledContenType.findIndex(ct => ct === item.value)
            // })
            // console.log(item, this.copyApiRules)
        },
    },
};
</script>

<style lang="scss">
.api-rule {
    .tabs {
        @include tabs;
    }
    .el-form-item {
        margin-bottom: 0;
    }
    .request-config {
        .el-form-item {
            border-bottom: 1px solid $gray-200;
        }
    }
}
</style>
