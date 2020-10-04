/*
    创建者：shuxiaokai
    创建时间：2020-09-12 17:47
    模块名称：自动前后端代码生成
    备注：xxxx
*/
<template>
    <div class="easycode px-5 py-5">
        <div class="d-flex j-between">
            <s-fieldset title="基本信息" class="w-19">
                <s-label-value label="模型名称：" label-width="120px">
                    <el-input v-model="formInfo.modelName" size="mini" placeholder="例如：doc,userInfo 驼峰命名" class="w-100" maxlength="100" clearable></el-input>
                </s-label-value>
                <s-label-value label="模型描述：" label-width="120px">
                    <el-input v-model="formInfo.description" size="mini" placeholder="例如：企业用户模型" class="w-100" maxlength="100" clearable></el-input>
                </s-label-value>
                <s-label-value label="文件路径：" label-width="120px">
                    <el-input v-model="formInfo.path" size="mini" placeholder="使用/分隔：api/user" class="w-100" maxlength="100" clearable></el-input>
                </s-label-value>
                <s-label-value label="开发者：" label-width="120px">
                    <el-input v-model="formInfo.creator" size="mini" placeholder="例如：shuxiaokai" class="w-100" maxlength="100" clearable></el-input>
                </s-label-value>
            </s-fieldset>
            <s-fieldset title="模型" class="w-80">
                <div>
                    <s-params-tree title="字段信息：" label-width="120px" :tree-data="treeData"></s-params-tree>
                </div>            
            </s-fieldset>
        </div>
        <s-fieldset title="增删改查配置">
            <div>
                <el-checkbox-group v-model="formInfo.curd">
                    <el-checkbox label="create">新增</el-checkbox>
                    <el-checkbox label="update">修改</el-checkbox>
                    <el-checkbox label="readById">单个查询</el-checkbox>
                    <el-checkbox label="readList">列表查询</el-checkbox>
                    <el-checkbox label="readEnum">枚举查询</el-checkbox>
                    <el-checkbox label="delete">删除</el-checkbox>
                </el-checkbox-group>    
                <div class="d-flex j-between flex-wrap">
                    <!-- 新增 -->
                    <div v-show="formInfo.curd.includes('create')" class="op-config">
                        <div class="header">新增配置</div>
                        <div class="px-2 py-2">
                            <el-table :data="treeData" stripe border size="mini">
                                <el-table-column prop="key" label="字段" align="center"></el-table-column>
                                <el-table-column label="有效" align="center">
                                    <template slot-scope="scope">
                                        <el-checkbox v-model="scope.row._enableAdd"></el-checkbox>
                                    </template>
                                </el-table-column>
                                <el-table-column label="是否唯一" align="center">
                                    <template slot-scope="scope">
                                        <el-checkbox v-model="scope.row._uniqueAdd"></el-checkbox>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <!-- 修改 -->
                    <div v-show="formInfo.curd.includes('update')" class="op-config">
                        <div class="header">修改配置</div>
                        <div class="px-2 py-2">
                            <el-table :data="treeData" stripe border size="mini">
                                <el-table-column prop="key" label="字段" align="center"></el-table-column>
                                <el-table-column label="有效" align="center">
                                    <template slot-scope="scope">
                                        <el-checkbox v-model="scope.row._enableEdit"></el-checkbox>
                                    </template>
                                </el-table-column>
                                <el-table-column label="是否唯一" align="center">
                                    <template slot-scope="scope">
                                        <el-checkbox v-model="scope.row._uniqueEdit"></el-checkbox>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <!-- 查询单个 -->
                    <div v-show="formInfo.curd.includes('readById')" class="op-config">
                        <div class="header">单个查询配置</div>
                        <div class="px-2 py-2">
                            <el-table :data="treeData" stripe border size="mini">
                                <el-table-column prop="key" label="字段" align="center"></el-table-column>
                                <el-table-column label="是否返回当前字段" align="center">
                                    <template slot-scope="scope">
                                        <el-checkbox v-model="scope.row._enableField"></el-checkbox>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <!-- 列表查询 -->
                    <div v-show="formInfo.curd.includes('readList')" class="op-config">
                        <div class="header">列表查询配置</div>
                        <div class="px-2 py-2">
                            <el-table :data="treeData" stripe border size="mini">
                                <el-table-column prop="key" label="字段" align="center"></el-table-column>
                                <el-table-column label="是否查询当前字段" align="center">
                                    <template slot-scope="scope">
                                        <el-checkbox v-model="scope.row._enableList"></el-checkbox>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <!-- 枚举查询 -->
                    <div v-show="formInfo.curd.includes('readEnum')" class="op-config">
                        <div class="header">枚举查询</div>
                        <div class="px-2 py-2">
                            <el-table :data="treeData" stripe border size="mini">
                                <el-table-column prop="key" label="字段" align="center"></el-table-column>
                                <el-table-column label="是否查询当前字段" align="center">
                                    <template slot-scope="scope">
                                        <el-checkbox v-model="scope.row._enableEnumField"></el-checkbox>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <!-- 删除 -->
                    <div v-show="formInfo.curd.includes('delete')" class="op-config">
                        <div class="header">删除配置</div>
                        <div class="px-1 py-1"></div>
                    </div>
                </div>            
            </div>            
        </s-fieldset>
        <s-card>
            <div class="d-flex j-between flex-wrap">
                <div class="w-30">
                    <h2>model</h2>
                    <div class="code-area scroll-y-400">
                        <pre class="">{{ modelValue }}</pre>
                        <div v-copy="modelValue" class="operate green cursor-pointer">复制</div>
                    </div>
                </div>
                <div class="w-30">
                    <h2>controller</h2>
                    <div class="code-area scroll-y-400">
                        <pre class="">{{ controllerValue }}</pre>
                        <div v-copy="controllerValue" class="operate green cursor-pointer">复制</div>
                    </div>
                </div>
                <div class="w-30">
                    <h2>service</h2>
                    <div class="code-area scroll-y-400">
                        <pre class="">{{ serviceValue }}</pre>
                        <span v-copy="serviceValue" class="operate green cursor-pointer">复制</span>
                    </div>
                </div>
                <div class="w-50">
                    <h2>路由</h2>
                    <div class="code-area scroll-y-400">
                        <pre class="">{{ routerValue }}</pre>
                        <span v-copy="routerValue" class="operate green cursor-pointer">复制</span>
                    </div>
                </div>
            </div>
        </s-card>
    </div>
</template>

<script>
import paramsTree from "./components/params-tree";
import camelCase from "camelcase"
import beautify from "js-beautify"
export default {
    components: {
        "s-params-tree": paramsTree,
    },
    computed: {
        modelValue() {
            const result = this.convertTreeDataToMongooseModelData();
            return result;
        },
        controllerValue() {
            const result = this.convertTreeDataToMongooseControllerData();
            return result;
        },
        serviceValue() {
            const result = this.convertTreeDataToMongooseServiceData();
            return result;
        },
        routerValue() {
            const result = this.convertTreeDataToMongooseRoutereData();
            return result;
        },
    },
    data() {
        return {
            formInfo: {
                modelName: "user", //模型名称
                creator: "shuxiaokai", //创建者名称
                description: "用户",
                curd: ["create", "update", "readList", "readById", "readEnum", "delete"], //增删改查, create update readEnum readList readById delete 
                // curd: ["readEnum"], //增删改查, create update readEnum readList readById delete 
                path: "apidoc/doc"
            },
            rules: {},
            listParams: [
                {
                    key: "pageSize",
                    type: "string",
                    comment: "每页数据大小",
                    required: true,
                    default: "10",
                    _enableList: true
                },
                {
                    key: "pageNum",
                    type: "string",
                    comment: "当前页码",
                    required: false,
                    default: "1",
                    _enableList: true
                },
                {
                    key: "startTime",
                    type: "string",
                    comment: "起始日期",
                    required: false,
                    default: "1",
                    _enableList: true
                },
                {
                    key: "endTime",
                    type: "string",
                    comment: "结束日期",
                    required: false,
                    default: "1",
                    _enableList: true
                }
            ],
            treeData: [
                {
                    key: "", 
                    type: "String",
                    default: "",
                    required: true,
                    children: [],
                    comment: "",
                    stringOp: {
                        limit: [],
                        minlength: 0,
                        maxlength: 255,
                        enum: "",
                        match: null,
                    },
                    numberOp: {
                        limit: [],
                        min: 0,
                        max: 999999,
                        enum: "",
                    },
                    DateOp: {},
                    _enableAdd: true,
                    _enableEdit: true,
                    _enableList: false,
                    _enableField: true,
                    _enableEnumField: false,
                    _uniqueAdd: false,
                    _uniqueEdit: false,
                    _tip: ""

                }
            ],
        };
    },
    watch: {
        formInfo: {
            handler() {
                const config = {
                    formInfo: this.formInfo,
                    treeData: this.treeData
                }
                localStorage.setItem("easycode/config", JSON.stringify(config))
            },
            deep: true
        },
        treeData: {
            handler() {
                const config = {
                    formInfo: this.formInfo,
                    treeData: this.treeData
                }
                localStorage.setItem("easycode/config", JSON.stringify(config))
            },
            deep: true
        },
    },
    created() {
        this.initLocalData(); //初始化本地数据
    },
    methods: {
        initLocalData() {
            let codeConfig = localStorage.getItem("easycode/config");
            if (codeConfig) {
                codeConfig = JSON.parse(codeConfig);
                this.formInfo = codeConfig.formInfo;
                this.treeData = codeConfig.treeData;
            }
        },
        //=====================================Model转换====================================//
        //转换参数为mongooseModel
        convertTreeDataToMongooseModelData() {
            let result = "";
            const copyTreeData = JSON.parse(JSON.stringify(this.treeData));
            const foo = (treeData) => {
                let schemaStr = ""; //schema内部数据
                for (let i = 0; i < treeData.length; i++) {
                    const el = treeData[i];
                    const key = el.key; //key
                    const type = el.type; //类型
                    const defaultValue = el.default; //默认值
                    const comment = el.comment; //注释
                    const required = el.required; //是否必填
                    if (key === "") {
                        continue;
                    }
                    //=========================================================================//
                    if (type === "String") { //字符串
                        schemaStr += this.convertString(el);
                    } else if (type === "Number") { //数字
                        schemaStr += this.convertNumber(el);
                    } else if (type === "Boolean") { //布尔值
                        schemaStr += this.convertBoolean(el);
                    } else if (type === "ObjectId") { //objectId
                        schemaStr += this.convertObjectId(el);
                    } else if (type === "Object") { //对象
                        schemaStr += `
                            ${el.key}: { //${el.comment}
                                ${foo(treeData[i].children)}
                            },
                        `;
                    } else if (type === "Array") { //数组
                        schemaStr += `
                            ${el.key}: [{ //${el.comment}
                                ${foo(treeData[i].children)}
                            }],
                        `;
                    }
                }
                return schemaStr;
            }
            result = foo(copyTreeData);
            result = `/**\n    @description  ${this.formInfo.description}模型\n    @author       ${this.formInfo.creator}\n    @create       ${new Date().toLocaleString()}\n*/\n
                module.exports = app => {
                    const mongoose = app.mongoose;
                    const Schema = mongoose.Schema;
                    const ${camelCase(this.formInfo.modelName)}Schema = new Schema({${result}}, { timestamps: true });
                    return mongoose.model("${this.formInfo.modelName}", ${camelCase(this.formInfo.modelName)}Schema);
                };
            `
            result = beautify(result, { indent_size: 4, "end-with-newline": true, preserve_newlines: false })
            return result;
        },
        //转换数字类型
        convertNumber(el) {
            let result = "";
            const numberLimit = el.numberOp.limit; //数字限制
            const numberMaxLength = el.numberOp.max; //数字最大值
            const numberMinLength = el.numberOp.min; //数字最小值
            const numberEnum = el.numberOp.enum.split(","); //数字枚举值
            let numberLimitStr = "";
            let numberEnumStr = "";
            //数字类型限制条件
            for (let i = 0; i < numberLimit.length; i++) {
                numberLimitStr += `${numberLimit[i]}: true,`
            }
            //数字枚举
            for (let i = 0; i < numberEnum.length; i++) {
                if (isNaN(Number(numberEnum[i]))) {
                    console.warn("数字枚举值只能为数字")
                }
                if (i === numberEnum.length - 1) {
                    numberEnumStr += `${numberEnum[i]}`
                } else {
                    numberEnumStr += `${numberEnum[i]},`
                }
            }
            const a = `${el.default ? `default: "${Number(el.default)}",` : ""}`;
            const b = `${numberLimitStr ? numberLimitStr : ""}`;
            const c = `${(numberMinLength != null) ? `min: ${numberMinLength},` : ""}`;
            const d = `${(numberMaxLength != null) ? `max: ${numberMaxLength},` : ""}`;
            const e = `${numberEnumStr ? `enum: [${numberEnumStr}],` : ""}`;
            const f = `${el.required ? `required: true,` : ""}`;
            result = `
                ${el.key}: { //${el.comment}
                    type: ${el.type},${a}${b}${c}${d}${e}${f}
                },
            `;
            return result;
        },
        //转换字符串类型
        convertString(el) {
            let result = "";
            const stringLimit = el.stringOp.limit; //字符串限制
            const stringEnum= el.stringOp.enum.trim() === "" ? [] : el.stringOp.enum.split(","); //字符串枚举
            const stringMaxLength = el.stringOp.maxlength; //字符串最大值
            const stringMinLength = el.stringOp.minlength; //字符串最小值
            let stringLimitStr = "";
            let stringEnumStr = "";
            //字符串限制条件
            for (let i = 0; i < stringLimit.length; i++) {
                stringLimitStr += `${stringLimit[i]}: true,`
            }
            //字符串枚举
            for (let i = 0; i < stringEnum.length; i++) {
                if (i === stringEnum.length - 1) {
                    stringEnumStr += `"${stringEnum[i]}"`
                } else {
                    stringEnumStr += `"${stringEnum[i]}",`
                }
            }
            const a = `${el.default ? `default: "${el.default}",` : ""}`;
            const b = `${stringLimitStr ? stringLimitStr : ""}`;
            const c = `${(stringMinLength != null) ? `minlength: ${stringMinLength},` : ""}`;
            const d = `${(stringMaxLength != null) ? `maxlength: ${stringMaxLength},` : ""}`;
            const e = `${(stringEnum.length > 0) ? `enum: [${stringEnumStr}],` : ""}`;
            const f = `${el.required ? `required: true,` : ""}`;
            result = `
                ${el.key}: { //${el.comment}
                    type: ${el.type},${a}${b}${c}${d}${e}${f}
                },
            `;
            return result;
        },
        //转换布尔类型
        convertBoolean(el) {
            let result = "";
            const a = `${el.default ? `default: ${!!el.default},` : ""}`;
            const b = `${el.required ? `required: true,` : ""}`;
            result = `
                ${el.key}: { //${el.comment}
                    type: ${el.type},${a}${b}
                },
            `;
            return result;
        },
        //转换为objectId
        convertObjectId(el) {
            let result = "";
            result = `
                ${el.key}: { //${el.comment}
                    type: mongoose.Schema.Types.ObjectId,
                    ${el.required ? `required: true,` : ""}
                },
            `;
            return result;
        },
        //=====================================Controller转换====================================//
        convertTreeDataToMongooseControllerData() {
            const createControllerStr = (this.formInfo.curd.includes("create")) ? this.generateCreateController() : "";
            const updateControllerStr = (this.formInfo.curd.includes("update")) ? this.generateUpdateController() : "";
            const readListControllerStr = (this.formInfo.curd.includes("readList")) ? this.generateReadListController() : "";
            const readEnumControllerStr = (this.formInfo.curd.includes("readEnum")) ? this.generateReadEnumController() : "";
            const readByIdControllerStr = (this.formInfo.curd.includes("readById")) ? this.generateReadByIdController() : "";
            const deleteControllerStr = (this.formInfo.curd.includes("delete")) ? this.generateDeleteController() : "";
            
            let result = `
                /** 
                    @description  ${this.formInfo.description}控制器
                    @author       ${this.formInfo.creator}
                    @create       ${new Date().toLocaleString()}
                */
                const Controller = require("egg").Controller;
                class ${camelCase(this.formInfo.modelName, { pascalCase: true })}Controller extends Controller {
                    ${createControllerStr}
                    ${readListControllerStr}
                    ${readEnumControllerStr}
                    ${readByIdControllerStr}
                    ${updateControllerStr}
                    ${deleteControllerStr}
                }
                module.exports = ${camelCase(this.formInfo.modelName, { pascalCase: true })}Controller;
            `;
            result = beautify(result, { indent_size: 4, "end-with-newline": true, preserve_newlines: false })
            return result;
        },
        //新增
        generateCreateController() {
            const copyTreeData = JSON.parse(JSON.stringify(this.treeData));
            let comments = "";
            let reqRule = "";
            for (let i = 0; i < copyTreeData.length; i++) {
                const el = copyTreeData[i];
                const key = el.key; //key
                const type = el.type; //类型
                const defaultValue = el.default; //默认值
                const comment = el.comment; //注释
                const required = el.required; //是否必填
                if (key === "") continue;
                if (el._enableAdd) {
                    comments += `\n    @param {${type.toLowerCase()}${required ? "" : "?"}}        ${key} ${comment}`;
                    reqRule += `${key}: { type: "${type.toLowerCase()}" },`;
                }
            }
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}新增${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            async ${camelCase(`create_${this.formInfo.modelName}`)}() {
                try {
                    const params = this.ctx.request.body;
                    const reqRule = {
                        ${reqRule}
                    };
                    this.ctx.validate(reqRule, params);
                    const result = await this.ctx.service.${this.formInfo.path.split("/").join(".")}.${camelCase(`create_${this.formInfo.modelName}`)}(params);
                    this.ctx.helper.successResponseData(result);
                } catch (error) {
                    this.ctx.helper.throwError(error);
                    return;
                }
            }
            `;
            return result;
        },
        //修改
        generateUpdateController() {
            const copyTreeData = JSON.parse(JSON.stringify(this.treeData));
            let comments = "\n    @param {String}         _id 数据id";
            let reqRule = `_id: { type: "string" },`;
            for (let i = 0; i < copyTreeData.length; i++) {
                const el = copyTreeData[i];
                const key = el.key; //key
                const type = el.type; //类型
                const defaultValue = el.default; //默认值
                const comment = el.comment; //注释
                const required = el.required; //是否必填
                if (key === "") continue;
                comments += `\n    @param {${type.toLowerCase()}?}        ${key} ${comment}`;
                reqRule += `${key}: { type: "${type.toLowerCase()}", required: false },`;
            }
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}修改${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            \nasync ${camelCase(`update_${this.formInfo.modelName}`)}() {
                try {
                    const params = this.ctx.request.body;
                    const reqRule = {
                        ${reqRule}
                    };
                    this.ctx.validate(reqRule, params);
                    const result = await this.ctx.service.${this.formInfo.path.split("/").join(".")}.${camelCase(`update_${this.formInfo.modelName}`)}(params);
                    this.ctx.helper.successResponseData(result);
                } catch (error) {
                    this.ctx.helper.throwError(error);
                    return;
                }
            }
            `;
            return result;
        },
        //列表查询
        generateReadListController() {
            let comments = "";
            let reqRule = ``;
            for (let i = 0; i < this.listParams.length; i++) {
                const el = this.listParams[i];
                const key = el.key; //key
                const type = el.type; //类型
                const defaultValue = el.default; //默认值
                const comment = el.comment; //注释
                let defaultValueStr = "";
                if (type === "string") {
                    defaultValueStr = `"${defaultValue}"`;
                }
                const required = el.required; //是否必填
                comments += `\n    @param {${type.toLowerCase()}${(!required || defaultValue) ? "?" : ""}}        ${key} ${comment}`;
                reqRule += `${key}: { type: "${type.toLowerCase()}", ${(!required || defaultValue) ? "required: false," : ""} ${defaultValue ? `default: ${defaultValueStr}` : ""}},`;
            }
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}以列表形式获取${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            \nasync ${camelCase(`read_${this.formInfo.modelName}_list`)}() {
                try {
                    const params = this.ctx.request.query;
                    const reqRule = {
                        ${reqRule}
                    };
                    this.ctx.validate(reqRule, params);
                    const result = await this.ctx.service.${this.formInfo.path.split("/").join(".")}.${camelCase(`read_${this.formInfo.modelName}_list`)}(params);
                    this.ctx.helper.successResponseData(result);
                } catch (error) {
                    this.ctx.helper.throwError(error);
                    return;
                }
            }
            `;
            return result;
        },
        //枚举形式读取
        generateReadEnumController() {
            let comments = "";
            let reqRule = ``;
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}以枚举形式获取${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            \nasync ${camelCase(`read_${this.formInfo.modelName}_enum`)}() {
                try {
                    const params = this.ctx.request.query;
                    const reqRule = {
                        ${reqRule}
                    };
                    this.ctx.validate(reqRule, params);
                    const result = await this.ctx.service.${this.formInfo.path.split("/").join(".")}.${camelCase(`read_${this.formInfo.modelName}_enum`)}(params);
                    this.ctx.helper.successResponseData(result);
                } catch (error) {
                    this.ctx.helper.throwError(error);
                    return;
                }
            }
            `;
            return result;
        },
        //根据id查询详情
        generateReadByIdController() {
            let comments = `\n    @param {string}        _id 详情数据id`;
            let reqRule = `_id: { type: "string" }`;
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}根据id查询${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            \nasync ${camelCase(`read_${this.formInfo.modelName}_byId`)}() {
                try {
                    const params = this.ctx.request.query;
                    const reqRule = {
                        ${reqRule}
                    };
                    this.ctx.validate(reqRule, params);
                    const result = await this.ctx.service.${this.formInfo.path.split("/").join(".")}.${camelCase(`read_${this.formInfo.modelName}_byId`)}(params);
                    this.ctx.helper.successResponseData(result);
                } catch (error) {
                    this.ctx.helper.throwError(error);
                    return;
                }
            }
            `;
            return result;
        },
        //删除
        generateDeleteController() {
            let comments = `\n    @param {array}        ids 需要删除数据id数组`;
            let reqRule = `ids: { type: "array" }`;
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}根据id删除${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            \nasync ${camelCase(`delete_${this.formInfo.modelName}`)}() {
                try {
                    const params = this.ctx.request.body;
                    const reqRule = {
                        ${reqRule}
                    };
                    this.ctx.validate(reqRule, params);
                    const result = await this.ctx.service.${this.formInfo.path.split("/").join(".")}.${camelCase(`delete_${this.formInfo.modelName}`)}(params);
                    this.ctx.helper.successResponseData(result);
                } catch (error) {
                    this.ctx.helper.throwError(error);
                    return;
                }
            }
            `;
            return result;
        },
        
        //=====================================Service转换====================================//
        convertTreeDataToMongooseServiceData() {
            const createServiceStr = (this.formInfo.curd.includes("create")) ? this.generateCreateService() : "";
            const updateServiceStr = (this.formInfo.curd.includes("update")) ? this.generateUpdateService() : "";
            const readListServiceStr = (this.formInfo.curd.includes("readList")) ? this.generateReadListService() : "";
            const readEnumServiceStr = (this.formInfo.curd.includes("readEnum")) ? this.generateReadEnumService() : "";
            const deleteServiceStr = (this.formInfo.curd.includes("delete")) ? this.generateDeleteService() : "";
            const readByIdServiceStr = (this.formInfo.curd.includes("readById")) ? this.generateReadByIdService() : "";
            let result = `
                /** 
                    @description  ${this.formInfo.description}服务
                    @author       ${this.formInfo.creator}
                    @create       ${new Date().toLocaleString()}
                */
                const Service = require("egg").Service;
                const escapeStringRegexp = require("escape-string-regexp");
                class ${camelCase(this.formInfo.modelName, { pascalCase: true })}Service extends Service {
                    ${createServiceStr}
                    ${readListServiceStr}
                    ${readByIdServiceStr}
                    ${readEnumServiceStr}
                    ${updateServiceStr}
                    ${deleteServiceStr}
                }
                module.exports = ${camelCase(this.formInfo.modelName, { pascalCase: true })}Service;
            `;
            result = beautify(result, { indent_size: 4, "end-with-newline": true, preserve_newlines: false })
            return result;
        },
        //新增
        generateCreateService() {
            const copyTreeData = JSON.parse(JSON.stringify(this.treeData));
            let comments = ""; //前置注释
            let reqeustParamsStr = "";
            let uniqueStr = "";
            const filePathArr = this.formInfo.path.split("/");
            let filePathStr = "";
            let docStr = ""; //被创建文档信息
            for (let i = 0; i < filePathArr.length; i++) {
                const element = filePathArr[i];
                filePathStr += `${camelCase(element, { pascalCase: true })}.`
            }
            for (let i = 0; i < copyTreeData.length; i++) {
                const el = copyTreeData[i];
                const key = el.key; //key
                const type = el.type; //类型
                const defaultValue = el.default; //默认值
                const comment = el.comment; //注释
                const required = el.required; //是否必填
                if (key === "" || !el._enableAdd) continue;
                if (el._uniqueAdd) {
                    uniqueStr += `
                        // 判断${comment}是否已经存在
                        const ${camelCase(`has_${key}`)} = await this.ctx.model.${filePathStr}findOne({ projectName, enabled: true });
                        if (${camelCase(`has_${key}`)}) {
                            this.ctx.helper.errorInfo("${comment}已经存在", 1003);
                        }
                    `
                }
                reqeustParamsStr += `${key},`
                comments += `\n    @param {${type.toLowerCase()}${required ? "" : "?"}}        ${key} ${comment}`;
                docStr += `doc.${key} = ${key};`
            }
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}新增${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            async ${camelCase(`create_${this.formInfo.modelName}`)}(params) {
                ${ reqeustParamsStr ?  `const { ${reqeustParamsStr} } = params;` : ""}
                ${uniqueStr ? uniqueStr : ""}
                const doc = {};
                ${docStr ? docStr : ""}
                await this.ctx.model.${filePathStr}create(doc);
                return;
            }
            `;
            return result;
        },
        //修改
        generateUpdateService() {
            const copyTreeData = JSON.parse(JSON.stringify(this.treeData));
            let comments = "\n    @param {String}         _id 数据id"; //前置注释
            let reqeustParamsStr = "_id,";
            let uniqueStr = "";
            const filePathArr = this.formInfo.path.split("/");
            let filePathStr = "";
            let docStr = "doc._id = _id;"; //被创建文档信息
            for (let i = 0; i < filePathArr.length; i++) {
                const element = filePathArr[i];
                filePathStr += `${camelCase(element, { pascalCase: true })}.`
            }
            for (let i = 0; i < copyTreeData.length; i++) {
                const el = copyTreeData[i];
                const key = el.key; //key
                const type = el.type; //类型
                const defaultValue = el.default; //默认值
                const comment = el.comment; //注释
                const required = el.required; //是否必填
                if (key === "" || !el._enableEdit) continue;
                if (el._uniqueEdit) {
                    uniqueStr += `
                        // 判断${comment}是否已经存在
                        const ${camelCase(`has_${key}`)} = await this.ctx.model.${filePathStr}findOne({ _id: { $ne: _id }, ${key} });
                        if (${camelCase(`has_${key}`)}) {
                            this.ctx.helper.errorInfo("${comment}已经存在", 1003);
                        }
                    `
                }
                reqeustParamsStr += `${key},`
                comments += `\n    @param {${type.toLowerCase()}?}        ${key} ${comment}`;
                docStr += `doc.${key} = ${key};`
            }
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}修改${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            async ${camelCase(`update_${this.formInfo.modelName}`)}(params) {
                ${ reqeustParamsStr ?  `const { ${reqeustParamsStr} } = params;` : ""}
                const doc = {};
                ${docStr ? docStr : ""}
                ${uniqueStr ? uniqueStr : ""}
                await this.ctx.model.${filePathStr}findByIdAndUpdate({ _id }, doc);
                return;
            }
            `;
            return result;
        },
        //列表查询
        generateReadListService() {
            const copyTreeData = JSON.parse(JSON.stringify(this.treeData));
            let comments = ""; //前置注释
            const filePathArr = this.formInfo.path.split("/");
            let filePathStr = "";
            let reqeustParamsStr = "";
            let queryStr = "";
            for (let i = 0; i < filePathArr.length; i++) {
                const element = filePathArr[i];
                filePathStr += `${camelCase(element, { pascalCase: true })}.`
            }
            const listParams = this.listParams.concat(copyTreeData);
            for (let i = 0; i < listParams.length; i++) {
                const el = listParams[i];
                const key = el.key; //key
                const type = el.type; //类型
                const defaultValue = el.default; //默认值
                const comment = el.comment; //注释
                let defaultValueStr = "";
                if (type === "string") {
                    defaultValueStr = `"${defaultValue}"`;
                }
                const required = el.required; //是否必填
                if (el._enableList) {
                    reqeustParamsStr += `${key},`
                    comments += `\n    @param {${type.toLowerCase()}${(!required || defaultValue) ? "?" : ""}}        ${key} ${comment}`;
                }
            }
            for (let i = 0; i < copyTreeData.length; i++) {
                const el = copyTreeData[i];
                if (el._enableList) {
                    queryStr += `
                        if (${el.key}) {
                            query.${el.key} = new RegExp(escapeStringRegexp(${el.key}));
                        }
                    `;
                }
            }
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}以列表形式获取${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            async ${camelCase(`read_${this.formInfo.modelName}_list`)}(params) {
                ${ reqeustParamsStr ?  `const { ${reqeustParamsStr} } = params;` : ""}
                    const query = {
                        enabled: true,
                    };
                    let skipNum = 0;
                    let limit = 100;
                    if (pageSize != null && pageNum != null) {
                        skipNum = (pageNum - 1) * pageSize;
                        limit = pageSize;
                    }
                    if (startTime != null && endTime != null) {
                        query.createdAt = { $gt: startTime, $lt: endTime };
                    }
                    ${queryStr ? queryStr : ""}
                    const rows = await this.ctx.model.${filePathStr}find(query).skip(skipNum).limit(limit);
                    const total = await this.ctx.model.${filePathStr}find(query).countDocuments();
                    const result = {};
                    result.rows = rows;
                    result.total = total;
                return result;
            }
            `;
            return result;
        },
        //单个查询
        generateReadByIdService() {
            const copyTreeData = JSON.parse(JSON.stringify(this.treeData));
            let comments = `\n    @param {string}        _id ${this.formInfo.description}id`;
            let filePathStr = "";
            let showFieldStr = "";
            const filePathArr = this.formInfo.path.split("/");
            for (let i = 0; i < filePathArr.length; i++) {
                const element = filePathArr[i];
                filePathStr += `${camelCase(element, { pascalCase: true })}.`
            }
            for (let i = 0; i < copyTreeData.length; i++) {
                const el = copyTreeData[i];
                if (!el._enableField) {
                    showFieldStr += `${el.key}: 0,`;
                }
            }
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}根据id获取${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            async ${camelCase(`read_${this.formInfo.modelName}_byId`)}(params) {
                const { _id } = params;
                const result = await this.ctx.model.${filePathStr}findOne({ _id, enabled: true }${showFieldStr ? `, { ${showFieldStr} }` : ""});
                return result;
            }
            `;
            return result;
        },
        generateReadEnumService() {
            const copyTreeData = JSON.parse(JSON.stringify(this.treeData));
            let comments = ``;
            let filePathStr = "";
            let showFieldStr = "";
            const filePathArr = this.formInfo.path.split("/");
            for (let i = 0; i < filePathArr.length; i++) {
                const element = filePathArr[i];
                filePathStr += `${camelCase(element, { pascalCase: true })}.`
            }
            for (let i = 0; i < copyTreeData.length; i++) {
                const el = copyTreeData[i];
                if (el._enableEnumField) {
                    showFieldStr += `${el.key}: 1,`;
                }
            }
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}以枚举形式获取${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            async ${camelCase(`read_${this.formInfo.modelName}_enum`)}(params) {
                const limit = 100;
                const result = await this.ctx.model.${filePathStr}find({ enabled: true }${showFieldStr ? `, { ${showFieldStr} }` : ""}).limit(limit);
                return result;
            }
            `;
            return result;
        },
        //删除
        generateDeleteService() {
            const copyTreeData = JSON.parse(JSON.stringify(this.treeData));
            let comments = `\n    @param {string}        ids ${this.formInfo.description}id数组`;
            let filePathStr = "";
            let showFieldStr = "";
            const filePathArr = this.formInfo.path.split("/");
            for (let i = 0; i < filePathArr.length; i++) {
                const element = filePathArr[i];
                filePathStr += `${camelCase(element, { pascalCase: true })}.`
            }
            for (let i = 0; i < copyTreeData.length; i++) {
                const el = copyTreeData[i];
                if (!el._enableField) {
                    showFieldStr += `${el.key}: 0,`;
                }
            }
            const desc = this.formInfo.description;
            const creator = this.formInfo.creator;
            const space = " ".repeat(4);
            const time = new Date().toLocaleString();
            let result = `\n/**\n${space}@description${space}根据id删除${desc}\n${space}@author${space}${space} ${creator}\n${space}@create${space}${space} ${time}${comments}\n${space}@return${space}null\n*/
            async ${camelCase(`delete_${this.formInfo.modelName}`)}(params) {
                const { ids } = params;
                const result = await this.ctx.model.${filePathStr}updateMany({ _id: { $in: ids }}, { $set: { enabled: false }});
                return result;
            }
            `;
            return result;
        },
        //=====================================Router转换====================================//
        convertTreeDataToMongooseRoutereData() {
            let routerStr = "";
            const descStr = this.formInfo.description;
            let filePathStr = "";
            const filePathArr = this.formInfo.path.split("/");
            for (let i = 0; i < filePathArr.length; i++) {
                const element = filePathArr[i];
                filePathStr += `${camelCase(element)}.`
            }
            for (let i = 0; i < this.formInfo.curd.length; i++) {
                const op = this.formInfo.curd[i];
                let modelName = "";
                /*eslint-disable indent*/ 
                switch (op) {
                    case "create":
                        modelName = camelCase(`create_${this.formInfo.modelName}`);
                        routerStr += `router.post("/api/${this.formInfo.path}", controller.${filePathStr}${camelCase(`create_${this.formInfo.modelName}`)}); //新增${descStr}\n`;
                        break;
                    case "update":
                        modelName = camelCase(`update_${this.formInfo.modelName}`);
                        routerStr += `router.put("/api/${this.formInfo.path}", controller.${filePathStr}${modelName}); //修改${descStr}\n`;
                        break;
                    case "readList":
                        modelName = camelCase(`read_${this.formInfo.modelName}_list`);
                        routerStr += `router.get("/api/${this.formInfo.path}_list", controller.${filePathStr}${modelName}); //以列表形式获取${descStr}\n`;
                        break;
                    case "readById":
                        modelName = camelCase(`read_${this.formInfo.modelName}_byId`);
                        routerStr += `router.get("/api/${this.formInfo.path}", controller.${filePathStr}${modelName}); //根据id查询${descStr}\n`;
                        break;
                    case "readEnum":
                        modelName = camelCase(`read_${this.formInfo.modelName}_enum`);
                        routerStr += `router.get("/api/${this.formInfo.path}_enum", controller.${filePathStr}${modelName}); //以枚举形式获取${descStr}\n`;
                        break;
                    case "delete":
                        modelName = camelCase(`delete_${this.formInfo.modelName}`);
                        routerStr += `router.delete("/api/${this.formInfo.path}", controller.${filePathStr}${modelName}); //删除${descStr}\n`;
                        break;
                    default:
                        break;
                }
            }
            let result = `//=====================================${this.formInfo.description}相关路由====================================//\n`;
            result += beautify(routerStr, { indent_size: 4, "end-with-newline": true, preserve_newlines: false })
            return result
        },
    },
};
</script>



<style lang="scss">
.easycode {
    height: calc(100vh - #{size(60)});
    overflow-y: auto;
    .item {
        width: 50%;
        max-width: size(800);
    }
    .code-area {
        position: relative;
        .operate {
            position: absolute;
            top: size(20);
            right: size(10);
            z-index: 1;
            top: 20px;
            right: size(10);
        }
        &>pre {
            min-height: size(100);
        }
    }
    .op-config {
        margin-top: size(20);
        width: 45%;
        border: 1px solid $gray-300;
        border-radius: $border-radius-sm;
        .header {
            background: $gray-200;
            padding: size(5);
        }
        .config-item {
            height: size(25);
            display: flex;
            align-items: center;
        }
    }
}
</style>
