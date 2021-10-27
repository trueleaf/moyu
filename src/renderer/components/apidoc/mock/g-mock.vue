/*
    创建者：shuxiaokai
    创建时间：2021-08-23 22:25
    模块名称：mock组件
    备注：
*/
<template>
    <div class="s-mock-select" @click.stop="() => {}">
        <el-tabs v-model="activeName">
            <el-tab-pane name="常用">
                <template #label>
                    <span>常用</span>
                    <span>
                        <span>(</span>
                        <span v-if="activeName === '常用'">{{ mockEnum.length }}</span>
                        <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "常用")).length }}</span>
                        <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "常用")).length }}</span>
                        <span>)</span>
                    </span>
                </template>
            </el-tab-pane>
            <el-tab-pane name="全部">
                <template #label>
                    <span>全部</span>
                    <span>
                        <span>(</span>
                        <span v-if="activeName === '全部'">{{ mockEnum.length }}</span>
                        <span v-else>{{ cpMockEnum.length }}</span>
                        <span>/{{ cpMockEnum.length }}</span>
                        <span>)</span>
                    </span>
                </template>
            </el-tab-pane>
            <el-tab-pane name="日期/时间">
                <template #label>
                    <span>日期&时间</span>
                    <span>
                        <span>(</span>
                        <span v-if="activeName === '日期/时间'">{{ mockEnum.length }}</span>
                        <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "日期/时间")).length }}</span>
                        <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "日期/时间")).length }}</span>
                        <span>)</span>
                    </span>
                </template>
            </el-tab-pane>
            <el-tab-pane label="图片" name="图片">
                <template #label>
                    <span>图片</span>
                    <span>
                        <span>(</span>
                        <span v-if="activeName === '图片'">{{ mockEnum.length }}</span>
                        <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "图片")).length }}</span>
                        <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "图片")).length }}</span>
                        <span>)</span>
                    </span>
                </template>
            </el-tab-pane>
            <el-tab-pane name="中文文本">
                <template #label>
                    <span>中文文本</span>
                    <span>
                        <span>(</span>
                        <span v-if="activeName === '中文文本'">{{ mockEnum.length }}</span>
                        <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "中文文本")).length }}</span>
                        <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "中文文本")).length }}</span>
                        <span>)</span>
                    </span>
                </template>
            </el-tab-pane>
            <el-tab-pane label="英文文本" name="英文文本">
                <template #label>
                    <span>英文文本</span>
                    <span>
                        <span>(</span>
                        <span v-if="activeName === '英文文本'">{{ mockEnum.length }}</span>
                        <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "英文文本")).length }}</span>
                        <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "英文文本")).length }}</span>
                        <span>)</span>
                    </span>
                </template>
            </el-tab-pane>
            <el-tab-pane label="地区相关" name="地区相关">
                <template #label>
                    <span>地区相关</span>
                    <span>
                        <span>(</span>
                        <span v-if="activeName === '地区相关'">{{ mockEnum.length }}</span>
                        <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "地区相关")).length }}</span>
                        <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "地区相关")).length }}</span>
                        <span>)</span>
                    </span>
                </template>
            </el-tab-pane>
            <el-tab-pane label="颜色" name="颜色">
                <template #label>
                    <span>颜色</span>
                    <span>
                        <span>(</span>
                        <span v-if="activeName === '颜色'">{{ mockEnum.length }}</span>
                        <span v-else>{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "颜色")).length }}</span>
                        <span>/{{ cpMockEnum.filter(v => v.tags.find((tag) => tag === "颜色")).length }}</span>
                        <span>)</span>
                    </span>
                </template>
            </el-tab-pane>
        </el-tabs>
        <div class="wrap">
            <div class="list" tabindex="-1">
                <div
                    v-for="(item, index) in mockEnum"
                    :key="index"
                    class="list-item"
                    @mouseenter="handleMockView(item)"
                    @click="handleSelectMockData(item)"
                >
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

<script lang="ts">
import { defineComponent } from "vue"
import type { MockItem } from "@@/global"
import Mock from "@/server/mock"
import mockEnum from "./mock-enum";

const cpMockEnum: MockItem[] = JSON.parse(JSON.stringify(mockEnum));

export default defineComponent({
    props: {
        /**
         * 过滤值
         */
        searchValue: {
            type: String,
            default: "",
        },
        /**
         * 点击非内容区域是否关闭
         */
        closeOnClickModal: {
            type: Boolean,
            default: true
        },
    },
    emits: ["select", "close"],
    data() {
        return {
            cpMockEnum,
            activeName: "常用",
            mockValue: "",
            mockTags: [] as string[],
            currentSelectMockData: null as MockItem | null,
            //===================================其他参数====================================//
        };
    },
    computed: {
        mockEnum() {
            const matchedMockData = mockEnum.filter((mock) => {
                const mockValue = mock.value;
                const searchValue = this.searchValue.toString().replace("@", "")
                return mockValue.includes(searchValue)
            });
            if (this.activeName === "全部") {
                return matchedMockData;
            }
            return matchedMockData.filter((val) => val.tags.find((tag) => tag === this.activeName))
        },
    },
    watch: {
        searchValue() {
            this.currentSelectMockData = mockEnum[0];
        },
    },
    mounted() {
        document.documentElement.addEventListener("click", this.handleCloseModel)
    },
    beforeUnmount() {
        document.documentElement.removeEventListener("click", this.handleCloseModel)
    },
    methods: {
        handleMockView(item: MockItem) {
            this.mockValue = Mock.mock(`@${item.value}`)
            this.mockTags = item.tags;
        },
        handleSelectMockData(item: MockItem) {
            this.$emit("select", item);
        },
        handleCloseModel() {
            this.$emit("close");
        },
    },
})
</script>

<style lang="scss">
.s-mock-select {
    width: size(700);
    height: size(250);
    background: $white;
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
                &.active {
                    background: $gray-200;
                }
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
