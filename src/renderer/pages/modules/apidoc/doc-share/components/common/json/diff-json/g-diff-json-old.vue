/*
    创建者：shuxiaokai
    创建时间：2020-07-28 15:21
    模块名称：json类型数据展示，支持备注信息
    备注：xxxx
*/
<template>
    <div class="diff-tree-json-old">
        <span v-if="level === 0" class="symbol">{</span>
        <div v-for="(item, index) in data" :key="index" class="indent">
            <!-- 常规数据类型 -->
            <template v-if="item.type.old !== 'array' && item.type.old !== 'object'">
                <span v-if="item.operation.oldOp !== 'empty'" class="d-inline-block w-100" :class="{'exist-line': item.operation.oldOp === 'exist'}">
                    <!-- <span class="white">{{ item.operation.oldOp }}</span> -->
                    <span v-if="!isArray" class="key">{{ item.key.old }}</span>
                    <span v-if="!isArray" class="symbol">:&nbsp;</span>
                    <!-- 常规数据 -->
                    <template v-else>
                        <s-ellipsis-content v-if="item.type.old === 'string'" class="string-value" :value='`"${item.value.old}"`'></s-ellipsis-content>
                        <s-ellipsis-content v-if="item.type.old === 'number'" class="number-value" :value="item.value.old"></s-ellipsis-content>
                        <s-ellipsis-content v-if="item.type.old === 'boolean'" class="boolean-value" :value="item.value.old"></s-ellipsis-content>
                    </template>
                    <span class="symbol">,</span>
                    <s-ellipsis-content v-show="item.type.old !== 'object' || item.type.old !== 'array'" ref="comment" class="comment" :value="`//${item.description.old}`"></s-ellipsis-content>
                    <span v-if="item.required" class="comment">(必填)</span>
                </span>      
                <span v-else-if="item.operation.oldOp === 'empty'" class="d-inline-block w-100 empty-line">&nbsp;</span>
            </template>
            <!-- 对象和数组类型 -->
            <template v-else-if="item.type.old === 'array'|| item.type.old === 'object'">
                <span class="d-inline-block w-100" :class="{'exist-line': item.operation.oldOp === 'exist', 'empty-line': item.operation.oldOp === 'empty'}">
                    <span v-if="!isArray" class="key">{{ item.key.old }}</span>
                    <span v-if="!isArray" class="symbol">:&nbsp;</span>
                    <template v-if="item.type.old === 'object'">
                        <span class="symbol">{</span>
                        <s-ellipsis-content ref="comment" class="comment" :value="`//${item.description.old}`"></s-ellipsis-content>
                        <s-diff-json-old :data="item.children" :level="level + 1"></s-diff-json-old>
                        <span class="symbol">}</span>
                    </template>
                    <template v-else-if="item.type.old === 'array'">
                        <span class="symbol">[</span>
                        <s-ellipsis-content ref="comment" class="comment" :value="`//${item.description.old}`"></s-ellipsis-content>
                        <s-diff-json-old :data="item.children" :level="level + 1" is-array></s-diff-json-old>
                        <span class="symbol">]</span>
                    </template>
                    <template v-else>
                        <s-ellipsis-content v-if="item.type.old === 'string'" class="string-value" :value='`"${item.value.old}"`'></s-ellipsis-content>
                        <s-ellipsis-content v-if="item.type.old === 'number'" class="number-value" :value="item.value.old"></s-ellipsis-content>
                        <s-ellipsis-content v-if="item.type.old === 'boolean'" class="boolean-value" :value="item.value.old"></s-ellipsis-content>
                    </template>
                    <span class="symbol">,</span>
                </span> 
            </template>
        </div>
        <span v-if="level === 0" class="symbol">}</span>
    </div>
</template>

<script>
export default {
    name: "SDiffTreeJson",
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
        isArray: {
            type: Boolean,
            default: false
        },
    },
    watch: {
        data: {
            handler(val) {
                if (val && this.$refs["comment"] && this.$refs["comment"].length > 0) {
                    this.$refs["comment"].forEach(commentDom => {
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
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.diff-tree-json-old {
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
    .empty-line {
        width: 100%;
        background: $gray-700;
    }
    .exist-line {
        width: 100%;
        background: $gray-700;
    }

}

</style>
