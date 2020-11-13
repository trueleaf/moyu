/*
    创建者：shuxiaokai
    创建时间：2020-06-24 20:33
    模块名称：文档管理banner导航页面
    备注：xxxx
*/
<template>
    <div class="banner">
        <!-- 搜索 -->
        <div class="tool">
            <h2 class="gray-700 f-lg text-center text-ellipsis" :title="$route.query.name">{{ $route.query.name }}</h2>
            <el-input v-model="queryData" class="doc-search" placeholder="支持文档名称，文档url搜索" clearable @input="handleSearchTree"></el-input>
        </div>
        <!-- 树形文档导航 -->
        <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)" class="doc-nav">
            <el-tree 
                    ref="docTree"
                    :data="navTreeData" 
                    node-key="_id" 
                    empty-text="暂无数据"
                    :default-expanded-keys="defaultExpandedKeys"
                    :expand-on-click-node="true" 
                    :draggable="enableDrag"
                    :filter-node-method="filterNode"
                    @node-expand="clearContextmenu"
                    @node-collapse="clearContextmenu"
                    @node-click="handleNodeClick" 
            >
                <template slot-scope="scope">
                    <div 
                            class="custom-tree-node"
                            :class="{'selected': multiSelectNode.find(val => val.data._id === scope.data._id), 'active': currentSelectDoc && currentSelectDoc._id === scope.data._id}"
                            tabindex="1"
                            @click="handleClickNode($event, scope)"
                            @mouseover="hoverNodeId = scope.data._id"
                            @mouseout="hoverNodeId = ''"
                    >
                        <!-- file渲染 -->
                        <template v-if="!scope.data.isFolder">
                            <span v-if="scope.data.item.methods === 'get'" :class="{green: true}" class="label">get</span>
                            <span v-else-if="scope.data.item.methods === 'post'" :class="{yellow: true}" class="label">post</span>
                            <span v-else-if="scope.data.item.methods === 'put'" :class="{blue: true}" class="label">put</span>
                            <span v-else-if="scope.data.item.methods === 'delete'" :class="{red: true}" class="label">del</span>  
                            <img v-else :src="require('@/assets/imgs/apidoc/file.png')" width="16px" height="16px"/> 
                            <s-emphasize v-if="renameNodeId !== scope.data._id" :title="scope.data.docName" :value="scope.data.docName" :keyword="queryData" class="node-name text-ellipsis ml-1"></s-emphasize>
                            <!-- <span v-if="renameNodeId !== scope.data._id" :title="scope.data.docName" class="node-name text-ellipsis ml-1">{{ scope.data.docName }}</span> -->
                            <input v-else v-model="scope.data.docName" placeholder="不能为空" type="text" class="rename-ipt f-sm ml-1" @blur="handleChangeNodeName(scope.data)" @keydown.enter="handleChangeNodeName(scope.data)">
                        </template>
                        <!-- 文件夹渲染 -->
                        <template v-if="scope.data.isFolder">
                            <img :src="require('@/assets/imgs/apidoc/folder.png')" width="16px" height="16px"/>    
                            <span v-if="renameNodeId !== scope.data._id" :title="scope.data.docName" class="node-name text-ellipsis ml-1">{{ scope.data.docName }}</span>
                            <input v-else v-model="scope.data.docName" placeholder="不能为空" type="text" class="rename-ipt f-sm ml-1" @blur="handleChangeNodeName(scope.data)" @keydown.enter="handleChangeNodeName(scope.data)">
                        </template>
                    </div>
                </template>
            </el-tree>
        </div>
        <!-- 弹窗 -->
    </div>
</template>

<script>
import { debounce } from "@/lib/index"

export default {
    components: {
        
    },
    computed: {
        navTreeData() { //----树形导航数据
            return this.$store.state.apidoc.banner;
        },
        tabs() { //-----------全部tabs
            return this.$store.state.apidoc.tabs[this.$root.$data._shareConfig.id];
        },
        currentSelectDoc() { //当前选中的文档
            return this.$store.state.apidoc.activeDoc[this.$root.$data._shareConfig.id];
        }
    },
    watch: {
        currentSelectDoc: {
            handler(val) {
                if (val && val._id) {
                    this.defaultExpandedKeys.splice(0, 1, val._id);
                }
            },
            deep: true
        }
    },
    data() {
        return {
            //=====================================文档增删改查====================================//
            queryData: "", //------------文档过滤条件
            docParentId: "", //----------文档父id
            contextmenu: null, //--------右键弹窗
            renameNodeId: "", //---------正在重命名的节点
            pressCtrl: false, //---------是否按住ctrl键
            multiSelectNode: [], //------按住ctrl+鼠标左键多选节点
            enableDrag: false, //---------是否允许文档被拖拽
            defaultExpandedKeys: [], //--默认展开的文档key值
            //=====================================其他参数====================================//
            hoverNodeId: "", //----------控制导航节点更多选项显示
            loading: false, //-----------左侧树形导航加载
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        //=====================================初始化相关====================================//
        init() {
            // this.loading = true;
            if (window.SHARE_DATA) {
                this.$store.commit("apidoc/changeDocBanner", window.SHARE_DATA.banner);
            }
            
            document.documentElement.addEventListener("click", () => {
                this.clearContextmenu();
                this.multiSelectNode = [];
            })
        },
        //=====================================导航操作==================================//
      
        //点击节点
        handleClickNode(e, { node },) {
            if (this.pressCtrl) {
                e.stopPropagation();
                const delIndex = this.multiSelectNode.findIndex(val => val._id === node.data._id);
                if (delIndex !== -1) {
                    this.multiSelectNode.splice(delIndex, 1);
                } else {
                    this.multiSelectNode.push(node);
                }
            }
        },
      
        //点击节点
        handleNodeClick(data, node) {
            if (!node.data.isFolder) { //文件夹不做处理
                this.$store.commit("apidoc/addTab", node.data);
                this.$store.commit("apidoc/changeCurrentTab", {
                    projectId: this.$root.$data._shareConfig.id,
                    activeNode: node.data
                });
            }
            this.clearContextmenu();
            this.multiSelectNode = [];

        },
        //=====================================前后端交互====================================//
        handleSearchTree() {
            this.search();
        },
        search: debounce(function() {
            let filterData = window.SHARE_DATA.docs.filter(val => {
                return val.docName.includes(this.queryData) || val.item.url.path.includes(this.queryData)
            }).map(val => {
                return {
                    _id: val._id,
                    docName: val.docName
                }
            })
            this.searchResult = [];
            this.defaultExpandedKeys = Array.from(new Set(this.defaultExpandedKeys.concat(filterData.map(val => val._id))))
            this.searchResult = Array.from(new Set(this.searchResult.concat(filterData.map(val => val))));                    
            this.$refs.docTree.filter();
        }),
        filterNode(value, data) {
            const matchName = !!this.searchResult.find(val => val.docName === data.label);
            const matchUrl = !!this.searchResult.find(val => val._id === data._id);
            const matchAll = this.queryData.trim() === "";
            return matchName || matchUrl || matchAll;
        },
       
        //根据id删除tab
        handleDeleteTabsById(deleteIds) {
            this.$store.commit("apidoc/deleteTabById", {
                projectId: this.$root.$data._shareConfig.id,
                deleteIds: deleteIds
            });
            if (!this.tabs.find(val => val._id === this.currentSelectDoc._id)) { //关闭左侧后若在tabs里面无法找到选中节点，则取第一个节点为选中节点
                this.$store.commit("apidoc/changeCurrentTab", {
                    projectId: this.$root.$data._shareConfig.id,
                    activeNode: this.tabs[this.tabs.length - 1],
                });
            }
        },
        //=====================================弹窗相关====================================//  
        //=====================================其他操作=====================================//
        //清除contextmenu
        clearContextmenu() {
            if (this.contextmenu) {
                document.body.removeChild(this.contextmenu.$el);
                this.contextmenu = null;
            }  
        },
    }
};
</script>



<style lang="scss">
.banner {
    width: size(300);
    height: 100%;
    border-right: 1px solid $gray-400;
    display: flex;
    flex-direction: column;
    .el-tree-node__content {
        height: size(30);
    }
    .el-tree-node__content:hover {
        background: none;
    }
    .tool {
        position: relative;
        padding: 0 size(20);
        height: size(150);
        background: $gray-200;
        // 搜索框样式
        .doc-search {
            border-radius: 20px;
            .el-input__inner {
                border-radius: 20px;
            }
        }        
        // 快捷方式样式
        .tool-icon {
            position: relative;
            .svg-icon {
                width: size(25);
                height: size(25);
                padding: size(5);
                cursor: pointer;
                &:hover {
                    background: $gray-400;
                }
            }            
        }
    }
    .doc-nav {
        height: calc(100vh - #{size(60)} - #{size(150)});
        overflow: auto;
        .custom-tree-node {
            display: flex;
            align-items: center;
            height: 30px;
            width: 100%;
            &:hover {
                background: mix($theme-color, $white, 25%);
            }
            &.active {
                background: mix($theme-color, $white, 25%);
            }
            //selected放在后面覆盖掉active样式
            &.selected {
                background: mix($theme-color, $white, 50%);
            }
            .label {
                display: inline-block;
                width: 25px;
            }
            .node-name {
                display: inline-block;
                max-width: 180px;
                border: 2px solid transparent;
            }
        }
    }

}
</style>
