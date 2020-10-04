/*
    创建者：shuxiaokai
    创建时间：2019-08-22 17:43
    模块名称：xxxx
    备注：xxxx
*/
<template>
    <el-col :xs="grid.xs" :sm="grid.sm" :md="grid.md" :lg="grid.lg" :xl="grid.xl">
        <div class="s-label-item-wrap">
            <span class="s-label-item-label text-ellipsis" :style="{width: labelWidth + 'px'}" :title="label">{{ label }}:&nbsp;&nbsp;</span>
            <span class="s-label-item-value text-ellipsis2" :title="value">{{ value ? value : placeholder }}</span>
            <span v-if="value && suffix">{{ suffix }}</span>
            <slot name="tail"></slot>
        </div>
    </el-col>
</template>

<script>
export default {
    props: {
        label: {
            //label值
            type: String,
            default: ""
        },
        value: {
            //value值
            type: [String, Number],
            default: ""
        },
        suffix: {
            //value值额外后缀
            type: String,
            default: ""
        },
        placeholder: {
            //占位符，若value值为空则返回占位符
            type: String,
            default: "/"
        },
        oneline: {
            type: Boolean,
            default: false
        },
        halfline: {
            type: Boolean,
            default: false
        },
        grid: {
            type: Object,
            default() {
                return {
                    xs: 24,
                    sm: 24,
                    md: 12,
                    lg: 12,
                    xl: 6
                };
            }
        }
    },
    data() {
        return {};
    },
    computed: {
        labelWidth() {
            let parent = this.$parent;
            while (parent.$options.name !== "LabelView") {
                parent = parent.$parent;
                if (parent === this.$root) {
                    break;
                }
            }
            return parent.labelWidth || 100;
        }
    },
    watch: {
        oneLine() {
            this.checkSpecialLine();
        },
        halfline() {
            this.checkSpecialLine();
        }
    },
    created() {
        this.checkSpecialLine();
    },
    methods: {
        checkSpecialLine() {
            if (this.oneline) {
                this.grid.xl = 24;
                this.grid.lg = 24;
                this.grid.md = 24;
                this.grid.sm = 24;
                this.grid.xs = 24;
            } else if (this.halfline) {
                this.grid.xl = 12;
                this.grid.lg = 12;
                this.grid.md = 24;
                this.grid.sm = 24;
                this.grid.xs = 24;
            }
        }
    }
};
</script>

<style lang="scss">
.s-label-item-wrap {
    height: 25px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}
.s-label-item-label {
    flex: 0 0 auto;
    flex-wrap: nowrap;
    text-align: right;
    color: $gray-900;
    overflow: hidden;
    text-overflow: ellipsis;
}
.s-label-item-value {
    color: $gray-600;
}
</style>
