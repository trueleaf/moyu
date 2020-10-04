/*
    创建者：shuxiaokai
    创建时间：2020-03-20 09:25
    模块名称：图标文本数字组件
    备注：常见左侧为图标，右侧为 上下结构 文本数字
*/
<template>
    <div ref="sIconCard" class="s-icon-card">
        <!-- head -->
        <div ref="head" class="head">
            <slot name="head" />
        </div>
        <div class="d-flex flex-column j-around pl-1 h-100">
            <!-- title -->
            <div ref="title" class="title text-ellipsis">
                <slot name="title" />
            </div>
            <!-- subtitle -->
            <div v-if="!$slots.subtitle" class="subtitle">{{ subtitle }}</div>
            <div v-else class="subtitle">
                <slot name="subtitle" />
            </div>
        </div>
        <div class="tail"></div>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: ""
        },  
        subtitle: {
            type: String,
            default: ""
        },
    },
    data() {
        return {
            width: 0,
        };
    },
    mounted() {
        this.bindEvent();
    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        bindEvent() {
            // const dom = this.$refs["sIconCard"];
            // const domConfig = { attributes: true, childList: false, subtree: false };
            // const observer = new MutationObserver((mutationsList) => {
            //     this.resizeDomRect();
            // });
            // observer.observe(dom, domConfig)            
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
    .s-icon-card {
        width: size(200);
        height: size(90);
        padding: size(5) size(10);
        display: inline-flex;
        //head
        .head {
            width: 50%;
            height: 100%;
            user-select: none;
        }
        //标题
        .title {
            font-size: fz(16);
        }
        //副标题
        .subtitle {
            font-size: fz(25);
        }
        //尾部 
        .tail {

        }
    }
</style>
