/*
    创建者：shuxiaokai
    创建时间：2020-07-28 15:21
    模块名称：json类型数据展示，支持备注信息
    备注：xxxx
*/
<template>
    <div class="s-json">
        <span v-if="level === 0" class="symbol">{</span>
        <!-- 数组 -->
        <template v-if="Array.isArray(data)">
            <div v-for="(value, key) in data" :key="key" class="indent">
                <span :class="{line: typeof value !== 'object' || value === null}">
                    <!-- 数组 -->
                    <template v-if="Array.isArray(value)">
                        <span class="symbol">[</span>
                        <span v-if="!fullArray && typeof value[0] === 'object' && value !== null" class="symbol">{</span>
                        <s-json-inner :full-array="fullArray" :data="fullArray ? value : value[0]" :check-data="checkData[key] ? checkData[key][0] : []" :level="level + 1"></s-json-inner>
                        <span v-if="!fullArray && typeof value[0] === 'object' && value !== null" class="symbol">}</span>
                        <span class="symbol">]</span>
                    </template>
                    <!-- 对象 -->
                    <template v-else-if="typeof value === 'object'">
                        <span class="symbol">{</span>
                        <s-json-inner :full-array="fullArray" :data="value" :check-data="checkData[key]" :level="level + 1"></s-json-inner>
                        <span class="symbol">}</span>
                    </template>
                    <!-- 常规数据 -->
                    <template v-else>
                        <s-ellipsis-content v-if="typeof value === 'string'" class="string-value" :value='`"${value}"`'></s-ellipsis-content>
                        <s-ellipsis-content v-if="typeof value === 'number'" class="number-value" :value="value"></s-ellipsis-content>
                        <s-ellipsis-content v-if="typeof value === 'boolean'" class="boolean-value" :value="value"></s-ellipsis-content>
                    </template>
                    <span class="symbol">,</span>
                    <s-ellipsis-content class="error" :value="checkResponse(key, value)"></s-ellipsis-content>
                </span>                
            </div>
        </template>
        <!-- 对象 -->
        <template v-else-if="typeof data === 'object' && data !== null">
            <div v-for="(value, key) in data" :key="key" class="indent">
                <span :class="{line: typeof value !== 'object' || value === null, active: checkResponse(key, value)}">
                    <span class="key">{{ key }}</span>
                    <span class="symbol">:&nbsp;</span>
                    <!-- 数组 -->
                    <template v-if="Array.isArray(value)">
                        <span class="symbol">[</span>
                        <span v-if="!fullArray && typeof value[0] === 'object' && value !== null" class="symbol">{</span>
                        <s-json-inner :full-array="fullArray" :data="fullArray ? value : value[0]" :check-data="checkData[key] ? checkData[key][0] : []" :level="level + 1"></s-json-inner>
                        <span v-if="!fullArray && typeof value[0] === 'object' && value !== null" class="symbol">}</span>
                        <span class="symbol">]</span>
                    </template>
                    <!-- 对象 -->
                    <template v-else-if="typeof value === 'object'">
                        <span class="symbol">{</span>
                        <s-json-inner :full-array="fullArray" :data="value" :check-data="checkData[key]" :level="level + 1"></s-json-inner>
                        <span class="symbol">}</span>
                    </template>
                    <!-- 常规数据 -->
                    <template v-else>
                        <s-ellipsis-content v-if="typeof value === 'string'" class="string-value" :value='`"${value}"`'></s-ellipsis-content>
                        <s-ellipsis-content v-if="typeof value === 'number'" class="number-value" :value="value"></s-ellipsis-content>
                        <s-ellipsis-content v-if="typeof value === 'boolean'" class="boolean-value" :value="value"></s-ellipsis-content>
                    </template>
                    <span class="symbol">,</span>
                    <s-ellipsis-content class="error" :value="checkResponse(key, value)"></s-ellipsis-content>
                </span>                
            </div>
            <div v-if="checkLackKey()" class="indent red line active">...{{ checkLackKey() }}</div>
        </template>
        <!-- 常规数据 -->
        <template v-else>
            <div class="indent">
                <s-ellipsis-content v-if="typeof data === 'string'" maxWidth="100%" class="string-value" :value='`"${data}"`'></s-ellipsis-content>
                <s-ellipsis-content v-if="typeof data === 'number'" maxWidth="100%" class="number-value" :value="data"></s-ellipsis-content>
                <s-ellipsis-content v-if="typeof data === 'boolean'" maxWidth="100%" class="boolean-value" :value="data"></s-ellipsis-content>
            </div>
        </template>
        <span v-if="level === 0" class="symbol">}</span>
    </div>
</template>

<script>
export default {
    name: "SJson",
    props: {
        data: {
            type: [Object, Array, String, Number, Boolean],
            default() {
                return {};
            }
        },
        checkData: {
            type: [Object, Array, String, Number, Boolean],
            default() {
                return {};
            },
        },
        level: {
            type: Number,
            default: 0
        },
        indent: {
            type: Number,
            default: 20
        },
        options: {
            type: Object,
            default() {
                return {
                    key: "key",
                    value: "value",
                    type: "type",
                    description: "description"
                }
            }
        },
        fullArray: {
            type: Boolean,
            default: false
        },
    },
    data() {
        return { 
        };
    },
    mounted() {
    },
    methods: {
        checkResponse(key, value) {
            const localKeys = Object.keys(this.checkData);
            const localValue = this.checkData[key];
            const localType = this.getType(localValue);
            const remoteValue = value;
            const remoteType = this.getType(remoteValue)
            if (!localKeys.includes(key)) {
                this.$emit("error", "tooMuchField");
                return `字段冗余`
            }
            if (localType !== remoteType) {
                this.$emit("error", "typeError");
                return `类型错误(${remoteType}|${localType})`
            }
        },
        //检验缺少的字段
        checkLackKey() {
            const localKeys = Object.keys(this.checkData);
            const remoteKeys = Object.keys(this.data);
            const lackKeys = [];
            for(let i = 0; i < localKeys.length; i++) {
                if (remoteKeys.every(val => val !== localKeys[i])) {
                    lackKeys.push(localKeys[i])
                }
            }
            if (lackKeys.length > 0) {
                this.$emit("error", "lackField");
                return `缺少字段${lackKeys.join()}`
            }
            
        },
        //获取参数类型
        getType(value) {
            if (typeof value === "string") {
                return "string"
            } else if (typeof value === "number") { //NaN
                return "number"
            } else if (typeof value === "boolean") {
                return "boolean"
            } else if (Array.isArray(value)) {
                return "array"
            } else if (typeof value === "object" && value !== null) {
                return "object"
            } else { // null undefined ...
                return "string"
            }
        },
        //=====================================其他操作=====================================//
    }
};
</script>



<style lang="scss">
.s-json {
    // background: #F0F0F0;
    .indent {
        padding-left: 2em;
    }
    .key {
        color: $blue,
    }
    .symbol {
        color: $gray-300;
    }
    .string-value {
        color: #499CB3;
    }
    .boolean-value {
        color: #499CB3;
    }
    .number-value {
        color: #80C0A8;
    }
    .comment {
        color: #6A9955;
    }
    .error {
        color: $red;
    }
    .line {
        display: inline-block;
        width: 100%;
        &:hover {
            background: $gray-700;
        }
        &.active {
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
}

</style>
