/*
    创建者：shuxiaokai
    创建时间：2021-02-03 22:15
    模块名称：系统参数转换为可读文档
    备注：
*/
<template>
    <div class="s-array-view">
        <div class="header">
            <div class="search">
                <input v-model="queryString" type="text" placeholder="关键词高亮...">
            </div>
            <slot name="header" />
        </div>
        <div class="content">
            <div class="code-banner">
                <template v-for="(item, index) in astValue">
                    <div v-if="!item._hidden" :key="index" class="banner-wrap">
                        <span class="number-line">{{ item.line }}</span>
                        <span
                            v-if="item.leftCurlBrace.value || item.leftBracket.value"
                            class="collapse el-icon-arrow-down"
                            :class="{close: item._close}"
                            @click="toggleCollapse(item, index)"
                        >
                        </span>
                    </div>
                </template>
            </div>
            <div class="code-wrap">
                <template v-for="(item, index) in astValue">
                    <span v-show="!item._hidden" :key="index" class="line" :class="{active: item._close}" @click.stop="handleCheckBraceMatch(item)">
                        <span v-for="(indent) in item.indent" :key="indent" class="indent"></span>
                        <label v-if="item.path.value && showCheckbox" class="checkbox" @click.stop="() => {}">
                            <input v-model="item._select" type="checkbox" @change="toggleCheckbox(item)">
                            <i v-show="item._select" class="icon el-icon-check"></i>
                        </label>
                        <span class="path">
                            <s-emphasize :value="item.path.value" :keyword="queryString"></s-emphasize>
                        </span>
                        <span v-if="item.colon" class="colon">{{ item.colon }}</span>
                        <span v-if="item.leftBracket.value" class="bracket" :class="{active: activeBracketId && item.leftBracket.pairId === activeBracketId}">{{ item.leftBracket.value }}</span>
                        <span v-if="item.leftCurlBrace.value" class="curly-brace" :class="{active: activeCurlyBraceId && item.leftCurlBrace.pairId === activeCurlyBraceId}">{{ item.leftCurlBrace.value }}</span>
                        <el-tooltip effect="light" :open-delay="1500" :content="item.value" placement="bottom-start">
                            <s-emphasize v-if="item.valueType === 'string'" class="string-value" :value="item.value" :keyword="queryString"></s-emphasize>
                        </el-tooltip>
                        <span v-if="item.valueType === 'number'" class="number-value">{{ item.value }}</span>
                        <span v-if="item.valueType === 'boolean'" class="boolean-value">{{ item.value }}</span>
                        <span v-if="item.valueType === 'null'" class="null-value">null</span>
                        <span v-if="item.valueType === 'undefined'" class="undefined-value">undefined</span>
                        <span v-if="item.rightCurlBrace.value" class="curly-brace" :class="{active: activeCurlyBraceId && item.rightCurlBrace.pairId === activeCurlyBraceId}">{{ item.rightCurlBrace.value }}</span>
                        <span class="bracket" :class="{active: activeBracketId && item.rightBracket.pairId === activeBracketId}">{{ item.rightBracket.value }}</span>
                        <span class="comma">{{ item.comma }}</span>
                        <span v-if="item.comma" class="orange ml-1">{{ item.required ? "" : "(可选)" }}</span>
                        <el-tooltip effect="light" :open-delay="1500" :content="item.description" placement="bottom-start">
                            <span v-if="item.description" class="description ml-1">
                                //<s-emphasize :value="item.description" :keyword="queryString"></s-emphasize>
                            </span>
                        </el-tooltip>
                        <span v-show="item._close" class="number-value"></span>
                    </span>
                </template>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        data: {
            type: [Array, Object],
            default() {
                return {};
            },
        },
        showCheckbox: { //是否展示checkbox
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            queryString: "", //查询字符串
            wordNum: 0, //字段数量
            astValue: [], //当前渲染树数据
            activeCurlyBraceId: "", //当前匹配的大括号id
            activeBracketId: "", //当前匹配的中括号id
        };
    },
    watch: {
        data: {
            handler(data) {
                this.wordNum = 0;
                this.astJson(data);
            },
            deep: true,
            immediate: true,
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //初始化
        init() {
            document.body.addEventListener("click", () => {
                this.activeCurlyBraceId = "";
                this.activeBracketId = "";
            });
        },
        //点击进行括号匹配
        handleCheckBraceMatch(item) {
            const pairId = item.leftCurlBrace.pairId || item.rightCurlBrace.pairId;
            const bracketPairId = item.leftBracket.pairId || item.rightBracket.pairId;
            this.activeCurlyBraceId = pairId;
            this.activeBracketId = bracketPairId;
        },
        //折叠代码块
        toggleCollapse(item, index) {
            if (!item._close) {
                this.$set(item, "_close", true);
            } else {
                this.$set(item, "_close", false);
            }
            const pairId = item.leftBracket.pairId || item.leftCurlBrace.pairId;
            for (let i = index + 1; i < this.astValue.length; i += 1) {
                const astItem = this.astValue[i];
                if (astItem.rightBracket.pairId === pairId || astItem.rightCurlBrace.pairId === pairId) {
                    break;
                }
                if (item._close) {
                    this.$set(astItem, "_hidden", true);
                } else {
                    this.$set(astItem, "_hidden", false);
                }
            }
        },
        //参数过滤
        toggleCheckbox(item) {
            const { id } = item;
            const currentNode = this.$helper.findoNode(id, this.data, null, { id: "_id" });
            const parentNode = this.$helper.findParentNode(id, this.data, null, { id: "_id" });
            this.$helper.forEachForest(currentNode.children, (node) => { //如果又子元素则选择所有子元素
                this.$set(node, "_select", item._select);
            });
            this.$set(currentNode, "_select", item._select); //选择当前元素
            if (parentNode) {
                if (parentNode.children.every((val) => val._select === false)) {
                    this.$set(parentNode, "_select", false);
                } else {
                    this.$set(parentNode, "_select", true);
                }
            }
        },
        /*
         * singleLeftCurlyBrace         {    仅左侧有大括号(不允许存在逗号)
         * singleRightCurlyBrace        }    仅右侧有大括号
         * singleLeftBracket            [    仅左侧有中括号(不允许存在逗号)
         * singleRightBracket           ]    仅右侧有中括号
         * pathColonCurlyBrace          obj: {}
         * pathColonBracket             obj: []
         * pathColonLeftBracket         obj: [
         * pathColonLeftCurlyBrace      obj: {       (不允许存在逗号)
         * pathColonValue               x: 1
         * string                 "age"
         * number                 22
         * boolean                true
         * null                   null
         * undefined              undefined
        */
        astJson(rawData) {
            if (!Array.isArray(rawData)) {
                return;
            }
            const result = [];
            const indent = 4;
            // const rootLeftCurlInfo = this.generateAstInfo();
            // rootLeftCurlInfo.leftCurlBrace.pairId = "root";
            // rootLeftCurlInfo.indent = 0;
            // rootLeftCurlInfo.leftCurlBrace.value = "{";
            // result.push(rootLeftCurlInfo);
            const foo = (arrayData, level, deepth, parent) => {
                const parentIsArray = (parent && parent.type === "array");
                for (let i = 0; i < arrayData.length; i += 1) {
                    const item = arrayData[i];
                    const itemValue = item.value;
                    const itemType = item.type;
                    const itemPath = item.key;
                    const isObject = itemType === "object";
                    const isArray = itemType === "array";
                    const objectHasValue = (isObject && item.children.length > 0);
                    const arrayHasValue = (isArray && item.children.length > 0 && item.children.some((val) => val.key !== "" || val.value !== "" || val.type === "object"));
                    const isSimpleType = ((itemType === "string") || (itemType === "boolean") || (itemType === "number") || (itemType === "null") || (itemType === "undefined"));
                    const astInfo = this.generateAstInfo();
                    astInfo.id = item._id;
                    this.$set(astInfo, "_select", item._select);
                    astInfo._select = item._select;
                    if (isSimpleType && !itemValue && !itemPath) {
                        continue;
                    }
                    astInfo.description = item.description;
                    astInfo.required = item.required;
                    if (isSimpleType) { //简单类型数据 x: 1
                        astInfo.indent = indent * level;
                        astInfo.path.value = itemPath;
                        astInfo.colon = parentIsArray ? "" : ":";
                        astInfo.value = itemType === "string" ? `"${itemValue}"` : itemValue;
                        astInfo.valueType = itemType;
                        astInfo.comma = ",";
                        result.push(astInfo);
                        this.wordNum += 1;
                    } else if (isObject && !objectHasValue) { //对象类型并且子元素无值 x: {}
                        if (level !== 0) {
                            astInfo.path.value = itemPath;
                            astInfo.colon = ":";
                            astInfo.comma = ",";
                        }
                        const uuid = Math.random();
                        astInfo.leftCurlBrace.pairId = uuid;
                        astInfo.leftCurlBrace.value = "{";
                        astInfo.rightCurlBrace.value = "}";
                        astInfo.rightCurlBrace.pairId = uuid;
                        astInfo.indent = indent * level;
                        result.push(astInfo);
                        this.wordNum += 1;
                    } else if (isObject && objectHasValue) { //对象类型并且子元素有值 x: {
                        if (level !== 0) {
                            astInfo.path.value = itemPath;
                            astInfo.colon = itemPath ? ":" : ""; //无key值代表父元素为数组类型
                        }
                        const uuid = Math.random();
                        const rightCurlyBraceInfo = this.generateAstInfo();
                        astInfo.leftCurlBrace.pairId = uuid;
                        astInfo.leftCurlBrace.value = "{";
                        astInfo.indent = indent * level;
                        result.push(astInfo);
                        foo(item.children, level + 1, deepth + 1, item);
                        rightCurlyBraceInfo.indent = indent * level;
                        rightCurlyBraceInfo.rightCurlBrace.value = "}";
                        rightCurlyBraceInfo.comma = ",";
                        rightCurlyBraceInfo.rightCurlBrace.pairId = uuid;
                        result.push(rightCurlyBraceInfo);
                        this.wordNum += 1;
                    } else if (isArray && !arrayHasValue) { //数组类型并且子元素无值  x: [],
                        if (level !== 0) {
                            astInfo.path.value = itemPath;
                            astInfo.colon = ":";
                        }
                        const uuid = Math.random();
                        // astInfo.path.value = itemPath;
                        astInfo.leftBracket.pairId = uuid;
                        // astInfo.colon = ":";
                        astInfo.leftBracket.value = "[";
                        astInfo.rightBracket.value = "]";
                        astInfo.rightBracket.pairId = uuid;
                        astInfo.indent = indent * level;
                        result.push(astInfo);
                        this.wordNum += 1;
                    } else if (isArray && arrayHasValue) { //数组类型并且子元素有值 x: [
                        if (level !== 0) {
                            astInfo.path.value = itemPath;
                            astInfo.colon = ":";
                        }
                        const uuid = Math.random();
                        const currentLevel = indent * level;
                        const rightBracketInfo = this.generateAstInfo();
                        // astInfo.path.value = itemPath;
                        astInfo.leftBracket.value = "[";
                        astInfo.leftBracket.pairId = uuid;
                        astInfo.indent = currentLevel;
                        // astInfo.colon = ":";
                        result.push(astInfo);
                        foo(item.children, level + 1, deepth + 1, item);
                        rightBracketInfo.indent = currentLevel;
                        rightBracketInfo.rightBracket.value = "]";
                        rightBracketInfo.rightBracket.pairId = uuid;
                        rightBracketInfo.comma = ",";
                        result.push(rightBracketInfo);
                        this.wordNum += 1;
                    }
                }
            };
            foo(rawData, 0, 1, null);
            // const rootRightCurlInfo = this.generateAstInfo();
            // rootRightCurlInfo.rightCurlBrace.pairId = "root";
            // rootRightCurlInfo.indent = 0;
            // rootRightCurlInfo.rightCurlBrace.value = "}";
            // result.push(rootRightCurlInfo);
            result.forEach((astItem, index) => {
                astItem.line = index + 1;
            });
            this.astValue = result.slice(0, 500);
        },
        //=====================================其他操作=====================================//
        //获取参数类型
        getType(value) {
            let result = "string";
            if (typeof value === "string") {
                result = "string";
            } else if (typeof value === "number") { //NaN
                result = "number";
            } else if (typeof value === "boolean") {
                result = "boolean";
            } else if (Array.isArray(value)) {
                result = "array";
            } else if (value === null) {
                result = "null";
            } else if (value === undefined) {
                return "undefined";
            } else if (typeof value === "object" && value !== null) {
                result = "object";
            } else {
                result = "string";
            }
            return result;
        },
        /**
         * @description        生成语法树基本数据结构
         * @author             shuxiaokai
         * @create             2021-02-01 10:02
         * @return {Array<AST>}
         * 类型：
         * singleLeftCurlyBrace         {    仅左侧有大括号(不允许存在逗号)
         * singleRightCurlyBrace        }    仅右侧有大括号
         * singleLeftBracket            [    仅左侧有中括号(不允许存在逗号)
         * singleRightBracket           ]    仅右侧有中括号
         * pathColonCurlyBrace          obj: {}
         * pathColonBracket             obj: []
         * pathColonLeftBracket         obj: [
         * pathColonLeftCurlyBrace      obj: {       (不允许存在逗号)
         * pathColonValue               x: 1
         * string                       "age"
         * number                       22
         * boolean                      true
         * null                         null
         * undefined                    undefined
         */
        generateAstInfo() {
            return {
                _select: false, //是否选中
                indent: 4, //缩进
                line: 0, //行号
                path: { //键
                    value: "", //值
                    widthQuote: true, //是否存在双引号
                },
                value: "", //值
                valueType: "", //值类型
                colon: "", //冒号
                comma: "", //逗号
                description: "", //备注信息
                required: true, //是否必填
                leftCurlBrace: { //左花括号
                    pairId: "", //与之相匹配的另一个括号id
                    value: "", //值
                },
                rightCurlBrace: { //右花括号
                    pairId: "", //与之相匹配的另一个括号id
                    value: "", //值
                },
                leftBracket: { //左中括号
                    value: "", //值
                },
                rightBracket: { //右中括号
                    value: "", //值
                },
            };
        },
    },
};
</script>

<style lang="scss">
$theme-color: #282c34;
// $theme-color: #282c34;
.s-array-view {
    min-width: 100%;
    background: $gray-200;
    position: relative;
    font-size: size(14);
    background: $theme-color;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
    .header {
        padding: 0 size(20);
        height: size(30);
        color: $gray-300;
        display: flex;
        align-items: center;
        position: relative;
        justify-content: flex-end;
        .search {
            &>input {
                height: size(20);
                line-height: size(20);
                margin-right: size(20);
                border: lighten($theme-color, 10%);
                background: lighten($theme-color, 20%);
                color: $gray-300;
                text-indent: size(5);
                &::placeholder {
                    color: $gray-300;
                    font-size: fz(12);
                }
            }
        }
    }
    .content {
        display: inline-flex;
        width: 100%;
        overflow-y: auto;
        max-height: size(400);
        padding-bottom: size(15);
        &::-webkit-scrollbar {
            background: lighten($theme-color, 30%);
        }
        &::-webkit-scrollbar-thumb {
            background: $gray-600;
        }
        &::-webkit-scrollbar-track {
            background: $theme-color;
        }
        .code-banner {
            flex: 0 0 auto;
            width: size(50);
            border-right: 1px solid $gray-600;
            height: 100%;
            &:hover {
                .collapse {
                    display: inline-flex!important;
                }
            }
            .banner-wrap {
                position: relative;
                display: flex;
                align-items: center;
                .number-line {
                    flex: 0 0 auto;
                    width: size(30);
                    height: size(20);
                    color: $gray-500;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    font-family: source-code-pro,Menlo,Monaco,Consolas,Courier New,monospace;
                }
                .collapse {
                    width: size(20);
                    height: size(20);
                    color: $gray-300;
                    cursor: pointer;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    transition: color .4s;
                    user-select: none;
                    &.close {
                        transform: rotate(-90deg);
                        display: inline-flex!important;
                    }
                    &:hover {
                        color: $gray-100;
                    }
                }
            }
        }
        .code-wrap {
            flex: 1;
            width: 0;
            .line {
                min-height: size(20);
                display: flex;
                align-items: center;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                &:hover {
                    background: lighten($theme-color, 10%);
                }
                &.active {
                    background: $gray-700;
                }
                &.error {
                    animation: blink 4s infinite alternate;
                }
                @keyframes blink {
                    0% {
                        opacity: 1;
                        background: rgb(116, 116, 67);
                    }
                    100% {
                        background: inherit;
                    }
                }
            }
            .checkbox {
                display: inline-flex;
                width: size(12);
                height: size(12);
                margin-right: size(5);
                background: $gray-800;
                border: 1px solid $gray-500;
                cursor: pointer;
                &:hover {
                    border: 1px solid $gray-300;
                }
                input[type=checkbox] {
                    display: none;
                }
                .icon {
                    font-size: fz(10);
                    color: $white;
                }
            }
            .indent {
                user-select: text;
                height: size(20);
                flex: 0 0 size(8);
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .path {
                color: #f8c555,
            }
            .description {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #6A9955;
                cursor: text;
            }
            .colon {
                margin-right: size(5);
            }
            .colon, .bracket, .comma, .curly-brace {
                color: #ccc;
                font-family: source-code-pro,Menlo,Monaco,Consolas,Courier New,monospace;
            }
            .curly-brace {
                border: 1px solid transparent;
                &.active {
                    color: $red;
                    border: 1px solid $gray-400;
                }
            }
            .bracket {
                border: 1px solid transparent;
                &.active {
                    color: $orange;
                    border: 1px solid $gray-400;
                }
            }
            .string-value {
                color: #7ec699;
                font-size: .9em;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 50%;
                flex: 0 0 auto;
            }
            .boolean-value {
                color: #cc99cd;
                font-size: .9em;
            }
            .number-value {
                color: #ccc;
                font-size: .9em;
            }
            .null-value {
                color: #f60;
                font-size: .9em;
            }
        }
    }
}
</style>
