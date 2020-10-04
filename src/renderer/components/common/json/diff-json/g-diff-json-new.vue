/*
    创建者：shuxiaokai
    创建时间：2020-07-28 15:21
    模块名称：json类型数据展示，支持备注信息
    备注：xxxx
*/
<template>
    <div class="diff-tree-json-new">
        <span v-if="level === 0" class="symbol">{</span>
        <div v-for="(item, index) in data" :key="index" class="indent">
            <!-- 常规数据类型 -->
            <template v-if="item.type.new !== 'array' && item.type.new !== 'object'">
                <span class="d-inline-block w-100" :class="{'add-line': (item.operation.newOp === 'add' && !addLine), 'delete-line': (item.operation.newOp === 'delete' && !deleteLine)}">
                    <span v-if="item.operation.newOp === 'add'" class="white">+</span>
                    <span v-if="item.operation.newOp === 'delete'" class="white">-</span>
                    <span v-if="!isArray" class="key">{{ item.key.new }}</span>
                    <span v-if="!isArray" class="symbol">:&nbsp;</span>
                    <template>
                        <s-ellipsis-content v-if="item.type.new === 'string'" class="string-value" :value='`"${item.value.new}"`'></s-ellipsis-content>
                        <s-ellipsis-content v-if="item.type.new === 'number'" class="number-value" :value="item.value.new"></s-ellipsis-content>
                        <s-ellipsis-content v-if="item.type.new === 'boolean'" class="boolean-value" :value="item.value.new"></s-ellipsis-content>
                    </template>
                    <span class="symbol">,</span>
                    <s-ellipsis-content v-show="item.type.new !== 'object' || item.type.new !== 'array'" ref="comment" class="comment" :value="`//${item.description.new}`"></s-ellipsis-content>
                    <span v-if="item.required" class="comment">(必填)</span>
                </span>      
            </template>
            <!-- 对象和数组类型 -->
            <template v-else-if="item.type.new === 'array'|| item.type.new === 'object'">
                <span class="d-inline-block w-100" :class="{'add-line': (item.operation.newOp === 'add' && !addLine), 'delete-line': (item.operation.newOp === 'delete' && !deleteLine)}">
                    <span v-if="item.operation.newOp === 'add'" class="white">+</span>
                    <span v-if="item.operation.newOp === 'delete'" class="white">-</span>
                    <span v-if="!isArray" class="key">{{ item.key.new }}</span>
                    <span v-if="!isArray" class="symbol">:&nbsp;</span>
                    <template v-if="item.type.new === 'object'">
                        <span class="symbol">{</span>
                        <s-ellipsis-content ref="comment" class="comment" :value="`//${item.description.new}`"></s-ellipsis-content>
                        <s-diff-json-new :delete-line="item.operation.newOp === 'delete'" :add-line="item.operation.newOp === 'add'" :data="item.children" :level="level + 1"></s-diff-json-new>
                        <span class="symbol">}</span>
                    </template>
                    <template v-else-if="item.type.new === 'array'">
                        <span class="symbol">[</span>
                        <s-ellipsis-content ref="comment" class="comment" :value="`//${item.description.new}`"></s-ellipsis-content>
                        <s-diff-json-new :delete-line="item.operation.newOp === 'delete'" :add-line="item.operation.newOp === 'add'" :data="item.children" :level="level + 1" is-array></s-diff-json-new>
                        <span class="symbol">]</span>
                    </template>
                    <template v-else>
                        <s-ellipsis-content v-if="item.type.new === 'string'" class="string-value" :value='`"${item.value.new}"`'></s-ellipsis-content>
                        <s-ellipsis-content v-if="item.type.new === 'number'" class="number-value" :value="item.value.new"></s-ellipsis-content>
                        <s-ellipsis-content v-if="item.type.new === 'boolean'" class="boolean-value" :value="item.value.new"></s-ellipsis-content>
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
        deleteLine: {
            type: Boolean,
            default: false
        },
        addLine: {
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
.diff-tree-json-new {
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
    .add-line {
        background-color: rgba($green, 0.5);
    }
    .delete-line {
        background-color: rgba($red, 0.5);
    }
}

</style>
