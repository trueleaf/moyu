/*
    创建者：shuxiaokai
    创建时间：2021-07-21 22:30
    模块名称：导航栏
    备注：
*/
<template>
    <div class="nav">
        <div class="tab-wrap">
            <div class="btn left" @click="moveLeft">
                <i class="el-icon-arrow-left"></i>
            </div>
            <!-- https://github.com/element-plus/element-plus/issues/2293 -->
            <el-scrollbar view-style="display:inline-block;">
                <div class="tab-list">
                    <s-draggable v-model="tabs" animation="150" item-key="name" group="operation" class="d-flex">
                        <template #item="{ element }">
                            <div
                                ref="tabItem"
                                :title="element.label"
                                class="item"
                                :class="{active: element.selected}"
                                @click="selectCurrentTab(element)"
                            >
                                <!-- 接口文档 -->
                                <template v-if="element.tabType === 'doc'">
                                    <!-- <template v-for="(req) in validRequestMethods">
                                        <span v-if="element.tail === req.value.toLowerCase()" :key="req.value" class="mr-2" :style="{color: req.iconColor}">{{ req.name }}</span>
                                    </template> -->
                                </template>
                                <!-- 其他 -->
                                <template v-else>
                                    <!-- 配置 -->
                                    <span v-if="element.tabType === 'config'" class="el-icon-setting f-base mr-2"></span>
                                    <!-- 参数模板 -->
                                    <span v-if="element.tabType === 'paramsTemplate'" class="el-icon-setting f-base mr-2"></span>
                                    <!-- 链接 -->
                                    <span v-if="element.tabType === 'onlineLink'" class="el-icon-link orange f-base mr-2"></span>
                                    <!-- 导出文档 -->
                                    <span v-if="element.tabType === 'exportDoc'" class="el-icon-share green f-base mr-2"></span>
                                    <!-- 导入文档 -->
                                    <span v-if="element.tabType === 'importDoc'" class="el-icon-download red f-base mr-2"></span>
                                    <!-- 历史记录 -->
                                    <span v-if="element.tabType === 'history'" class="el-icon-time blue f-base mr-2"></span>
                                    <!-- 全局变量配置 -->
                                    <span v-if="element.tabType === 'variable'" class="el-icon-truck blue f-base mr-2"></span>
                                    <!-- mock管理 -->
                                    <span v-if="element.tabType === 'mock'" class="el-icon-coffee-cup teal f-base mr-2"></span>
                                    <!-- 回收站管理 -->
                                    <span v-if="element.tabType === 'recycler'" class="el-icon-delete-solid red f-base mr-2"></span>
                                </template>
                                <span class="item-text" :class="{ unfixed: !element.fixed }">{{ element.label }}</span>
                                <span class="operaion">
                                    <span v-show="!element.saved" class="has-change">
                                        <span class="dot"></span>
                                    </span>
                                    <i v-show="element.saved" class="el-icon-close close" @click.stop="handleCloseCurrent(element)"></i>
                                </span>
                            </div>
                        </template>
                    </s-draggable>            
                </div>
            </el-scrollbar>
            <div class="btn right" @click="moveRight">
                <i class="el-icon-arrow-right"></i>
            </div>
        </div>
        <!-- <div :title="element.name">
            <svg class="svg-icon" aria-hidden="true" @click="handleEmit(element.op)">
                <use :xlink:href="element.icon"></use>
            </svg>
        </div> -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import draggable from "vuedraggable"
import type { ApidocTab } from "@@/store"

export default defineComponent({
    components: {
        "s-draggable": draggable,
    },
    data() {
        return {
        };
    },
    computed: {
        tabs: {
            get(): ApidocTab[] {
                const projectId = this.$route.query.id as string;
                return this.$store.state["apidoc/tabs"].tabs[projectId]
            },
            set(val) { //拖拽tabs会导致数据写入
                this.$store.commit("apidoc/tabs/updateAllTabs", {
                    projectId: this.$route.query.id,
                    tabs: val,
                });
            },
        },
    },
    created() {
        this.$store.commit("apidoc/tabs/initLocalTabs", {
            projectId: this.$route.query.id,
        });
    },
    methods: {
        moveLeft() {
            console.log("left")
        },
        moveRight() {
            console.log("right")
        },
        //关闭当前tab
        handleCloseCurrent(element: ApidocTab) {
            const projectId = this.$route.query.id;
            this.$store.commit("apidoc/tabs/deleteTabByIds", {
                projectId,
                ids: [element._id]
            });
        },
        //选中当前tab
        selectCurrentTab(element: ApidocTab) {
            const projectId = this.$route.query.id;
            this.$store.commit("apidoc/tabs/selectTabById", {
                projectId,
                id: element._id
            });
        },
    },
})
</script>

<style lang="scss">
.nav {
    width: 100%;
    height: size(40);
    background: #eee;
    display: flex;
    // tab包裹框
    .tab-wrap {
        width: 90%;
        min-width: 300px;
        overflow-x: hidden;
        overflow-y: hidden;
        position: relative;
        .btn {
            flex: 0 0 auto;
            height: size(40);
            width: size(25);
            z-index: $zIndex-tabs;
            background: $gray-200;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: $box-shadow-base;
            position: absolute;
            top: 0;
            &.left {
                left: 0;
            }
            &.right {
                right: 0;
            }
            &:hover {
                background-color: $gray-300;
            }
        }
    }
    .tab-list {
        width: calc(100% - #{size(50)});
        line-height: 40px;
        height: 40px;
        color: #5f6368;
        white-space: nowrap;
        margin-left: size(25);
        transition: left .1s;
        .item {
            display: flex;
            align-items: center;
            position: relative;
            font-size: 12px;
            flex: 0 0 auto;
            width: 200px;
            cursor: default;
            padding: 0 size(10);
            border-right: 1px solid $gray-400;
            .item-text {
                display: inline-block;
                width: size(150);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: fz(13);
                &.unfixed {
                    font-style: Italic;
                }
            }
            background: rgb(222, 225, 230);
            &:hover {
                background: #e2e2e2;
            }
            .iconfont {
                font-size: 16px;
                display: flex;
                align-items: center;
            }
            &.active {
                background: #f0f3fa;
            }
        }
        .operaion {
            position: absolute;
            right: 0;
            width: size(25);
            height: 100%;
            cursor: pointer;
            &:hover > .has-change {
                display: none;
            }
            &:hover > .close {
                display: inline-flex!important;
            }
            .close {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                cursor: pointer;
                line-height: 1.5;
                width: size(20);
                height: size(20);
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                z-index: 1;
                font-size: fz(16);
                &:hover {
                    background: #ccc;
                }
            }
            .has-change {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: size(20);
                height: size(20);
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
                .dot {
                    width: size(10);
                    height: size(10);
                    border-radius: 50%;
                    background: mix($teal, $white, 90%);
                }
            }
    }
    }
    //滚动条样式
    .el-scrollbar__bar {
        bottom: 0;
    }
}
</style>
