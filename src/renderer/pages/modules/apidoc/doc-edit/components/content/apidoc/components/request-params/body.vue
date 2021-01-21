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
                <el-radio label="multipart/form-data">form-data</el-radio>
                <el-radio label="application/x-www-form-urlencoded">x-www-form-urlencoded</el-radio>
            </el-radio-group>
        </div>
        <!-- json -->
        <s-params-tree 
            v-show="contentType === 'application/json'"
            ref="jsonTree"
            :tree-data="jsonBody"
            nest
            :mind-params="mindParams.requestBody"
            showCheckbox
        >
        </s-params-tree>
        <!-- form-data -->
        <s-params-tree 
            v-show="contentType === 'multipart/form-data'"
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
            v-show="contentType === 'application/x-www-form-urlencoded'"
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
            formDataBody: [], //multipart/form-data
            formUrlBody: [], //application/x-www-form-urlencoded
            //=====================================其他参数====================================//
            contentTypeWatchFlag: null, //内容区域watch
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
            this.initWatch();
        },
        //初始化以后绑定对参数的监听
        initWatch() {
            this.jsonWatchFlag && this.jsonWatchFlag();
            this.formDataWatchFlag && this.formDataWatchFlag();
            this.formUrlWatchFlag && this.formUrlWatchFlag();
            this.contentTypeWatchFlag && this.contentTypeWatchFlag();
            //=========================================================================//
            this.jsonWatchFlag = this.$watch("jsonBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(val));
            }), {
                deep: true
            });  
            this.formDataWatchFlag = this.$watch("formDataBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(val));
            }), {
                deep: true
            });  
            this.formUrlWatchFlag = this.$watch("formUrlBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(val));
            }), {
                deep: true
            });  
            //=========================================================================//
            this.contentTypeWatchFlag = this.$watch("contentType", this.$helper.debounce((contentType) => {
                if (contentType === "application/json") {
                    this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(this.jsonBody));
                } else if (contentType === "application/x-www-form-urlencoded") {
                    this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(this.formUrlBody));
                } else if (contentType === "multipart/form-data") {
                    this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(this.formDataBody));
                } else { //默认按照json进行处理
                    this.$store.commit("apidoc/changeRequestBody", this.$helper.cloneDeep(this.jsonBody));
                }
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
