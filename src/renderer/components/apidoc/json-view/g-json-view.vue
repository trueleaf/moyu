/*
    创建者：shuxiaokai
    创建时间：2021-02-03 22:15
    模块名称：json格式预览
    备注：
*/
<template>
    <div class="s-json-view">
        <slot name="header"/>
        <div class="content">
            <div class="code-banner">
                <template v-for="(item, index) in astValue">
                    <div v-if="!item._hidden" :key="index" class="banner-wrap">
                        <span class="number-line">{{ item.line }}</span>
                        <span
                            v-if="item.leftCurlBrace.value || item.leftBracket.value"
                            class="collapse el-icon-arrow-down"
                            :class="{close: item._close}"
                            @click="toggleCollapse(item, index)">
                        </span>
                    </div>
                </template>
            </div>
            <div class="code-wrap">
                <template v-for="(item, index) in astValue">
                    <span v-show="!item._hidden" :key="index" class="line" :class="{active: item._close}" @mousedown.stop="handleCheckBraceMatch(item)">
                        <span v-for="(indent) in item.indent" :key="indent" class="indent"></span>
                        <span>
                            <span class="path">{{ item.path.value }}</span>
                            <span class="colon">{{ item.colon }}&nbsp;</span>
                            <span v-if="item.leftBracket.value" class="bracket" :class="{active: activeBracketId && item.leftBracket.pairId === activeBracketId}">{{ item.leftBracket.value }}</span>
                            <span v-if="item.leftCurlBrace.value" class="curly-brace" :class="{active: activeCurlyBraceId && item.leftCurlBrace.pairId === activeCurlyBraceId}">{{ item.leftCurlBrace.value }}</span>
                            <span v-if="item.valueType === 'string'" class="string-value">{{ item.value }}</span>
                            <span v-if="item.valueType === 'number'" class="number-value">{{ item.value }}</span>
                            <span v-if="item.valueType === 'boolean'" class="boolean-value">{{ item.value }}</span>
                            <span v-if="item.valueType === 'null'" class="null-value">{{ item.value }}</span>
                            <span v-if="item.valueType === 'undefined'" class="undefined-value">{{ item.value }}</span>
                            <span v-if="item.rightCurlBrace.value" class="curly-brace" :class="{active: activeCurlyBraceId && item.rightCurlBrace.pairId === activeCurlyBraceId}">{{ item.rightCurlBrace.value }}</span>
                            <span class="bracket" :class="{active: activeBracketId && item.rightBracket.pairId === activeBracketId}">{{ item.rightBracket.value }}</span>
                            <span class="comma">{{ item.comma }}</span>
                        </span>
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
    },
    data() {
        return {
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
            document.body.addEventListener("mousedown", () => {
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
            const result = [];
            const indent = 4;
            const foo = (jsonData, level, deepth, isRoot) => {
                const jsonDataType = this.getType(jsonData);
                const jsonDataIsSimple = ((jsonDataType === "string") || (jsonDataType === "boolean") || (jsonDataType === "number") || (jsonDataType === "null") || (jsonDataType === "undefined"));
                if (jsonDataIsSimple) { //简单类型
                    const astInfo = this.generateAstInfo();
                    const realValue = (jsonDataType === "string") ? `"${jsonData}"` : jsonData;
                    astInfo.indent = indent * level;
                    astInfo.value = realValue;
                    astInfo.valueType = jsonDataType;
                    astInfo.comma = ",";
                    result.push(astInfo);
                    this.wordNum += 1;
                    return;
                }
                if (jsonDataType === "object") { //对象类型
                    const objLevel = level + 1;
                    const objectUuid = Math.random();
                    if (isRoot) {
                        const astInfo = this.generateAstInfo("singleLeftBracket");
                        astInfo.leftCurlBrace.value = "{";
                        astInfo.leftCurlBrace.pairId = objectUuid;
                        astInfo.indent = indent * level;
                        result.push(astInfo);
                    }
                    Object.keys(jsonData).forEach((path) => {
                        const value = jsonData[path];
                        const type = this.getType(value);
                        const astInfo = this.generateAstInfo();
                        const isSimpleType = ((type === "string") || (type === "boolean") || (type === "number") || (type === "null") || (type === "undefined"));
                        const isObject = type === "object";
                        const isArray = type === "array";
                        const objectHasValue = (isObject && Object.keys(value).length > 0);
                        const arrayHasValue = (isArray && value.length > 0);
                        if (isSimpleType) { //简单类型数据 x: 1
                            const realValue = type === "string" ? `"${value}"` : value;
                            astInfo.indent = indent * objLevel;
                            astInfo.path.value = path;
                            astInfo.colon = ":";
                            astInfo.value = realValue;
                            astInfo.valueType = type;
                            astInfo.comma = ",";
                            result.push(astInfo);
                            this.wordNum += 1;
                        } else if (isObject && !objectHasValue) { //对象类型并且子元素无值 x: {}
                            const uuid = Math.random();
                            astInfo.path.value = path;
                            astInfo.leftCurlBrace.pairId = uuid;
                            astInfo.leftCurlBrace.value = "{";
                            astInfo.rightCurlBrace.value = "}";
                            astInfo.colon = ":";
                            astInfo.rightCurlBrace.pairId = uuid;
                            astInfo.comma = ",";
                            astInfo.indent = indent * objLevel;
                            result.push(astInfo);
                            this.wordNum += 1;
                        } else if (isObject && objectHasValue) { //对象类型并且子元素有值 x: {
                            const uuid = Math.random();
                            const rightCurlyBraceInfo = this.generateAstInfo("singleRightCurlyBrace");
                            astInfo.path.value = path;
                            astInfo.leftCurlBrace.pairId = uuid;
                            astInfo.leftCurlBrace.value = "{";
                            astInfo.indent = indent * objLevel;
                            astInfo.colon = ":";
                            result.push(astInfo);
                            foo(value, level + 1, deepth + 1, false);
                            rightCurlyBraceInfo.indent = indent * objLevel;
                            rightCurlyBraceInfo.rightCurlBrace.value = "}";
                            rightCurlyBraceInfo.comma = ",";
                            rightCurlyBraceInfo.rightCurlBrace.pairId = uuid;
                            result.push(rightCurlyBraceInfo);
                            this.wordNum += 1;
                        } else if (isArray && !arrayHasValue) { //数组类型并且子元素无值  x: [],
                            const uuid = Math.random();
                            astInfo.path.value = path;
                            astInfo.leftBracket.pairId = uuid;
                            astInfo.leftBracket.value = "[";
                            astInfo.rightBracket.value = "]";
                            astInfo.rightBracket.pairId = uuid;
                            astInfo.indent = indent * objLevel;
                            result.push(astInfo);
                            this.wordNum += 1;
                        } else if (isArray && arrayHasValue) { //数组类型并且子元素有值 x: [
                            const uuid = Math.random();
                            const currentLevel = indent * objLevel;
                            const rightBracketInfo = this.generateAstInfo("singleRightBracket");
                            astInfo.path.value = path;
                            astInfo.leftBracket.value = "[";
                            astInfo.leftBracket.pairId = uuid;
                            astInfo.indent = currentLevel;
                            astInfo.colon = ":";
                            result.push(astInfo);
                            value.forEach((val) => {
                                foo(val, objLevel + 1, deepth + 1, true);
                            });
                            rightBracketInfo.indent = currentLevel;
                            rightBracketInfo.rightBracket.value = "]";
                            rightBracketInfo.rightBracket.pairId = uuid;
                            rightBracketInfo.comma = ",";
                            result.push(rightBracketInfo);
                            this.wordNum += 1;
                        }
                    });
                    if (isRoot) {
                        const astInfo = this.generateAstInfo("singleRightBracket");
                        astInfo.rightCurlBrace.value = "}";
                        astInfo.rightCurlBrace.pairId = objectUuid;
                        astInfo.indent = indent * level;
                        astInfo.comma = ",";
                        result.push(astInfo);
                    }
                }
                if (jsonDataType === "array") { //数组类型
                    const uuid = Math.random();
                    const arrayUuid = Math.random();
                    if (jsonDataType === "array") {
                        const astInfo = this.generateAstInfo("singleLeftBracket");
                        astInfo.leftBracket.value = "[";
                        astInfo.leftBracket.pairId = arrayUuid;
                        astInfo.indent = indent * (level);
                        astInfo.leftCurlBrace.pairId = uuid;
                        result.push(astInfo);
                    }
                    jsonData.forEach((data) => {
                        foo(data, level + 1, deepth, true);
                    });
                    if (jsonDataType === "array") {
                        const astInfo = this.generateAstInfo("singleRightBracket");
                        astInfo.rightBracket.value = "]";
                        astInfo.rightCurlBrace.pairId = uuid;
                        astInfo.rightBracket.pairId = arrayUuid;
                        astInfo.indent = indent * (level);
                        result.push(astInfo);
                    }
                }
            };
            foo(rawData, 0, 1, true);
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
.s-json-view {
    min-width: 100%;
    min-height: size(400);
    background: $gray-200;
    position: relative;
    font-size: size(14);
    background: #282c34;
    font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;
    .content {
        display: inline-flex;
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
            .line {
                height: size(20);
                display: flex;
                align-items: center;
                width: 100%;
                &:hover {
                    background: $gray-700;
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
            .indent {
                user-select: text;
                height: size(20);
                width: size(8);
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .path {
                color: #f8c555,
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
