/*
    创建者：shuxiaokai
    创建时间：2020-11-25 17:32
    模块名称：数据统计
    备注：xxxx
*/
<template>
    <div class="statistics">
        <img :src="require('@/assets/imgs/logo.png')" width="150px" height="150px" alt="logo图片" class="logo">
        <div class="f-base">
            <div>
                <span>接口数量：</span>
                <span>{{ docNum }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import yaml from "js-yaml"
import OpenApiTranslator from "./open-api-translator"
import yamlJsonData from "./data"

export default {
    computed: {
        docNum() {
            let i = 0;
            const { banner } = this.$store.state.apidoc;
            this.$helper.dfsForest(banner, {
                rCondition(value) {
                    return value.children;
                },
                rKey: "children",
                hooks(data) {
                    if (!data.isFolder) {
                        i += 1;
                    }
                },
            });
            return i;
        },
    },
    data() {
        return {
            openApiTranslatorInstance: null,
            loading: false,
            jsonYaml: "",
        };
    },
    created() {
        this.init();
    },
    methods: {
        init() {
            this.openApiTranslatorInstance = new OpenApiTranslator(this.$route.query.id);
            const docs = this.openApiTranslatorInstance.convertToMoyuDocs(yamlJsonData);
            console.log(docs)
        },
        importOpenApiDoc() {
            const moyuDocs = this.openApiTranslatorInstance.convertToMoyuDocs(this.jsonYaml);
            this.loading = false;
            this.axios.post("/api/project/doc_multi", { docs: moyuDocs, projectId: this.$route.query.id }).then(() => {
                this.getComponentByName("SDocEditBanner").getDocBanner();
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        async handleChangeFile(e) {
            const file = e.target.files[0];
            const text = await file.text();
            this.jsonYaml = yaml.load(text);
        },
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.statistics {
    height: calc(100% - #{size(40)});
    display: flex;
    flex-direction: column;
    align-items: center;
    .logo {
        margin-top: 5vh;
    }
}
</style>
