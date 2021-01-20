/*
    创建者：shuxiaokai
    创建时间：2021-01-16 13:58
    模块名称：body请求参数
    备注：xxxx
*/
<template>
    <s-collapse-card v-bind="$attrs">
        <div slot="head">
            <span>请求参数</span>
            <span>(Body)</span>
        </div>
        <div class="d-flex a-center j-center py-2">
            <el-radio-group v-model="contentType">
                <el-radio label="application/json">json</el-radio>
                <el-radio label="multipart/from-data">from-data</el-radio>
                <el-radio label="application/x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
            </el-radio-group>
        </div>
        <!-- json -->
        <s-params-tree 
            v-if="contentType === 'application/json'"
            ref="jsonTree"
            :tree-data="jsonBody"
            nest
            :mind-params="mindParams.requestBody"
            showCheckbox
        >
        </s-params-tree>
        <!-- from-data -->
        <s-params-tree 
            v-if="contentType === 'multipart/from-data'"
            ref="formDataTree"
            :tree-data="formDataBody"
            :nest="false"
            :mind-params="mindParams.requestBody"
            enable-form-data
            showCheckbox
        >
        </s-params-tree>
        <!-- x-www-form-urlencoded -->
        <s-params-tree 
            v-if="contentType === 'application/x-www-form-urlencoded'"
            ref="formUrlTree"
            :tree-data="formUrlBody"
            :nest="false"
            :mind-params="mindParams.requestBody"
            showCheckbox
        >
        </s-params-tree>
    </s-collapse-card>
</template>

<script>
import paramsTree from "../params-tree/params-tree"
import mixin from "../../mixin" //公用数据和函数
export default {
    name: "REQUEST_BODY",
    mixins: [mixin],
    components: {
        "s-params-tree": paramsTree
    },
    computed: {
        requestBody() { //请求body
            return this.$store.state.apidoc.apidocInfo?.item?.requestBody;
        },
        contentType: { //请求contentType类型
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.contentType;
            },
            set(val) {
                this.$refs["jsonTree"]?.selectChecked();
                this.$refs["formDataTree"]?.selectChecked();
                this.$refs["formUrlTree"]?.selectChecked();
                this.$store.commit("apidoc/changeContentType", val);
            }
        },
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
    },
    data() {
        return {
            jsonBody: [], //application/json
            formDataBody: [], //multipart/from-data
            formUrlBody: [], //application/x-www-form-urlencoded
            //=====================================其他参数====================================//
            jsonWatchFlag: null, //watch标识用于清空数据
            formDataWatchFlag: null, //watch标识用于清空数据
            formUrlWatchFlag: null, //watch标识用于清空数据
        };
    },
    created() {
        this.$on("dataReady", () => {
            this.initRequestBody();
        });
    },
    methods: {
        //=====================================初始化&获取远程数据===========================//
        //初始化requestBody
        initRequestBody() {
            this.jsonBody = [];
            this.formDataBody = [];
            this.formUrlBody = [];
            if (this.contentType === "application/json") {
                this.jsonBody = this.$helper.cloneDeep(this.requestBody);
                this.formDataBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
            } else if (this.contentType === "application/x-www-form-urlencoded") {
                this.formUrlBody = this.$helper.cloneDeep(this.requestBody);
                this.jsonBody = [this.generateProperty()];
                this.formDataBody = [this.generateProperty()];
            } else if (this.contentType === "multipart/form-data") {
                this.formDataBody = this.$helper.cloneDeep(this.requestBody);
                this.jsonBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
            } else { //默认按照json进行处理
                this.jsonBody = this.$helper.cloneDeep(this.requestBody);
                this.formDataBody = [this.generateProperty()];
                this.formUrlBody = [this.generateProperty()];
            }
            this.initWatchTempRequestBody();
        },
        //初始化以后绑定对参数的监听
        initWatchTempRequestBody() {
            this.jsonWatchFlag && this.jsonWatchFlag();
            this.formDataWatchFlag && this.formDataWatchFlag();
            this.formUrlWatchFlag && this.formUrlWatchFlag();
            this.jsonWatchFlag = this.$watch("jsonBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", JSON.parse(JSON.stringify(val)));
            }), {
                deep: true
            });  
            this.formDataWatchFlag = this.$watch("formDataBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", JSON.parse(JSON.stringify(val)));
            }), {
                deep: true
            });  
            this.formUrlWatchFlag = this.$watch("formUrlBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", JSON.parse(JSON.stringify(val)));
            }), {
                deep: true
            });  
        },
        //选中_select为true的参数
        selectChecked() {
            return new Promise((resolve, reject) => {
                Promise.all([this.$refs["jsonTree"]?.selectChecked(), this.$refs["formDataTree"]?.selectChecked(), this.$refs["formUrlTree"]?.selectChecked()]).then(() => {
                    resolve();
                }).catch(err => {
                    reject(err)
                })
            })
        },
        //=====================================前后端交互====================================//

       
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
