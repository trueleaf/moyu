/*
    创建者：shuxiaokai
    创建时间：2020-07-08 13:14
    模块名称：带验证规则的input输入框
    备注：xxxx
*/
<template>
    <div class="v-input">
        <el-input v-if="!remote" :value="value" v-bind="$attrs" v-on="$listeners">
            <template slot="prepend">
                <slot name="prepend" />
            </template>
        </el-input>
        <el-autocomplete
            v-else :value="value"
            v-bind="$attrs"
            value-key="key"
            popper-class="g-v-autocomplete"
            class="w-100"
            :fetch-suggestions="querySearchAsync"
            :trigger-on-focus="false"
            :highlight-first-item="true"
            v-on="$listeners"
            @keydown.native="handleKeyDown"
            @select="handleSelect"
            @input="handleAutocompleteInput"
        >
            <template slot-scope="{ item }">
                <!-- <div>{{ item.key }}</div> -->
                <s-emphasize :value="item.key" :keyword="currentQuerystring" class="d-flex"></s-emphasize>
                <span class="f-sm gray-500">{{ item.type }}</span>
            </template>
        </el-autocomplete>
        <!-- <span v-show="error.error" class="error-tip">
            <span>{{ error.message || "校验错误" }}</span>
            <slot name="tip" />
        </span> -->
    </div>
</template>

<script>
export default {
    props: {
        value: { //-----------v-model的值
            type: [String, Number],
            default: "",
        },
        tip: { //-------------错误提示信息
            type: [Object, String],
            default() {
                return null;
            },
        },
        error: { //-----------是否错误
            type: Object,
            default() {
                return {};
            },
        },
        remote: { //---------是否远程搜索
            type: Boolean,
            default: false,
        },
        mindParams: {
            type: Array,
            default() {
                return [];
            },
        },
    },
    data() {
        return {
            currentQuerystring: "", //-----当前键入的查询字符串
            couldGetMindParams: false, //--是否允许联想查询
            cancelTimer: null,
            isPaste: false, //是否为粘贴
        };
    },
    mounted() {},
    methods: {
        //=====================================组件间交互====================================//
        //联想输入
        querySearchAsync(queryString, cb) {
            this.currentQuerystring = queryString.toLowerCase();
            const matchedParams = this.mindParams.filter((val) => val.key.toLocaleLowerCase().includes(queryString.toLowerCase()));
            if (queryString.trim() === "" || this.isPaste) {
                cb([]);
            } else if (matchedParams.length > 0) {
                cb(matchedParams);
            } else {
                cb([]);
            }
            this.isPaste = false;
        },
        //选择
        handleSelect(val) {
            this.$emit("mindParamsSelect", val);
        },
        //ctrl + v也会查询快捷参数一次
        handleKeyDown(e) {
            if (e.ctrlKey && e.key === "v") {
                this.isPaste = true;
                setTimeout(() => {
                    const copyMindParams = JSON.parse(JSON.stringify(this.mindParams));
                    const matchedParams = copyMindParams.filter((val) => val.key.toLocaleLowerCase() === this.value.toLowerCase());
                    if (matchedParams[0]) {
                        matchedParams[0].key = this.value;
                        this.$emit("mindParamsSelect", matchedParams[0]);
                    }
                });
            }
        },
        handleAutocompleteInput() {
            // this.couldGetMindParams = true;
            // clearTimeout(this.cancelTimer);
            // this.cancelTimer = setTimeout(() => {
            //     this.couldGetMindParams = false;
            // }, 1000)
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.v-input {
    width: 100%;
    position: relative;
    &.valid-error {
        .el-input__inner {
            animation: flash 2s infinite alternate;
            border-bottom: 1px solid $red!important;
        }
    }
    .error-tip {
        text-indent: size(12);
        font-size: size(12);
        position: absolute;
        top: size(30);
        line-height: size(12);
        left: 0;
        color: $orange;
    }
    @keyframes flash {
        0% {
            opacity: 1;
            background: mix($orange, $white, 30%);
        }
        100% {
            background: $white;
        }
    }
}
.g-v-autocomplete {
    li {
        line-height: 1.3;
        margin-bottom: size(10);
    }
}
</style>
