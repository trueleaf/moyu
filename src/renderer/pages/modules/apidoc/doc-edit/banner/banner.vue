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
                @node-contextmenu="handleContextmenu"
            >
                <template #default="scope">
                    <div
                        class="custom-tree-node"
                        tabindex="0"
                        @mouseenter.stop="handleHoverNode($event, scope.data)"
                        @mouseleave="hoverNode = null"
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
                            <el-popover 
                                v-if="hoverNode?._id === scope.data._id || showMoreOpNode?._id === scope.data._id" 
                                v-model:visible="showBannerOperation" 
                                popper-class="banner-popover"
                                transition="none" 
                                placement="bottom-end" 
                                trigger="manual"
                                :width="240" 
                            >
                                <template #reference>
                                    <div class="more" @click.stop="handleClickMoreOperation(scope.data)">
                                        <i class="more-op el-icon-more" title="更多操作"></i>
                                    </div>
                                </template>
                                <s-contextmenu-item label="复制" hot-key="Ctrl + C"></s-contextmenu-item>
                                <s-contextmenu-item label="生成副本" hot-key="Ctrl + V"></s-contextmenu-item>
                                <s-contextmenu-item type="divider"></s-contextmenu-item>
                                <s-contextmenu-item label="重命名" hot-key="F12"></s-contextmenu-item>
                                <s-contextmenu-item label="删除" hot-key="Delete"></s-contextmenu-item>
                            </el-popover>
                        </template>
                        <!-- 文件夹渲染 -->
                        <template v-if="scope.data.isFolder">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" class="folder-icon" />
                            <div v-if="editNode?._id !== scope.data._id" class="node-label-wrap">
                                <s-emphasize class="node-top" :title="scope.data.name" :value="scope.data.name"></s-emphasize>
                                <div v-show="showMoreNodeInfo" class="node-bottom">{{ scope.data.url }}</div>
                            </div>
                            <el-popover 
                                v-if="hoverNode?._id === scope.data._id || showMoreOpNode?._id === scope.data._id" 
                                v-model:visible="showBannerOperation" 
                                popper-class="banner-popover"
                                transition="none" 
                                placement="bottom-end" 
                                trigger="manual"
                                :width="240" 
                            >
                                <template #reference>
                                    <div class="more" @click.stop="handleClickMoreOperation(scope.data)">
                                        <i class="more-op el-icon-more" title="更多操作"></i>
                                    </div>
                                </template>
                                <s-contextmenu-item label="新建文档"></s-contextmenu-item>
                                <s-contextmenu-item label="新建文件夹"></s-contextmenu-item>
                                <s-contextmenu-item label="以模板新建"></s-contextmenu-item>
                                <s-contextmenu-item type="divider"></s-contextmenu-item>
                                <s-contextmenu-item label="剪切" hot-key="Ctrl + X"></s-contextmenu-item>
                                <s-contextmenu-item label="复制" hot-key="Ctrl + C"></s-contextmenu-item>
                                <s-contextmenu-item label="粘贴" hot-key="Ctrl + V" disabled></s-contextmenu-item>
                                <s-contextmenu-item type="divider"></s-contextmenu-item>
                                <s-contextmenu-item label="重命名" hot-key="F12"></s-contextmenu-item>
                                <s-contextmenu-item label="删除" hot-key="Delete"></s-contextmenu-item>
                            </el-popover>
                        </template>
                    </div>
                </template>
            </el-tree>
        </s-loading>
        <!-- 鼠标右键 -->
        <teleport to="body">
            <s-contextmenu v-show="showContextmenu" :left="contextmenuLeft" :top="contextmenuTop">
                <s-contextmenu-item label="新建文档"></s-contextmenu-item>
                <s-contextmenu-item label="新建文件夹"></s-contextmenu-item>
                <s-contextmenu-item label="以模板新建"></s-contextmenu-item>
                <s-contextmenu-item type="divider"></s-contextmenu-item>
                <s-contextmenu-item label="剪切" hot-key="Ctrl + X"></s-contextmenu-item>
                <s-contextmenu-item label="复制" hot-key="Ctrl + C"></s-contextmenu-item>
                <s-contextmenu-item label="粘贴" hot-key="Ctrl + V" disabled></s-contextmenu-item>
                <s-contextmenu-item type="divider"></s-contextmenu-item>
                <s-contextmenu-item label="重命名" hot-key="F12"></s-contextmenu-item>
                <s-contextmenu-item label="删除" hot-key="Delete"></s-contextmenu-item>
            </s-contextmenu>
        </teleport>
    </s-resize-x>
</template>

<script lang="ts">
import { useStore } from "@/store/index"
import { defineComponent, computed, ref, Ref, onMounted, onUnmounted } from "vue"
import tool from "./components/tool/tool.vue"
import { useBannerData } from "./composables/banner-data"
import type { ApidocBanner } from "@@/global"

export default defineComponent({
    components: {
        "s-tool": tool,
    },
    setup() {
        /*
        |--------------------------------------------------------------------------
        | 变量、函数等内容声明
        |--------------------------------------------------------------------------
        */
        const store = useStore();
        const editNode: Ref<ApidocBanner | null> = ref(null); //正在编辑的节点
        const showMoreNodeInfo = ref(false);  //banner是否显示更多内容
        /*
        |--------------------------------------------------------------------------
        | 获取banner数据
        |--------------------------------------------------------------------------
        */
        const { loading, bannerData, getBannerData } = useBannerData();
        /*
        |--------------------------------------------------------------------------
        | 获取项目基本信息
        |--------------------------------------------------------------------------
        */
        const projectInfo = computed(() => {
            return store.state["apidoc/baseInfo"];
        });
        /*
        |--------------------------------------------------------------------------
        | 鼠标移动到banner节点，显示更多操作。
        | 鼠标右键显示更多操作
        |--------------------------------------------------------------------------
        */
        const hoverNode: Ref<ApidocBanner | null> = ref(null);
        const showMoreOpNode: Ref<ApidocBanner | null> = ref(null);
        const showContextmenu = ref(false);
        const showBannerOperation = ref(false);
        const contextmenuLeft = ref(0);
        const contextmenuTop = ref(0);
        const handleHoverNode = (e: MouseEvent, data: ApidocBanner) => {
            hoverNode.value = data;
        }
        const handleClickMoreOperation = (data: ApidocBanner) => {
            if (showBannerOperation.value) { //说明更多操作是打开的，再次点击关闭操作面板
                showMoreOpNode.value = null;
                showBannerOperation.value = false;
            } else {
                showMoreOpNode.value = data;
                showBannerOperation.value = true;
            }
        }
        const handleContextmenu = (e: MouseEvent, data: ApidocBanner) => {
            showContextmenu.value = true;
            contextmenuLeft.value = e.clientX;
            contextmenuTop.value = e.clientY;
            console.log(data)
        }
        /*
        |--------------------------------------------------------------------------
        | 鼠标右键或则点击更多按钮，对节点的 新增、修改、删除、复制、粘贴、拷贝
        |--------------------------------------------------------------------------
        */
        /*
        |--------------------------------------------------------------------------
        | 其他操作
        |--------------------------------------------------------------------------
        | 1. 清空事件绑定
        | 2. 处理全局点击某些弹窗隐藏
        |
        */
        const handleGlobalClick = () => {
            hoverNode.value = null;
            showMoreOpNode.value = null;
            showContextmenu.value = false;         
            showBannerOperation.value = false;   
        }
        onMounted(() => {
            document.documentElement.addEventListener("click", handleGlobalClick);
        })
        onUnmounted(() => {
            document.documentElement.removeEventListener("click", handleGlobalClick);
        })

        return {
            projectInfo,
            bannerData,
            loading,
            editNode,
            showMoreNodeInfo,
            showBannerOperation,
            hoverNode,
            showMoreOpNode,
            showContextmenu,
            contextmenuLeft,
            contextmenuTop,
            getBannerData,
            handleHoverNode,
            handleClickMoreOperation,
            handleContextmenu,
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
    // 自定义节点
    .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        overflow: hidden;
        // padding: size(5) 0;
        min-height: size(30);
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
            flex: 1;
            overflow: hidden;
            .node-top {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .node-bottom {
                color: $gray-500;
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        .more {
            flex: 0 0 auto;
            margin-left: auto;
            padding: size(5) size(10);
        }
    }
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
    }
    .el-tree-node__content>.el-tree-node__expand-icon {
        transition: none; //去除所有动画
        padding-top: 0;
        padding-bottom: 0;
        margin-top: -1px;
    }
}
.banner-popover {
    .op-item {
        @include contextmenu-item;
    }
}
</style>
