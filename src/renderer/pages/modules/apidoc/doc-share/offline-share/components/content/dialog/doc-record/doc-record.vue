/*
    创建者：shuxiaokai
    创建时间：2020-09-06 10:03"
    模块名称：文档修改记录查看
    备注：xxxx
*/
<template>
    <s-dialog title="文档修改记录查看" :isShow="visible" @close="handleClose">
        <s-collapse title="基本信息">
            <s-diff-view v-if="diffDocInfo.base.creator.isChange" label="创建者：" :old-value="diffDocInfo.base.creator.oldValue" :new-value="diffDocInfo.base.creator.newValue"></s-diff-view>
            <s-diff-view v-if="diffDocInfo.base.docName.isChange" label="文档名称：" :old-value="diffDocInfo.base.docName.oldValue" :new-value="diffDocInfo.base.docName.newValue"></s-diff-view>
            <s-diff-view v-if="diffDocInfo.base.method.isChange" label="请求方法：" :old-value="diffDocInfo.base.method.oldValue" :new-value="diffDocInfo.base.method.newValue"></s-diff-view>
            <s-diff-view v-if="diffDocInfo.base.requestType.isChange" label="传参类型：" :old-value="diffDocInfo.base.requestType.oldValue" :new-value="diffDocInfo.base.requestType.newValue"></s-diff-view>
            <s-diff-view v-if="diffDocInfo.base.path.isChange" label="接口地址：" :old-value="diffDocInfo.base.path.oldValue" :new-value="diffDocInfo.base.path.newValue"></s-diff-view>
        </s-collapse>
        <s-collapse title="请求参数">
            <!-- <pre>{{ diffDocInfo.request }}</pre> -->
        </s-collapse>
        <s-collapse title="返回参数">
            <s-diff-json :data="diffDocInfo.request"></s-diff-json>
        </s-collapse>
        <s-collapse title="请求头"></s-collapse>
        <!-- <div slot="footer">
            <el-button size="mini" type="primary" @click="handleSubmit">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div> -->
    </s-dialog>
</template>

<script>
import diffView from "./components/diff-view"
export default {
    components: {
        "s-diff-view": diffView
    },
    props: {
        visible: { //弹窗是否显示
            type: Boolean,
            default: false
        },
    },
    data() {
        return {
            newDocInfo: {
                base: {},
                header: {},
                request: {},
                response: {},
            },
            oldDocInfo: {
                base: {},
                header: {},
                request: {},
                response: {},
            },
            records: [],
        };
    },
    computed: {
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        diffDocInfo() {
            const newDocBase = this.newDocInfo.base;
            const newDocHeader = this.newDocInfo.header;
            const newDocRequestParams = this.newDocInfo.requestParams;
            const newDocResponseParams = this.newDocInfo.responseParams;
            const oldDocBase = this.oldDocInfo.base;
            const oldDocHeader = this.oldDocInfo.header;
            const oldDocRequestParams = this.oldDocInfo.requestParams;
            const oldDocResponseParams = this.oldDocInfo.responseParams;
            const result = {
                base: {},
                header: {},
                request: {},
                response: {},
            };
            result.base = this.diffBase(newDocBase, oldDocBase);
            result.header = this.diffHeader(newDocHeader, oldDocHeader);
            result.request = this.diffRequestParams(newDocRequestParams, oldDocRequestParams);
            result.response = this.diffResponseParams(newDocResponseParams, oldDocResponseParams);
            return result
        }
    },
    created() {
        this.handleGetHistoryRecord();
    },
    methods: {
        //=====================================处理接口修改====================================//
        //基础信息对比
        diffBase(newDocInfo, oldDocInfo) {
            const result = {
                creator: {},
                docName: {},
                method: {},
                requestType: {},
                path: {},
            };
            for (const key in newDocInfo) {
                const hasOwn = Object.hasOwnProperty;
                if (hasOwn.call(newDocInfo, key)) {
                    const newValue = newDocInfo[key];
                    const oldValue = oldDocInfo[key];
                    if (newValue !== oldValue) {
                        result[key] = {
                            isChange: true,
                            newValue,
                            oldValue,
                        }
                    }else {
                        result[key] = {
                            isChange: false,
                            newValue,
                            oldValue,
                        }
                    }
                }
            }
            return result;
        },
        //请求头对比
        diffHeader() {

        },
        //请求参数对比
        diffRequestParams(newDocRequestParams, oldDocRequestParams) {
            if (newDocRequestParams && oldDocRequestParams) {
                console.log(newDocRequestParams, oldDocRequestParams);
                const result = [];
                const foo = (newData, oldData, result) => {
                    // 1. 原始数据key值在历史数据中存在  2. 原始数据key值在历史数据中没有  3. 历史数据key值在原始数据中没有
                    //======================================遍历newData===================================//
                    for (let i = 0; i < newData.length; i++) {
                        if (newData[i].key === "" && newData[i].value === "" && newData[i].description === "") {
                            continue;
                        }
                        const newElement = newData[i]; //最新数据
                        const newElementKey = newElement.key; //最新数据key值
                        // const newElementValue = newElement.value; //最新数据value值
                        // const newElementType = newElement.type; //最新数据type值
                        // const newElementDescription = newElement.description; //最新数据description值
                        const oldElement = oldData.find((val) => val.key === newElementKey); //旧数据
                        let retData = {};
                        if (oldElement) { //原始数据key值在历史数据中存在
                            retData = this.generateDiffDocInfo(newElement, oldElement);
                            result.push(retData)
                        } else { //原始数据key值在历史数据中没有
                            retData = this.generateDiffDocInfo(newElement, null);
                            result.push(retData);
                        }
                        if (newElement.type === "object") {
                            foo(newElement.children, oldElement ? oldElement.children : [], retData.children);
                        }
                        if (newElement.type === "array") {
                            foo(newElement.children, oldElement ? oldElement.children : [], retData.children);
                        }
                    }      
                    //=====================================遍历oldData====================================//
                    for (let i = 0; i < oldData.length; i++) {
                        if (oldData[i].key === "" && oldData[i].value === "" && oldData[i].description === "") {
                            continue;
                        }
                        const oldElement = oldData[i]; //历史数据
                        const oldElementKey = oldElement.key; //历史数据key值
                        // const oldElementValue = oldElement.value; //历史数据value值
                        // const oldElementType = oldElement.type; //历史数据type值
                        // const oldElementDescription = oldElement.description; //历史数据description值
                        //=========================================================================//
                        const newElement = newData.find((val) => val.key === oldElementKey); //新数据
                        if (!newElement) { //原始数据key值在历史数据中存在
                            const retData = this.generateDiffDocInfo(null, oldElement);
                            result.push(retData)
                            if (oldElement.type === "object") {
                                foo(newElement ? newElement.children : [], oldElement ? oldElement.children : [], retData.children);
                            }
                            if (oldElement.type === "array") {
                                foo(newElement ? newElement.children : [], oldElement ? oldElement.children : [], retData.children);
                            }
                        } 
                    }                 
                }
                foo(newDocRequestParams, oldDocRequestParams, result);
                return result;
            } else {
                return {};
            }
        },
        diffResponseParams(newDocResponseParams, oldDocResponseParams) {
            if (newDocResponseParams && oldDocResponseParams) {
                console.log(newDocResponseParams, oldDocResponseParams);
                const result = [];
                const foo = (newData, oldData, result) => {
                    // 1. 原始数据key值在历史数据中存在  2. 原始数据key值在历史数据中没有  3. 历史数据key值在原始数据中没有
                    //======================================遍历newData===================================//
                    for (let i = 0; i < newData.length; i++) {
                        if (newData[i].key === "" && newData[i].value === "" && newData[i].description === "") {
                            continue;
                        }
                        const newElement = newData[i]; //最新数据
                        const newElementKey = newElement.key; //最新数据key值
                        // const newElementValue = newElement.value; //最新数据value值
                        // const newElementType = newElement.type; //最新数据type值
                        // const newElementDescription = newElement.description; //最新数据description值
                        const oldElement = oldData.find((val) => val.key === newElementKey); //旧数据
                        let retData = {};
                        if (oldElement) { //原始数据key值在历史数据中存在
                            retData = this.generateDiffDocInfo(newElement, oldElement);
                            result.push(retData)
                        } else { //原始数据key值在历史数据中没有
                            retData = this.generateDiffDocInfo(newElement, null);
                            result.push(retData);
                        }
                        if (newElement.type === "object") {
                            foo(newElement.children, oldElement ? oldElement.children : [], retData.children);
                        }
                        if (newElement.type === "array") {
                            foo(newElement.children, oldElement ? oldElement.children : [], retData.children);
                        }
                    }      
                    //=====================================遍历oldData====================================//
                    for (let i = 0; i < oldData.length; i++) {
                        if (oldData[i].key === "" && oldData[i].value === "" && oldData[i].description === "") {
                            continue;
                        }
                        const oldElement = oldData[i]; //历史数据
                        const oldElementKey = oldElement.key; //历史数据key值
                        // const oldElementValue = oldElement.value; //历史数据value值
                        // const oldElementType = oldElement.type; //历史数据type值
                        // const oldElementDescription = oldElement.description; //历史数据description值
                        //=========================================================================//
                        const newElement = newData.find((val) => val.key === oldElementKey); //新数据
                        if (!newElement) { //原始数据key值在历史数据中存在
                            const retData = this.generateDiffDocInfo(null, oldElement);
                            result.push(retData)
                            if (oldElement.type === "object") {
                                foo(newElement ? newElement.children : [], oldElement ? oldElement.children : [], retData.children);
                            }
                            if (oldElement.type === "array") {
                                foo(newElement ? newElement.children : [], oldElement ? oldElement.children : [], retData.children);
                            }
                        } 
                    }                 
                }
                foo(newDocResponseParams, oldDocResponseParams, result);
                return result;
            } else {
                return {};
            }
        },
        generateDiffDocInfo(newElement, oldElement) {
            let oldNull = false;
            let newNull = false;
            if (!oldElement) { //保持数据一致
                oldElement = newElement;
                oldNull = true;
            }
            if (!newElement) { //保持数据一致
                newElement = oldElement;
                newNull = true;
            }
            const result = {
                key: {
                    new: newElement.key,
                    old: oldElement.key,
                },
                value: {
                    new: newElement.value,
                    old: oldElement.value,
                },
                type: {
                    new: newElement.type,
                    old: oldElement.type,
                },
                description: {
                    new: newElement.description,
                    old: oldElement.description,
                },
                children: [],
                operation: {
                    oldOp: "",
                    newOp: ""
                }, //add delete update
            };
            if (newElement.type !== oldElement.type || newElement.value !== oldElement.value || newElement.description !== oldElement.description) { //修改
                result.operation.oldOp = "edit";
                result.operation.newOp = "eidt";
            }
            if (oldNull) { 
                result.operation.oldOp = "empty"
                result.operation.newOp = "add"
            }
            if (newNull) { 
                result.operation.oldOp = "exist"
                result.operation.newOp = "delete"
            }
            return result;
        },
        //=====================================获取远程数据==================================//
        //获取文档历史修改记录
        handleGetHistoryRecord() {
            const params = {
                docId: this.currentSelectDoc._id
            };
            this.axios.get("/api/docs/docs_records", { params }).then((res) => {
                if (res.data && res.data.length > 0) {
                    const docInfo = res.data[0];
                    this.newDocInfo.base = {
                        creator: docInfo.creator,
                        docName: docInfo.docName,
                        method: docInfo.item.methods,
                        requestType: docInfo.item.requestType,
                        path: docInfo.item.url.path,
                    };
                    this.newDocInfo.header = docInfo.item.header;
                    this.newDocInfo.requestParams = docInfo.item.requestParams;
                    this.newDocInfo.responseParams = docInfo.item.responseParams;
                    if (res.data.length > 1){
                        this.generateOldDocInfo(res.data[1]);
                    }
                }
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        generateOldDocInfo(data) {
            const docInfo = data;
            this.oldDocInfo.base = {
                creator: docInfo.creator,
                docName: docInfo.docName,
                method: docInfo.item.methods,
                requestType: docInfo.item.requestType,
                path: docInfo.item.url.path,
            };
            this.oldDocInfo.header = docInfo.item.header;
            this.oldDocInfo.requestParams = docInfo.item.requestParams;
            this.oldDocInfo.responseParams = docInfo.item.responseParams;
        },
        handleSubmit() {
            
        },
        //=====================================其他操作=====================================//
        handleClose() {
            this.$emit("update:visible", false);
        },
    }
};
</script>



<style lang="scss">

</style>
