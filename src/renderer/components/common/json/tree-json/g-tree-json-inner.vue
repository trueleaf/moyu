/*
    创建者：shuxiaokai
    创建时间：2020-07-28 15:21
    模块名称：json类型数据展示，支持备注信息
    备注：xxxx
*/
<template>
    <div class="tree-json-inner">
        <span v-if="level === 0" class="symbol">{</span>
        <div v-for="(item, index) in data" :key="index" class="indent">
            <!-- 常规数据类型 -->
            <template v-if="item.type !== 'array' && item.type !== 'object' && item.type !== 'file' && item.value">
                <template v-if="checkbox && item._select">
                    <span>
                        <input v-if="checkbox" v-model="item._select" type="checkbox" class="checkbox" @change="handleChangeCheckbox(item)">
                        <span v-if="!isArray" class="key">{{ item.key }}</span><span v-if="!isArray" class="symbol">:&nbsp;</span>
                        <!-- 常规数据 -->
                        <template>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'string'" class="string-value" :value='`"${item.value}"`'></s-ellipsis-content>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'number'" class="number-value" :value="item.value"></s-ellipsis-content>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'boolean'" class="boolean-value" :value="item.value"></s-ellipsis-content>
                        </template>
                        <span class="symbol">,</span>
                        <s-ellipsis-content :max-width="valueWidth" v-show="item.type !== 'object' || item.type !== 'array'" ref="comment" class="comment" :value="`${item.description ? '//' + item.description : ''}`"></s-ellipsis-content>
                        <span v-if="item.required" class="comment">(必填)</span>
                    </span>                      
                </template>
                <template v-if="!checkbox">
                    <span>
                        <input v-if="checkbox" v-model="item._select" type="checkbox" class="checkbox" @change="handleChangeCheckbox(item)">
                        <span v-if="!isArray" class="key">{{ item.key }}</span><span v-if="!isArray" class="symbol">:&nbsp;</span>
                        <!-- 常规数据 -->
                        <template>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'string'" class="string-value" :value='`"${item.value}"`'></s-ellipsis-content>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'number'" class="number-value" :value="item.value"></s-ellipsis-content>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'boolean'" class="boolean-value" :value="item.value"></s-ellipsis-content>
                        </template>
                        <span class="symbol">,</span>
                        <s-ellipsis-content :max-width="valueWidth" v-show="item.type !== 'object' || item.type !== 'array'" ref="comment" class="comment" :value="`${item.description ? '//' + item.description : ''}`"></s-ellipsis-content>
                        <span v-if="item.required" class="comment">(必填)</span>
                    </span>  
                </template>
            </template>
            <!-- 对象和数组类型 -->
            <template v-else-if="(item.type === 'array'|| item.type === 'object')">
                <template v-if="checkbox && item._select">
                    <span>
                        <input v-if="checkbox" v-model="item._select" type="checkbox" class="checkbox" @change="handleChangeCheckbox(item)">
                        <span v-if="!isArray" class="key">{{ item.key }}</span><span v-if="!isArray" class="symbol">:&nbsp;</span>
                        <template v-if="item.type === 'object'">
                            <span class="symbol">{</span>
                            <s-ellipsis-content :max-width="valueWidth" ref="comment" class="comment" :value="`${item.description ? '//' + item.description : ''}`"></s-ellipsis-content>
                            <s-tree-json :value-width="valueWidth" :data="item.children" :level="level + 1" :checkbox="checkbox"></s-tree-json>
                            <span class="symbol">}</span>
                        </template>
                        <template v-else-if="item.type === 'array'">
                            <span class="symbol">[</span>
                            <s-ellipsis-content :max-width="valueWidth" ref="comment" class="comment" :value="`${item.description ? '//' + item.description : ''}`"></s-ellipsis-content>
                            <s-tree-json :value-width="valueWidth" :data="item.children" :level="level + 1" :checkbox="checkbox" is-array></s-tree-json>
                            <span class="symbol">]</span>
                        </template>
                        <template v-else>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'string'" class="string-value" :value='`"${item.value}"`'></s-ellipsis-content>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'number'" class="number-value" :value="item.value"></s-ellipsis-content>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'boolean'" class="boolean-value" :value="item.value"></s-ellipsis-content>
                        </template>
                        <span class="symbol">,</span>
                    </span>                                        
                </template>
                <template v-if="!checkbox">
                    <span>
                        <input v-if="checkbox" v-model="item._select" type="checkbox" class="checkbox" @change="handleChangeCheckbox(item)">
                        <span v-if="!isArray" class="key">{{ item.key }}</span><span v-if="!isArray" class="symbol">:&nbsp;</span>
                        <template v-if="item.type === 'object'">
                            <span class="symbol">{</span>
                            <s-ellipsis-content :max-width="valueWidth" ref="comment" class="comment" :value="`${item.description ? '//' + item.description : ''}`"></s-ellipsis-content>
                            <s-tree-json :value-width="valueWidth" :data="item.children" :level="level + 1" :checkbox="checkbox"></s-tree-json>
                            <span class="symbol">}</span>
                        </template>
                        <template v-else-if="item.type === 'array'">
                            <span class="symbol">[</span>
                            <s-ellipsis-content :max-width="valueWidth" ref="comment" class="comment" :value="`${item.description ? '//' + item.description : ''}`"></s-ellipsis-content>
                            <s-tree-json :value-width="valueWidth" :data="item.children" :level="level + 1" :checkbox="checkbox" is-array></s-tree-json>
                            <span class="symbol">]</span>
                        </template>
                        <template v-else>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'string'" class="string-value" :value='`"${item.value}"`'></s-ellipsis-content>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'number'" class="number-value" :value="item.value"></s-ellipsis-content>
                            <s-ellipsis-content :max-width="valueWidth" v-if="item.type === 'boolean'" class="boolean-value" :value="item.value"></s-ellipsis-content>
                        </template>
                        <span class="symbol">,</span>
                    </span> 
                </template>
            </template>
            <!-- 文件类型 -->
            <template v-else-if="item.type === 'file' && (checkbox && item._select)">
                <template v-if="checkbox && item._select">
                    <span>
                        <input v-if="checkbox" v-model="item._select" type="checkbox" class="checkbox" @change="handleChangeCheckbox(item)">
                        <span class="key">{{ item.key }}</span><span class="symbol">:&nbsp;</span>
                        <span v-if="item.value">
                            <s-popover-file v-if="item._fileInfo" :mime="item._fileInfo.mime" :url="item._fileInfo.url">
                                <span slot="reference" class="teal cursor-pointer">查看</span>
                            </s-popover-file>
                            <s-ellipsis-content v-if="item._fileInfo" :max-width="200" class="white" :value="item._fileInfo.mime"></s-ellipsis-content>
                        </span>
                        <span class="symbol">,</span>   
                        <s-ellipsis-content :max-width="valueWidth" v-show="item.type !== 'object' || item.type !== 'array'" ref="comment" class="comment" :value="`${item.description ? '//' + item.description : ''}`"></s-ellipsis-content>
                        <span v-if="item.required" class="comment">(必填)</span>
                    </span>                                       
                </template>
                <template v-if="!checkbox">
                    <span>
                        <input v-if="checkbox" v-model="item._select" type="checkbox" class="checkbox" @change="handleChangeCheckbox(item)">
                        <span class="key">{{ item.key }}</span><span class="symbol">:&nbsp;</span>
                        <span v-if="item.value">
                            <s-popover-file v-if="item._fileInfo" :mime="item._fileInfo.mime" :url="item._fileInfo.url">
                                <span slot="reference" class="teal cursor-pointer">查看</span>
                            </s-popover-file>
                            <s-ellipsis-content v-if="item._fileInfo" :max-width="200" class="white" :value="item._fileInfo.mime"></s-ellipsis-content>
                        </span>
                        <span class="symbol">,</span>   
                        <s-ellipsis-content :max-width="valueWidth" v-show="item.type !== 'object' || item.type !== 'array'" ref="comment" class="comment" :value="`${item.description ? '//' + item.description : ''}`"></s-ellipsis-content>
                        <span v-if="item.required" class="comment">(必填)</span>
                    </span>   
                </template>
            </template>
        </div>
        <span v-if="level === 0" class="symbol">}</span>
    </div>
</template>

<script>
import { dfsForest } from "@/lib/index"
export default {
    name: "STreeJson",
    props: {
        data: {
            type: [Object, Array],
            default() {
                return {};
            }
        },
        level: {
            type: Number,
            default: 0
        },
        indent: {
            type: Number,
            default: 20
        },
        path: {
            type: String,
            default: ""
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
        isArray: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: ""
        },
        valueWidth: {
            type: String,
            default: "200px"
        },
        checkbox: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        data: {
            handler(val) {
                // console.log(222, val)
                if (val && this.$refs["comment"] && this.$refs["comment"].length > 0) {
                    this.$refs["comment"].forEach(commentDom => {
                        // const previouseElementSiblingOffsetLeft = commentDom.$el.previousElementSibling.offsetLeft;
                        commentDom.$el.style.marginLeft = 5 + "px"
                    });
                }
            },
            deep: true
        }
    },
    data() {
        return { 
        };
    },
    mounted() {
        
    },
    methods: {
        
        //多选框
        handleChangeCheckbox(node) {
            const children = node.children;
            // console.log(22, children, this.data)
            if (Array.isArray(children)) {
                dfsForest(children, {
                    rCondition(value) {
                        return value.children && value.children.length > 0;
                    },
                    rKey: "children",
                    hooks: (val) => {
                        this.$set(val, "_select", node._select)
                    }
                });
            }
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.tree-json-inner {

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
        color: $orange;
        font-size: .9em;
    }
    .boolean-value {
        color: #499CB3;
        font-size: .9em;
    }
    .number-value {
        color: #80C0A8;
        font-size: .9em;
    }
    .comment {
        color: #6A9955;
    }
    .checkbox {
        margin: 0;
        padding: 0;
        vertical-align: -2px;
        cursor: pointer;
        margin-right: size(2);
    }

}

</style>
