/*
    创建者：shuxiaokai
    创建时间：2021-07-21 21:00
    模块名称：
    备注：
*/
<template>
    <s-resize-x :min="280" :max="450" :width="300" name="banner" class="banner" tabindex="1">
        <s-tool></s-tool>
        <s-loading ref="bannerRef" :loading="loading">
            <el-tree
                ref="docTree"
                class="flex0"
                :class="{ 'show-more': showMoreNodeInfo }"
                :data="bannerData"
                node-key="_id"
                empty-text="点击工具栏按钮新增文档或者鼠标右键新增"
            >
                <template #default="scope">
                    <div
                        class="custom-tree-node"
                        tabindex="0"
                    >
                        <!-- file渲染 -->
                        <template v-if="!scope.data.isFolder">
                            <template v-for="(req) in projectInfo.rules.requestMethods">
                                <span v-if="scope.data.method === req.value.toLowerCase()" :key="req.name" class="file-icon" :style="{color: req.iconColor}">{{ req.name }}</span>
                            </template>
                            <div v-if="editNode?._id !== scope.data._id" class="node-label-wrap">
                                <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                                <s-emphasize v-show="showMoreNodeInfo" class="node-bottom" :title="scope.data.url" :value="scope.data.url"></s-emphasize>
                            </div>
                            <!-- <input v-else v-model="scope.data.name" placeholder="不能为空" type="text" class="rename-ipt f-sm ml-1" @blur="handleChangeNodeName(scope.data)" @keydown.stop.enter="handleChangeNodeName(scope.data)"> -->
                        </template>
                        <template v-if="scope.data.isFolder">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" class="folder-icon" />
                            <div v-if="editNode?._id !== scope.data._id" class="node-label-wrap">
                                <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                                <div v-show="showMoreNodeInfo" class="node-bottom">{{ scope.data.url }}</div>
                            </div>
                            <!-- <input v-else v-model="scope.data.name" placeholder="不能为空" type="text" class="rename-ipt f-sm ml-1" @blur="handleChangeNodeName(scope.data)" @keydown.stop.enter="handleChangeNodeName(scope.data)"> -->
                        </template>
                    </div>
                </template>
            </el-tree>
        </s-loading>
    </s-resize-x>
</template>

<script lang="ts">
import { useStore } from "@/store/index"
import { defineComponent, computed, ref, Ref } from "vue"
import tool from "./components/tool/tool.vue"
import { useBannerData } from "./composables/banner-data"
import type { ApidocBanner } from "@@/global"

export default defineComponent({
    components: {
        "s-tool": tool,
    },
    setup() {
        const store = useStore();
        //获取banner数据
        const { loading, bannerData, getBannerData } = useBannerData();
        //获取项目基本信息
        const projectInfo = computed(() => {
            return store.state["apidoc/baseInfo"];
        });
        //正在编辑的节点
        const editNode: Ref<ApidocBanner | null> = ref(null);
        //banner是否显示更多内容
        const showMoreNodeInfo = ref(true);
        return {
            projectInfo,
            bannerData,
            loading,
            getBannerData,
            editNode,
            showMoreNodeInfo,
        };
    },
})
</script>

<style lang="scss">
.banner {
    flex: 0 0 auto;
    height: 100%;
    border-right: 1px solid $gray-400;
    display: flex;
    flex-direction: column;
    position: relative;
    // 禁用动画提高性能
    .collapse-transition {
        transition: none;
    }
    // 节点展示更多信息
    .show-more {
        .el-tree-node__content {
            align-items: flex-start;
            &>.el-tree-node__expand-icon {
                padding-top: size(4);
            }
        }
        .custom-tree-node {
            align-items: flex-start;
        }
        .file-icon {
            margin-top: size(2);
        }
    }
    .el-tree-node__content {
        height: auto;
        display: flex;
        align-items: center;
        padding: size(5) 0;
    }
    .el-tree-node__content>.el-tree-node__expand-icon {
        transition: none; //去除所有动画
        padding-top: 0;
        padding-bottom: 0;
        margin-top: -1px;
    }
    .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        .file-icon {
            font-size: fz(14);
            margin-right: size(5);
        }
        .folder-icon {
            flex: 0 0 auto;
            width: size(16);
            height: size(16);
            margin-right: size(5);
        }
        .node-label-wrap {
            display: flex;
            flex-direction: column;
            width: 100%;
            .node-top {
                width: 75%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .node-bottom {
                color: $gray-500;
                width: 80%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}
</style>
