/*
    创建者：shuxiaokai
    创建时间：2020-12-21 21:53
    模块名称：返回值展示组件
    备注：xxxx
*/
<template>
    <div class="response-view">
        <div class="d-flex a-center mb-2">
            <div>
                <span>状态码：</span>
                <template v-if="response.statusCode">
                    <span v-show="response.statusCode >= 100 && response.statusCode < 300" class="green">{{ response.statusCode }}</span>
                    <span v-show="response.statusCode >= 300 && response.statusCode < 400" class="orange">{{ response.statusCode }}</span>
                    <span v-show="response.statusCode >= 400" class="red">{{ response.statusCode }}</span>
                </template>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div>
                <span>时长：</span>
                <template v-if="response.rt">
                    <span v-show="response.rt >= 0 && response.rt < 2000" class="green">{{ formatMs }}</span>
                    <span v-show="response.rt >= 2000 && response.rt < 5000" class="orange">{{ formatMs }}</span>
                    <span v-show="response.rt >= 5000" class="red">{{ formatMs }}</span>
                </template>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div>
                <span>大小：</span>
                {{ response.value }}
                <template v-if="response.size">
                    <span v-show="response.size >= 0 && response.size < 10000" class="green">{{ formatBytes }}</span>
                    <span v-show="response.size >= 10000 && response.size < 15000" class="orange">{{ formatBytes }}</span>
                    <span v-show="response.size >= 15000" class="red">{{ formatBytes }}</span>
                </template>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
            <el-divider direction="vertical"></el-divider>
            <div class="d-flex a-center j-center">
                <span>格式：</span>
                <s-ellipsis-content v-if="response.mime" :value="response.mime" max-width="200px"></s-ellipsis-content>
                <span v-else title="未请求数据" class="el-icon-question gray-500"></span>
            </div>
        </div>
        <el-tabs v-model="activeName">
            <el-tab-pane label="返回值" name="s-a">
                <div v-if="response.mime">
                    <!-- svg图片 -->
                    <span v-if="response.mime.includes('image/svg+xml')" v-html="response.value"></span>
                    <!-- json格式 -->
                    <s-json v-else-if="response.mime.includes('application/json')" :data="JSON.parse(response.value)" :check-data="responseParams" @export="handleExport"></s-json>
                    <!-- 其他图片类型 -->
                    <img 
                        v-else-if="response.mime.includes('image/')"
                        class="img-view"
                        :src="response.value"
                        :preview-src-list="[response.value]"
                        fit="scale-down"
                    >
                    <!-- 音频类型 -->
                    <!-- 视频类型 -->
                    <!-- 强制下载类型 -->
                    <div v-else-if="response.mime.includes('application/octet-stream')">
                        <i class="iconicon_weizhiwenjian"></i>
                    </div>
                    <!-- excel -->
                    <div v-else-if="response.mime.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') || response.mime.includes('application/vnd.ms-excel')">
                        <svg class="res-icon" aria-hidden="true" title="Excel">
                            <use xlink:href="#iconexcel"></use>
                        </svg> 
                    </div>
                    <!-- word -->
                    <div v-else-if="response.mime.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || response.mime.includes('application/msword')">
                        <svg class="res-icon" aria-hidden="true" title="Excel">
                            <use xlink:href="#iconWORD"></use>
                        </svg> 
                    </div>
                    <!-- pdf -->
                    <iframe v-else-if="response.mime.includes('application/pdf')" :src="response.value" class="pdf-view"></iframe>
                    <!-- xml -->
                    <pre v-else-if="response.mime.includes('application/xml')">{{ response.value }}</pre>
                    <!-- javascript -->
                    <pre v-else-if="response.mime.includes('application/javascript')">{{ response.value }}</pre>
                    <!-- 文本类型 -->
                    <pre v-else-if="response.mime.includes('text/')">{{ response.value }}</pre>
                    <div v-else>
                        <svg class="res-icon" aria-hidden="true" :title="response.mime">
                            <use xlink:href="#iconicon_weizhiwenjian"></use>
                        </svg> 
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="Cookie" name="s-b"> </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
export default {
    props: {
        response: {
            type: Object,
            default() {
                return {};
            }
        },
        requestData: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    computed: {
        formatBytes() {
            return this.$helper.formatBytes(this.response.size);
        },
        formatMs() {
            return this.$helper.formatMs(this.response.rt);
        },
        responseParams() { //返回参数(对象类型)
            const copyData = JSON.parse(JSON.stringify(this.requestData.responseParams)); //扁平数据拷贝
            const result = this.convertPlainParamsToTreeData(copyData);
            return result;
        },
    },
    data() {
        return {
            activeName: "s-a"
        };
    },
    created() {

    },
    methods: {
        //导出数据
        handleExport(data) {
            const copyData =JSON.parse(JSON.stringify(data))
            this.$helper.dfsForest(copyData, {
                rCondition(value) {
                    return value.children;
                },
                rKey: "children",
                hooks: (val) => {
                    val.description || (this.$set(val, "description", ""))
                    Object.assign(val, {
                        id: this.$helper.uuid(),
                        required: true, //-------是否必填
                    })
                }
            });
            copyData.push(this.generateParams());
            this.requestData.responseParams = copyData
        },
        //将扁平数据转换为树形结构数据
        convertPlainParamsToTreeData(plainData, jumpChecked) {
            const result = {};
            const foo = (plainData, result) => {
                for(let i = 0,len = plainData.length; i < len; i++) {
                    if (jumpChecked && !plainData[i]._select) { //若请求参数未选中则忽略掉
                        continue;
                    }
                    const key = plainData[i].key.trim();
                    const value = this.convertVariable(plainData[i].value);
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
        //生成请求数据
        generateParams(type = "string") {
            return {
                id: this.$helper.uuid(),
                key: "",
                description: "",
                type: type,
                value: "",
                required: true,
            }
        },

    }
};
</script>



<style lang="scss">
.response-view {
    padding: size(10);
    .img-view {
        width: size(200);
        height: size(200);
    }
    .pdf-view {
        width: 100%;
        height: size(300);
    }
    .res-icon {
        width: size(200);
        height: size(200);
    }
}
</style>
