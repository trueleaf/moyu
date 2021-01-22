/*
    创建者：shuxiaokai
    创建时间：2020-12-16 16:10
    模块名称：response返回值
    备注：xxxx
*/
<template>
    <div class="overview">
        <div class="request-view">
            <s-collapse v-if="formatRequestData.item" title="基本信息">
                <s-label-value label="请求地址：" title="鼠标左键拷贝路径，鼠标右键拷贝全部" class="d-flex mt-2">
                    <span 
                        v-copy="formatRequestData.item.url.path" 
                        v-copy2="formatRequestData.item.url.host + formatRequestData.item.url.path"
                        class="text-ellipsis">
                        {{ formatRequestData.item.url.host + formatRequestData.item.url.path }}
                    </span>
                </s-label-value>
                <s-label-value label="请求方式：" class="d-flex">
                    <template v-for="(req) in validRequestMethods">
                        <span v-if="formatRequestData.item.method === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toUpperCase() }}</span>
                    </template>  
                </s-label-value>
                <!-- <s-label-value label="发布状态：" class="d-flex">
                    <el-tag v-if="publishInfo.publish" size="mini" type="success" class="mr-1">已发布</el-tag>
                    <el-tag v-else size="mini" type="info" class="mr-1">未发布</el-tag>
                    <el-popover v-if="publishInfo.publish" placement="bottom-start" width="400" trigger="hover">
                        <el-table :data="publishInfo.publishRecords" size="mini" max-height="300px">
                            <el-table-column prop="publisher" label="发布者" align="center"></el-table-column>
                            <el-table-column prop="time" label="发布时间" align="center">
                                <template slot-scope="scope">
                                    {{ new Date(scope.row.time).toLocaleString() }}
                                </template>
                            </el-table-column>
                        </el-table>
                        <svg slot="reference" class="svg-icon" aria-hidden="true">
                            <use xlink:href="#iconlishi"></use>
                        </svg> 
                    </el-popover>  
                </s-label-value> -->
                <s-label-value label="请求参数：" class="d-flex">
                    <el-popover placement="left-end" width="600" trigger="hover" :close-delay="0">
                        <s-tree-json :data="formatRequestData.item.queryParams" max-height="400px"></s-tree-json>
                        <span slot="reference" class="mr-3 gray-600">请求参数(params)</span>
                    </el-popover>  
                    <el-popover placement="left-end" width="600" trigger="hover" :close-delay="0">
                        <s-tree-json :data="formatRequestData.item.requestBody" max-height="400px"></s-tree-json>
                        <span slot="reference" class="mr-3 gray-600">请求参数(body)</span>
                    </el-popover>  
                </s-label-value>
                <s-label-value label="返回参数：" class="d-flex">
                    <el-popover v-for="(item, index) in formatRequestData.item.responseParams" :key="index" placement="left-end" width="600" trigger="hover" :close-delay="0">
                        <s-tree-json :data="item.values" max-height="400px"></s-tree-json>
                        <span slot="reference" class="mr-3 gray-600">{{ item.title }}</span>
                    </el-popover>  
                </s-label-value>
            </s-collapse>
        </div>
        <div class="response-view">
            <!-- <pre class="scroll-y-300">{{ remoteResponse }}</pre> -->
            <s-response-view :response="remoteResponse"></s-response-view>
        </div>
    </div>
</template>

<script>
import responseView from "./response-view/response-view"

export default {
    components: {
        "s-response-view": responseView
    },
    data() {
        return {

        };
    },
    computed: {
        remoteResponse() {  //远端返回数据结果
            return this.$store.state.apidoc.remoteResponse;
        },
        formatRequestData() { //变量替换后的请求参数
            const apiInfo = this.$store.state.apidoc.apidocInfo;
            const queryParams = apiInfo.queryParams || [];
            const requestBody = apiInfo.requestBody || [];
            const responseParams = apiInfo.responseParams?.reduce((previous, current) => {
                return previous.values.concat(current.values)
            })
            this.$helper.dfsForest(queryParams, {
                rCondition(value) {
                    return value ? value.children : null;
                },
                rKey: "children",
                hooks: (item) => {
                    item.value = this.convertVariable(item.value);
                }
            });
            this.$helper.dfsForest(requestBody, {
                rCondition(value) {
                    return value ? value.children : null;
                },
                rKey: "children",
                hooks: (item) => {
                    item.value = this.convertVariable(item.value);
                }
            });
            this.$helper.dfsForest(responseParams || [], {
                rCondition(value) {
                    return value ? value.children : null;
                },
                rKey: "children",
                hooks: (item) => {
                    item.value = this.convertVariable(item.value);
                }
            });
            return apiInfo;
        },
        variables() { //全局变量
            return this.$store.state.apidoc.variables || [];
        },
        publishInfo() { //发布信息
            const docFullInfo = this.$store.state.apidoc.docFullInfo;
            return {
                publish: docFullInfo.publish,
                publishRecords: docFullInfo.publishRecords ? docFullInfo.publishRecords.reverse() : []
            };
        },
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter(val => val.enabled);
        }
    },
    created() {

    },
    methods: {
        //将变量转换为实际数据
        convertVariable(val) {
            if (val == null) {
                return;
            }
            if (Object.prototype.toString.call(val).slice(8, -1) === "ArrayBuffer") { //ArrayBuffer文件类型
                return val;
            }
            const matchedData = val.toString().match(/{{\s*(\w+)\s*}}/);
            if (val && matchedData) {
                const varInfo = this.variables.find(v => {
                    return v.name === matchedData[1];
                });
                if (varInfo) {
                    return val.replace(/{{\s*(\w+)\s*}}/, varInfo.value);
                } else {
                    return val;
                }
            } else {
                return val;
            }
        },
    }
};
</script>



<style lang="scss">
.overview {
    height: 100%;
    display: flex;
    flex-direction: column;
    .request-view {
        flex-grow: 0;
        flex-shrink: 0;
        box-shadow: 0 3px 2px $gray-400;
        margin-bottom: size(10);
        padding: size(10);
        height: size(170);
        .svg-icon {
            width: size(15);
            height: size(15);
            cursor: pointer;
        }
    }
    .response-view {
        flex: 1;
        overflow-y: auto;
    }
}
</style>
