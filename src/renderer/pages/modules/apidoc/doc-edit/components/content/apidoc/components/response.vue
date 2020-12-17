/*
    创建者：shuxiaokai
    创建时间：2020-12-16 16:10
    模块名称：response返回值
    备注：xxxx
*/
<template>
    <div class="response">
        <div class="request-info">
            <s-collapse title="基本信息">
                <s-label-value label="请求地址：" title="鼠标左键拷贝路径，鼠标右键拷贝全部" class="d-flex mt-2">
                    <span 
                        v-copy="formatRequestData.url.path" 
                        v-copy2="formatRequestData.url.host + formatRequestData.url.path"
                        class="text-ellipsis">
                        {{ formatRequestData.url.host + formatRequestData.url.path }}
                    </span>
                </s-label-value>
                <s-label-value label="请求方式：" class="d-flex">
                    <template v-for="(req) in validRequestMethods">
                        <span v-if="formatRequestData.methods === req.value.toLowerCase()" :key="req.name" class="label" :style="{color: req.iconColor}">{{ req.name.toUpperCase() }}</span>
                    </template>  
                </s-label-value>
                <s-label-value label="发布状态：" class="d-flex">
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
                </s-label-value>
                <s-label-value label="参数概况：" class="d-flex">
                    <el-popover placement="left-end" width="600" trigger="hover" :close-delay="0">
                        <s-tree-json :data="formatRequestData.requestParams" max-height="400px"></s-tree-json>
                        <span slot="reference" class="mr-3 gray-600">请求参数</span>
                    </el-popover>  
                    <el-popover placement="left-end" width="600" trigger="hover" :close-delay="0">
                        <s-tree-json :data="formatRequestData.responseParams" max-height="400px"></s-tree-json>
                        <span slot="reference" class="mr-3 gray-600">返回参数</span>
                    </el-popover>  
                    <el-popover placement="left-end" width="600" trigger="hover" :close-delay="0">
                        <s-tree-json :data="formatRequestData.header" max-height="400px"></s-tree-json>
                        <span slot="reference" class="gray-600">请求头</span>
                    </el-popover>  
                </s-label-value>
            </s-collapse>
        </div>
        <div class="response-info">
            <pre>{{ remoteResponse }}</pre>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        requestData: {
            type: Object,
            default() {
                return {};
            }
        },
    },
    data() {
        return {

        };
    },
    computed: {
        remoteResponse() {  //远端返回数据结果
            return this.$store.state.apidoc.responseData;
        },
        formatRequestData() { //变量替换后的请求参数
            const copyRequest = this.requestData;
            this.$helper.dfsForest(copyRequest.requestParams, {
                rCondition(value) {
                    return value ? value.children : null;
                },
                rKey: "children",
                hooks: (item) => {
                    item.value = this.convertVariable(item.value);
                }
            });
            this.$helper.dfsForest(copyRequest.responseParams, {
                rCondition(value) {
                    return value ? value.children : null;
                },
                rKey: "children",
                hooks: (item) => {
                    item.value = this.convertVariable(item.value);
                }
            });
            this.$helper.dfsForest(copyRequest.header, {
                rCondition(value) {
                    return value ? value.children : null;
                },
                rKey: "children",
                hooks: (item) => {
                    item.value = this.convertVariable(item.value);
                }
            });
            return copyRequest;
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
        //将扁平数据转换为树形结构数据
        convertPlainParamsToTreeData(plainData, jumpChecked) {
            const result = {};
            const foo = (plainData, result) => {
                for(let i = 0,len = plainData.length; i < len; i++) {
                    if (jumpChecked && !plainData[i]._select) { //若请求参数未选中则忽略掉
                        continue;
                    }
                    const key = plainData[i].key.trim();
                    // const value = this.convertVariable(plainData[i].value);
                    const value = plainData[i].value;
                    const type = plainData[i].type;
                    const resultIsArray = Array.isArray(result);
                    const isComplex = (type === "object" || type === "array");
                    let arrTypeResultLength = 0; //数组类型值长度，用于数组里面嵌套对象时候对象取值
                    if (!isComplex && (key === "" || value === "")) { //非复杂数据需要填写参数名称才可以显示
                        continue
                    }
                    /*eslint-disable indent*/ 
                    switch (type) {
                        case "number": //数字类型需要转换为数字，转换前所有值都为字符串
                            resultIsArray ? result.push(Number(value)) : result[key] = Number(value);
                            break;
                        case "boolean": //字符串类型不做处理
                            resultIsArray ? result.push(result[key] = (value === "true" ? true : false)) : (result[key] = (value === "true" ? true : false));
                            break;
                        case "object":
                            resultIsArray ? (arrTypeResultLength = result.push({})) : (result[key] = {});
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                foo(plainData[i].children, resultIsArray ? (result[arrTypeResultLength - 1]) : result[key]);
                            }
                            break;
                        case "array":
                            result[key] = [];
                            if (plainData[i].children && plainData[i].children.length > 0) {
                                foo(plainData[i].children, result[key]);
                            }
                            break;
                        default: //字符串或其他类型类型不做处理
                            resultIsArray ? result.push(value) : (result[key] = value);
                            break;
                    }
                }
            }
            foo(plainData, result);
            return result;
        },
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
.response {
    // padding: size(10);
    height: 100%;
    display: flex;
    flex-direction: column;
    .request-info {
        flex-grow: 0;
        flex-shrink: 0;
        box-shadow: 0 3px 2px $gray-400;
        margin-bottom: size(10);
        padding: size(10);
        height: size(170);
    }
    .response-info {
        flex: 1;
        overflow-y: auto;
    }
}
</style>
