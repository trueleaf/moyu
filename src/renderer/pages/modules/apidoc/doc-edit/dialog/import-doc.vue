/*
    创建者：shuxiaokai
    创建时间：2020-07-20 11:21"
    模块名称：导入第三方文档
    备注：xxxx
*/
<template>
    <s-dialog title="导入第三方文档" :isShow="visible" class="import-doc" @close="handleClose">
        <div class="mb-5">
            <span>文档类型：</span>
            <el-radio-group v-model="formInfo.type">
                <el-radio label="postman">postman 2.1</el-radio>
                <el-radio label="raw">内部工具</el-radio>
            </el-radio-group>            
        </div>
        <div class="mb-5">
            <span>导入方式：</span>
            <el-radio-group v-model="formInfo.cover" size="mini">
                <el-radio-button :label="true">覆盖方式</el-radio-button>
                <el-radio-button :label="false">追加方式</el-radio-button>
            </el-radio-group>            
        </div>
        <el-upload
                class="w-100"
                :limit="1"
                drag
                action=""
                :before-upload="handleBeforeUpload"
                :http-request="requestHook">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <div slot="footer">
            <el-button :loading="loading" size="mini" type="primary" @click="handleSubmit">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
import { dfsForest } from "@/lib/index"
import uuid from "uuid/v4"
export default {
    props: {
        visible: { //弹窗是否显示
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            formInfo: {
                type: "raw",
                cover: true
            }, //-------项目信息
            docs: [], //-----------导入的文档列表
            loading: false, //-----导入第三方加载效果
            jsonText: "",
        };
    },
    created() {
        
    },
    methods: {
        //=====================================图片上传====================================//
        handleBeforeUpload(file) {
            const isJson = file.type === "application/json";
            const isLt1M = file.size / 1024 < 1024;
            if (!isJson) {
                this.$message.error("只能上传json文件");
            }
            if (!isLt1M) {
                this.$message.error("文件大小不超过1M");
            }
            return isJson && isLt1M;
        },
        requestHook(e) {
            console.log(2222, e.file)
            e.file.text().then(jsonText => {
                this.jsonText = jsonText;
            })
        },
        //=====================================postman数据转换====================================//
        //转换postman数据为标准格式
        convertPostmanData(data) {
            const result = [];
            const docs = data.item;
            let sortTime = Date.now();
            //给文档添加一个id
            dfsForest(docs, {
                rCondition: (value) => {
                    return value.item && value.item.length > 0;
                },
                hooks: (value) => {
                    value.id = uuid();
                },
                rKey: "item"
            });
            //将文档转换为规范的格式
            dfsForest(docs, {
                rCondition: (value) => {
                    return value.item && value.item.length > 0;
                },
                hooks: (value, index, arr, pNode) => {
                    const doc = this.generateDocInterface();
                    doc.pid = pNode ? pNode.id : "";
                    doc.uuid = value.id;
                    sortTime += 1000;
                    if (value.item) { //存在item则说明为folder
                        this.generateFolder(doc, {
                            docName: value.name,
                            projectId: this.$route.query.id,
                            sort: sortTime + index,
                        });
                        result.push(doc)
                    } else { //否则为文档
                        this.generateDoc(doc, {
                            docName: value.name,
                            projectId: this.$route.query.id,
                            sort: sortTime + index,
                            path: value.request.url.path ? ("/" + value.request.url.path.join("/")) : "",
                            methods: value.request.method.toLowerCase()
                        });
                        //生成文档header
                        value.request.header.forEach(val => { 
                            if (val.key) {
                                doc.item.header.push({
                                    key: val.key,
                                    type: "string",
                                    value: val.value,
                                    description: val.description,
                                    required: true
                                });
                            }
                        });
                        //将query转换为请求参数,注意一个请求参数既存在query又存在body将被认定为不规范数据，处理策略全部转换为查询参数
                        if (value && value.request && value.request.url && value.request.url.query) {
                            value.request.url.query.forEach(val => { //requestParams
                                if (val.key) {
                                    doc.item.requestParams.push({
                                        key: val.key,
                                        type: "string",
                                        value: val.value,
                                        description: val.description,
                                        required: true
                                    });                                
                                }
                            });                                
                        }

                        //将requestBody转换为请求参数
                        if (value.request.body && value.request.body.mode === "raw") {
                            try {
                                const raw = JSON.parse(value.request.body.raw);
                                const result = this.convertObjToPlainData(raw);
                                doc.item.requestParams = result;                                 
                            } catch (error) {
                                doc.item.requestParams = []; 
                            }
                        }
                        result.push(doc)
                    }
                },
                rKey: "item"
            });
            this.docs = result;
        },
        //将对象转换为扁平数据
        convertObjToPlainData(objData) {
            const result = [];
            const foo = (objData, result) => {
                if (Array.isArray(objData)) {
                    for (let i = 0; i < objData.length; i++) {
                        let value = objData[i]; //值
                        const resParams = {
                            key: i,
                            type: "string",
                            value: value,
                            description: "",
                            required: true,
                            children: []
                        };
                        if (this.$utils.getTag(value) === "string") { //简单类型不做处理
                            resParams.type = "string";
                        } else if (this.$utils.getTag(value) === "number") { //简单类型不做处理
                            resParams.type = "number";
                        } else if (this.$utils.getTag(value) === "boolean") { //简单类型不做处理
                            resParams.type = "boolean";
                        } else if (this.$utils.getTag(value) === "array") {
                            resParams.type = "array";
                            resParams.value = "";
                            foo(value, resParams.children);
                        } else if (this.$utils.getTag(value) === "object") {
                            resParams.type = "object";
                            resParams.value = "";
                            foo(value, resParams.children);
                        }
                        result.push(resParams);
                    }
                } else {
                    for (const i in objData) {
                        const hasOwn = Object.hasOwnProperty;
                        if (!hasOwn.call(objData, i)) {
                            continue;
                        }
                        let value = objData[i]; //值
                        const resParams = {
                            key: i,
                            type: "string",
                            value: value,
                            description: "",
                            required: true,
                            children: []
                        };
                        if (this.$utils.getTag(value) === "string") { //简单类型不做处理
                            resParams.type = "string";
                        } else if (this.$utils.getTag(value) === "number") { //简单类型不做处理
                            resParams.type = "number";
                        } else if (this.$utils.getTag(value) === "boolean") { //简单类型不做处理
                            resParams.type = "boolean";
                        } else if (this.$utils.getTag(value) === "array") {
                            resParams.type = "array";
                            resParams.value = "";
                            foo(value, resParams.children);
                        } else if (this.$utils.getTag(value) === "object") {
                            resParams.type = "object";
                            resParams.value = "";
                            foo(value, resParams.children);
                        }
                        result.push(resParams);
                    }
                }
            }
            foo(objData, result);
            return result;
        },
        //生成文档基础数据
        generateDocInterface() {
            return {
                item: {
                    url: {
                        host: "",
                        path: ""
                    },
                    description: "",
                    methods: "",
                    header: [],
                    requestParams: [],
                    responseParams: [],
                    otherParams: []
                },
                pid: "",
                docName: "",
                isFolder: false,
                projectId: "",
                sort: 0,
                enabled: true,
                publish: false
            };
        },
        //生成基础folder, 会改变第一个参数值
        generateFolder(doc, config) {
            doc.isFolder = true;
            doc.docName = config.docName;
            doc.projectId = config.projectId;
            doc.sort = config.sort;
        },
        //生成文档
        generateDoc(doc, config) {
            doc.isFolder = false;
            doc.docName = config.docName;
            doc.projectId = config.projectId;
            doc.sort = config.sort;
            doc.item.url.path = config.path;
            doc.item.methods = config.methods;
            doc.item.description = config.docName;
        },

        //=====================================原始数据转换====================================//
        convertRawData(data) {
            data.forEach(val => {
                val.uuid = val._id
                val.enabled = true
            })
            this.docs = data;
        },
        //=====================================组件间交互====================================//  
        handleSubmit() {
            this.loading = true;
            try {
                if (this.formInfo.type === "postman") {
                    this.convertPostmanData(JSON.parse(this.jsonText));
                } else if (this.formInfo.type === "raw") {
                    console.log(JSON.parse(this.jsonText))
                    this.convertRawData(JSON.parse(this.jsonText));
                }                
            } catch (error) {
                console.error(error);
                this.loading = false;
            }

            this.axios.post("/api/project/doc_multi", { docs: this.docs, projectId: this.$route.query.id }).then(() => {
                this.$emit("success");
                this.handleClose();
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================其他操作=====================================//
        handleClose() {
            this.$emit("update:visible", false);
        },
    }
};
</script>



<style lang="scss">
.import-doc {
    .el-upload {
        width: 100%;
    }
    .el-upload-dragger {
        width: 100%;
    }
}
</style>
