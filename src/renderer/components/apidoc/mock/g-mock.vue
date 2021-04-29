/*
    创建者：shuxiaokai
    创建时间：2021-04-28 19:54
    模块名称：
    备注：
*/
<template>
    <div class="s-mock-select" @click="handleClick">
        <el-tabs v-model="activeName">
            <el-tab-pane label="全部" name="all">
            </el-tab-pane>
            <el-tab-pane label="日期/时间" name="日期/时间"></el-tab-pane>
            <el-tab-pane label="图片" name="图片"></el-tab-pane>
            <el-tab-pane label="中文文本" name="中文文本"></el-tab-pane>
            <el-tab-pane label="英文文本" name="英文文本"></el-tab-pane>
            <el-tab-pane label="地区相关" name="地区相关"></el-tab-pane>
            <el-tab-pane label="颜色" name="颜色"></el-tab-pane>
        </el-tabs>
        <div class="wrap">
            <div class="list">
                <div v-for="(item, index) in mockEnum" :key="index" class="list-item" @mouseenter="handleMockView(item)" @click="handleSelectMockData(item)">
                    <span>{{ item.value }}</span>
                    <span>{{ item.name }}</span>
                </div>
            </div>
            <div class="bar"></div>
            <div class="preview">
                <span v-if="mockTags.indexOf('图片') === -1">{{ mockValue }}</span>
                <el-image v-else :src="mockValue" fit="contain"></el-image>
            </div>
        </div>
    </div>
</template>

<script>
import Mock from "@/server/mock"
import mockEnum from "./mock-enum";

export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            //===================================枚举参数====================================//
            //===================================业务参数====================================//
            activeName: "all",
            mockValue: "",
            mockTags: "",
            //===================================其他参数====================================//
        };
    },
    computed: {
        mockEnum() {
            if (this.activeName === "all") {
                return mockEnum;
            }
            return mockEnum.filter((val) => val.tags.find((tag) => tag === this.activeName));
        },
    },
    created() {

    },
    methods: {
        handleClick() {
        },
        handleMockView(item) {
            this.mockValue = Mock.mock(`@${item.value}`)
            this.mockTags = item.tags;
        },
        handleSelectMockData(item) {
            this.$emit("select", item);
        },
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.s-mock-select {
    width: size(700);
    height: size(250);
    .wrap {
        height: size(220);
        display: flex;
        .list {
            padding: size(10) 0;
            flex: 0 0 60%;
            height: 100%;
            overflow-y: auto;
            .list-item {
                height: size(30);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 size(10);
                &:hover {
                    background: $gray-200;
                    cursor: pointer;
                }
            }
        }
        .bar {
            height: 100%;
            width: size(1);
            background: $gray-400;
        }
        .preview {
            padding: size(10);
            height: 100%;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: fz(16);
            overflow: hidden;
        }
    }
    .el-tabs__header {
        margin-bottom: 0;
    }
}
</style>
