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
    mixins: [mixin],
    components: {
        "s-params-tree": paramsTree
    },
    computed: {
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
        };
    },
    created() {
        this.initTempRequestBody();
        this.initWatchTempRequestBody();
    },
    methods: {
        //=====================================初始化&获取远程数据===========================//
        //初始化requestBody
        initTempRequestBody() {
            this.jsonBody.push(this.generateProperty());
            this.formDataBody.push(this.generateProperty());
            this.formUrlBody.push(this.generateProperty());
        },
        //初始化以后绑定对参数的监听
        initWatchTempRequestBody() {
            this.$watch("jsonBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", JSON.parse(JSON.stringify(val)));
            }), {
                deep: true
            });  
            this.$watch("formDataBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", JSON.parse(JSON.stringify(val)));
            }), {
                deep: true
            });  
            this.$watch("formUrlBody", this.$helper.debounce((val) => {
                this.$store.commit("apidoc/changeRequestBody", JSON.parse(JSON.stringify(val)));
            }), {
                deep: true
            });  
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
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
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
