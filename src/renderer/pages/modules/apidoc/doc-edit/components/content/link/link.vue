/*
    创建者：shuxiaokai
    创建时间：2021-03-09 21:47
    模块名称：生成在线链接
    备注：
*/
<template>
    <div class="online-link">
        <div class="link-wrap">
            <div class="d-flex j-center mt-5">
                <svg class="link-icon" aria-hidden="true">
                    <use xlink:href="#iconlink"></use>
                </svg>
            </div>
            <s-fieldset title="生成链接">
                <div class="d-flex">
                    <pre class="link w-70">{{ shareLink }}</pre>
                    <el-button-group class="flex0 w-200px">
                        <!-- <el-button :loading="loading" :size="config.renderConfig.layout.size" @click="handleGenerateLink">生成</el-button> -->
                        <el-button v-copy="shareLink" :size="config.renderConfig.layout.size">复制</el-button>
                    </el-button-group>
                </div>
            </s-fieldset>
            <s-fieldset title="额外配置">
                <s-config label="密码设置" :has-check="false">
                    <el-input
                        v-model="formInfo.password"
                        :size="config.renderConfig.layout.size"
                        placeholder="请输入密码"
                        class="w-100"
                        maxlength="100"
                        type="password"
                        show-password
                        clearable>
                    </el-input>
                </s-config>
                <s-config label="过期时间" :has-check="false" description="不填默认一个月后过期，最大日期为一年">
                    <el-radio-group v-model="formInfo.maxAge" :disabled="customMaxAge">
                        <el-radio :label="86400000">1天后</el-radio>
                        <el-radio :label="86400000 * 7">1周后</el-radio>
                        <el-radio :label="86400000 * 30">1个月后</el-radio>
                        <el-radio :label="86400000 * 90">1个季度后</el-radio>
                    </el-radio-group>
                    <el-checkbox v-model="customMaxAge" class="ml-5" :label="true">自定义</el-checkbox>
                    <el-slider v-if="customMaxAge" v-model="formInfo.maxAge" :min="86400000" :step="86400000" :max="86400000 * 365" :format-tooltip="formatTooltip"></el-slider>
                </s-config>
                <div class="d-flex j-center mt-2">
                    <el-button :size="config.renderConfig.layout.size" :loading="loading" type="primary" @click="handleGenerateLink">生成链接</el-button>
                </div>
            </s-fieldset>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            formInfo: {
                password: "",
                maxAge: 86400000 * 30,
            },
            shareLink: "", //在线链接
            customMaxAge: false,
            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //=====================================其他参数====================================//
            loading: false, //----生成在线链接加载按钮
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//
        //生成链接
        handleGenerateLink() {
            this.loading = true;
            const { maxAge, password } = this.formInfo; //默认一个月过期
            const expire = Date.now() + maxAge;
            const params = {
                projectId: this.$route.query.id,
                maxAge,
                password,
            };
            this.axios.get("/api/project/export/online", { params }).then((res) => {
                const shareId = res.data;
                const projectName = this.$route.query.name;
                this.shareLink = `${this.config.renderConfig.share.baseUrl}/#/?shareId=${shareId}&projectName=${projectName}&expire=${expire}`;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================组件间交互====================================//
        //格式化展示
        formatTooltip(val) {
            return `${val / 86400000}天后`;
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.online-link {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    width: 100%;
    .link-wrap {
        width: 70%;
        min-width: size(768);
        margin: 0 auto;
        .link {
            height: size(28);
            white-space: nowrap;
            overflow-y: auto;
            user-select: auto;
            &::-webkit-scrollbar {
                height: 0px;
            }
        }
        .link-icon {
            width: size(120);
            height: size(120);
        }
    }

}
</style>
