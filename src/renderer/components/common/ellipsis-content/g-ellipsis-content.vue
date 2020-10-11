/*
    创建者：shuxiaokai
    创建时间：2020-07-28 17:09
    模块名称：文字包裹区域(自动处理溢出和提示)
    备注：xxxx
*/
<template>
    <span>
        <el-tooltip effect="light" placement="top-start" :content="value.toString()" :disabled="!isOverflow">
            <span ref="text" class="s-ellipsis-content" @dblclick="handleSelect">{{ value }}</span>
        </el-tooltip>        
        <!-- <span v-if="copy" v-copy="value" class="el-icon-document-copy cursor-pointer orange"></span> -->
    </span>

</template>

<script>
export default {
    props: {
        value: {
            type: [String, Number, Boolean],
            default: ""
        },
        maxWidth: {
            type: [String, Number],
            default: 100
        },
        copy: {
            type: [Boolean],
            default: false
        }
    },
    watch: {
        value: {
            handler() {
                this.changeValueWidth();
                setTimeout(() => {
                    const textDom = this.$refs["text"];
                    if (textDom) {
                        const textOverWidth = textDom.scrollWidth;
                        const warpWidth = textDom.getBoundingClientRect()["width"];
                        this.isOverflow = textOverWidth > Math.ceil(warpWidth);
                    }                    
                })

            },
            immediate: true,
        }
    },
    data() {
        return {
            isOverflow: false
        };
    },
    mounted() {
        this.changeValueWidth();
    },
    methods: {
        changeValueWidth() {
            const textDom = this.$refs["text"];
            if (!textDom) {
                return;
            }
            if (typeof this.maxWidth === "number") {
                textDom.style.maxWidth = this.maxWidth + "px"
            } else if (typeof this.maxWidth === "string") {
                textDom.style.maxWidth = this.maxWidth
            }
        },
        handleSelect(e) {
            // const selection = window.getSelection();
            // selection.removeAllRanges();
            // const range = document.createRange();
            // range.selectNodeContents(e.target);
            // selection.addRange(range);
        }
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.s-ellipsis-content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: -3px;
    display: inline-block;
}
</style>
