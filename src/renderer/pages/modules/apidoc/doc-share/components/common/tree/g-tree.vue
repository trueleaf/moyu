/**
    创建者：shuxiaokai
    创建时间：2019-11-01 14:19
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <div class="tree-wrap">
        <el-tree 
                :data="data" 
                :indent="30"
                :highlight-current="true"
                node-key="id" 
                :expand-on-click-node="false" 
                :render-content="renderContent" 
                default-expand-all
        >
        </el-tree>
    </div>
</template>

<script>
import uuid from "uuid/v4"
export default {
    props: {
        data: {
            type: Array,
            default() {
                return [];
            }
        },
        plain: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            //=====================================操作相关参数====================================//
            savedParams: [
                {
                    id: 1,
                    label: "name",
                    desc: "计划名称"
                },
                {
                    id: 2,
                    label: "age",
                    desc: "计划名称"
                }
            ], //用户已经保存的参数
            //=====================================其他参数====================================//
            isFirst: true
        };
    },
    watch: {
        data: {
            handler() {
                // console.log(this.isFirst, this.data, this.data[this.data.length - 1], this.data[this.data.length - 1].key)
                if (this.isFirst && this.data && this.data[this.data.length - 1] && this.data[this.data.length - 1].key) {
                    this.isFirst = false;
                    this.data.push({
                        id: uuid(),
                        key: "",
                        value: "",
                        description: "",
                        type: "",
                        required: true
                    })
                }
            },
            deep: true,
            immediate: true
        }
    },
    created() {

    },
    methods: {
        //=====================================请求参数相关====================================//
        /** 
            @description  渲染函数
            @author        shuxiaokai
            @create       2019-09-18 20:15"
        */
        renderContent(h, { node, data }) {
            const scopedSlots = {
                default: ({ item }) => {
                    return (
                        <div class="d-flex between dropdown-wrap">
                            <div>{ item.label }</div>
                            <div class="gray-400 dropdown-wrap-desc">{ item.children.description }</div>
                        </div>
                    );
                },
            }
            return (
                <div class="custom-tree-node">
                    <el-autocomplete vModel={data.key} size="mini" highlight-first-item fetch-suggestions={this.requestRemoteSuggestion} scopedSlots={scopedSlots} placeholder="请输入内容" on-select={(val) => { this.handleSelectRemoteData(val, data) }} on-input={() => {this.addNewLine(data)}} ></el-autocomplete>
                    <el-dropdown trigger="click" on-command={this.handleSelectParams}>
                        <span class="el-icon-paperclip"></span>
                        <div slot="dropdown">
                            <el-dropdown-menu>
                                <div class="manage-params d-flex a-center cursor-pointer">
                                    <span class="ml-1">配置自定义字段</span>
                                    <el-popover placement="top"trigger="hover" content="配置自定义字段" class="ml-auto mr-1 cursor-pointer">
                                        <span slot="reference" on-click={this.configParams}>
                                            <i class="el-icon-setting"></i>
                                        </span>    
                                    </el-popover>
                                </div>
                                { this.savedParams.map(val => {
                                    return <el-dropdown-item command={val}>
                                        <span class="d-flex between">
                                            <span>{val.label}</span>
                                            <span class="gray-500">{val.desc}</span>
                                        </span>
                                    </el-dropdown-item>
                                }) }
                            </el-dropdown-menu>                        
                        </div>

                    </el-dropdown>&nbsp;&nbsp;
                    { 
                        data.type === "boolean" ? <el-switch vModel={data.value} active-text="true" inactive-text="false"></el-switch> : <el-input vModel={data.value} size="mini" placeholder="参数值" disabled={data.type === "array" || data.type === "object"} maxlength="255" class="w-25"></el-input> 
                    }
                    &nbsp;&nbsp;
                    <el-select vModel={data.type} placeholder="类型" size="mini" class="w-10">
                        <el-option label="String" value="string"></el-option>
                        <el-option label="Number" value="number"></el-option>
                        <el-option label="Boolean" value="boolean"></el-option>
                        <el-option label="Object" value="object"></el-option>
                        <el-option label="List | Array" value="array"></el-option>
                    </el-select>
                    <el-checkbox vModel={data.required} label="必填" class="mx-1"></el-checkbox>
                    <el-input vModel={data.description} size="mini" placeholder="描述" maxlength="100" class="w-30 ml-1"></el-input>
                    { this.plain ? "" : <el-button type="text" icon="el-icon-plus" on-click={() => this.addNestTreeData(data)}></el-button> }
                    <el-button type="text" icon="el-icon-close" on-click={() => this.deleteTreeData(node, data)}></el-button>
                </div>
            );
        },
        /** 
            @description  新增一行请求参数
            @author        shuxiaokai
            @create       2019-09-18 20:16"
            @params       data<Object>当前节点数据
        */
        addNewLine(data) {
            let parentNode = this.data;
            const findNode = (treeData, nodeId) => {
                for (let i = 0; i < treeData.length; i++) {
                    if (treeData[i].id === nodeId) {
                        if (parentNode.some(val => !val.key || val.key.trim() === "")) {
                            return;
                        } else {
                            parentNode.push({
                                id: uuid(),
                                key: "",
                                value: "",
                                description: "",
                                type: "",
                                required: true
                            })
                            return;
                        }
                    } else if (treeData[i].children != null && treeData[i].children.length > 0) {
                        parentNode = treeData[i].children;
                        findNode(treeData[i].children, nodeId);
                    }
                }
            }
            findNode(this.data, data.id);
        },
        /** 
            @description  新增一个嵌套请求参数
            @author        shuxiaokai
            @create       2019-09-19 10:45"
            @params       data<Object>当前节点数据
        */
        addNestTreeData(data) {
            if (data.children == null) {
                this.$set(data, "children", [])
            }
            // if (data.children.some(val => val.key.trim() === "")) {
            //     return;
            // }
            data.children.push({
                id: uuid(),
                key: "",
                description: "",
                type: "",
                value: "",
                required: true
            })
        }, 
        /** 
            @description  删除请求参数
            @author        shuxiaokai
            @create       2019-09-19 10:44"
            @params       node<Object>当前节点
            @params       data<Object>节点数据
        */
        deleteTreeData(node, data) {
            const id = data.id || data._id;
            if (!id) {
                throw new Error("该节点不存在id值");
            }
            const rootData = this.data;
            let parentNode = rootData;
            if (node.level === 1 && this.data.length > 1) {
                for (let i = 0; i < this.data.length; i++) {
                    if (this.data[i].id === data.id) {
                        this.data.splice(i, 1)
                        return;
                    }
                }
            }
            const deleteNode = (treeData, deleteId) => {
                for (let i = 0; i < treeData.length; i++) {
                    if (treeData[i].id === deleteId) {
                        if (node.isLevel !== 1 && data.key.trim() === "" && parentNode.length !== 1) {
                            return
                        } else if (node.isLevel === 1 && data.key.trim() === "") {
                            return
                        } else if (rootData.length === 1 && (node.level === 1 || rootData[0].children == null || rootData[0].children.length === 0)) {
                            return;
                        } else {
                            treeData.splice(i, 1);
                            return;
                        }
                    } else if (treeData[i].children != null && treeData[i].children.length > 0) {
                        parentNode = treeData[i].children
                        deleteNode(treeData[i].children, deleteId);
                    }
                }
            }
            deleteNode(this.data, id);
        },
        /** 
            @description  配置常见请求头参数
            @author        shuxiaokai
            @create       2019-09-19 10:52"
        */
        configParams() {

        },
        /** 
            @description  配置常见请求头参数
            @author        shuxiaokai
            @create       2019-09-19 10:52"
        */
        handleSelectParams(val) {
            console.log(val)
        },
        /** 
            @description  上传请求json参数
            @author        shuxiaokai
            @create       2019-09-19 14:04"
        */
        handleUploadRequestJson() {},
        //=====================================远程联想数据====================================//
        requestRemoteSuggestion(queryString, cb) {
            if (!queryString || queryString.trim().length < 2) {
                cb([]);
                return;
            }
            const params = {
                name: queryString.trim().replace(/\\/, ""),
                projectId: this.$route.query._id
            };
            this.axios.get("/api/project/doc_params_mind", { params }).then(res => {
                cb(res.data);                
            }).catch(err => {
                this.$errorThrow(err, this);
            });
        },
        /** 
            @description  获取远程联想数据
            @author        shuxiaokai
            @create       2019-10-28 11:29"
            @params       
            @return       null
        */
        handleSelectRemoteData(val, data) {
            data.description = val.children.description;
            data.key = val.label;
            data.required = val.children.required;
            data.value = val.children.value;
            data.type = val.children.type;
            console.log(val, data)
        },
    }
};
</script>



<style lang="scss">
    .tree-wrap {
        .el-tree-node {
            margin-top: 20px;
        }        
    }

</style>
