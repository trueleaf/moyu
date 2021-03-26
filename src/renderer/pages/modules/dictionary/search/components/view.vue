/*
    创建者：shuxiaokai
    创建时间：2021-03-19 14:15
    模块名称：预览界面
    备注：
*/
<template>
    <div class="s-view">
        <h2>北京市</h2>
        <s-label-value one-line label-width="auto" label="中文名称：">北京市</s-label-value>
        <s-label-value one-line label-width="auto" label="英文名称：">socialVvv</s-label-value>
        <s-label-value one-line label-width="auto" label="词汇举例：">赋能</s-label-value>
        <s-label-value one-line label-width="auto" label="百度百科：">
            <a href="https://www.baidu.com" target="__blank">北京市</a>
        </s-label-value>
        <div class="user">
            <span>周大川&nbsp;</span>
            <span>更新于</span>
            <span>2021-03-04 22:00</span>
        </div>
        <el-divider></el-divider>
        <div class="view-content">
            北京市，简称“京”，古称燕京、北平，是中华人民共和国的首都、直辖市、国家中心城市、超大城市，国务院批复确定的中国政治中心、文化中心、国际交往中心、科技创新中心 [1]  。截至2018年，全市下辖16个区，总面积16410.54平方千米，2019年末，常住人口2153.6万人，城镇人口1865万人，城镇化率86.6% [2]  ，常住外来人口达794.3万人。 [3]
        </div>
        <div class="operation-area">
            <el-button type="text" @click="handleEdit">编辑词条</el-button>
            <el-button type="text" @click="handleAdd">新增</el-button>
            <el-button type="text" @click="handleClose">关闭</el-button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//

            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //编辑词条
        handleEdit() {
            this.$event.emit("dictionary/edit");
        },
        //新增词条
        handleAdd() {
            this.$event.emit("dictionary/add");
        },
        //关闭展示页面
        handleClose() {
            this.$event.emit("dictionary/closeView");
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss" scoped>
.s-view {
    margin-top: size(20);
    min-width: size(550);
    width: 50%;
    border: 1px solid $gray-300;
    padding: 0 size(20) size(25);
    position: relative;
    .el-divider--horizontal {
        margin: size(5) 0 size(5);
    }
    .operation-area {
        position: absolute;
        right: size(20);
        top: size(10);
    }
    .user {
        color: $gray-500;
        position: absolute;
        bottom: size(5);
        right: size(20);
    }
    .view-content {
        max-height: size(300);
        overflow-y: auto;
        padding: size(10) 0;
    }
}
</style>
