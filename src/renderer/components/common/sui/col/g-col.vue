/*
    创建者：shuxiaokai
    创建时间：2020-03-30 16:51
    模块名称：col 响应式布局col
    备注：xxxx
*/
<template>
    <el-col v-if="!noCol" :xs="24" :sm="24" :md="md" :lg="lg" :xl="xl">
        <slot />
    </el-col>
    <div v-else>
        <slot />
    </div>
</template>

<script>
export default {
    props: {
        oneLine: {
            type: Boolean,
            default: false
        },
        halfLine: {
            type: Boolean,
            default: false,
        },
        noCol: { //不存在col
            type: Boolean,
            default: false
        },
    },
    data() {
        return {

        };
    },
    computed: {
        md() { //处理oneline和halfLine
            if (this.oneLine) {
                return 24;
            } else if (this.halfLine) {
                return 12;
            } else {
                return 12;
            }
        },
        lg() { //处理oneline和halfLine
            if (this.oneLine) {
                return 24;
            } else if (this.halfLine) {
                return 12;
            } else {
                return 6;
            }
        },
        xl() { //处理oneline和halfLine
            if (this.oneLine) {
                return 24;
            } else if (this.halfLine) {
                return 12;
            } else {
                return 6;
            }
        },
    },
    created() {

    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    },
    
    
};
</script>



<style lang="scss">

</style>
