/*
    创建者：shuxiaokai
    创建时间：2020-07-03 16:40
    模块名称：文档tabs切换
    备注：xxxx
*/
<template>
    <div class="tabs hidden-sm-and-down">
        <div class="my-tabs d-flex">
            <div class="btn left" @click="moveLeft">
                <i class="el-icon-arrow-left"></i>
            </div>
            <draggable ref="tabWrap" id="tabList" v-model="tabs" animation="150" class="tab-list">
                <div
                        v-for="(item, index) in tabs"
                        ref="tabItem"
                        :key="index"
                        :title="item.name"
                        :class="{active: currentSelectDoc && currentSelectDoc._id === item._id}"
                        class="item"
                        :data-index="index"
                        @click="selectCurrentTab(item)"
                        @contextmenu="handleRightClick($event, item, index)"
                >
                    <!-- 接口文档 -->
                    <template v-if="item.tabType === 'doc'">
                        <template v-for="(req) in validRequestMethods">
                            <span v-if="item.tail === req.value.toLowerCase()" :key="req.value" class="mr-2" :style="{color: req.iconColor}">{{ req.name }}</span>
                        </template>
                    </template>
                    <!-- 其他 -->
                    <template v-else>
                        <!-- 配置 -->
                        <span v-if="item.tabType === 'config'" class="el-icon-setting f-base mr-2"></span>
                        <!-- 参数模板 -->
                        <span v-if="item.tabType === 'paramsTemplate'" class="el-icon-setting f-base mr-2"></span>
                        <!-- 链接 -->
                        <span v-if="item.tabType === 'onlineLink'" class="el-icon-link orange f-base mr-2"></span>
                        <!-- 导出文档 -->
                        <span v-if="item.tabType === 'exportDoc'" class="el-icon-share green f-base mr-2"></span>
                        <!-- 历史记录 -->
                        <span v-if="item.tabType === 'history'" class="el-icon-time blue f-base mr-2"></span>
                        <!-- 全局变量配置 -->
                        <span v-if="item.tabType === 'variable'" class="el-icon-truck blue f-base mr-2"></span>
                    </template>
                    <span class="item-text">{{ item.name }}</span>
                    <span class="operaion">
                        <span v-show="item.changed" class="has-change">
                            <span class="dot"></span>
                        </span>
                        <i v-show="!item.changed" class="el-icon-close close" @click.stop="handleCloseCurrent(item, index)"></i>
                    </span>
                </div>
            </draggable>
            <div class="btn right" @click="moveRight">
                <i class="el-icon-arrow-right"></i>
            </div>
        </div>
    </div>
</template>
<script>
import draggable from "vuedraggable"
import Vue from "vue"
import contextmenu from "./components/contextmenu.vue"

export default {
    components: {
        draggable,
    },
    data() {
        return {
            mouseContext: null, //tab右键弹框
            //======================================其他参数===================================//
            enableMove: true, //是否允许tab移动，动画未完成不允许下一步操作
            enableLeftMoveHandle: false, //是否允许左侧控制
            enableRightMoveHandle: false, //是否允许右侧控制
        };
    },
    computed: {
        tabs: {
            get() {
                return this.$store.state.apidoc.tabs[this.$route.query.id];
            },
            set(val) { //拖拽tabs会导致数据写入
                this.$store.commit("apidoc/updateAllTabs", {
                    projectId: this.$route.query.id,
                    tabs: val,
                });
            },
        },
        currentSelectDoc() {
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        validRequestMethods() {
            return this.$store.state.apidocRules.requestMethods.filter((val) => val.enabled);
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        //=====================================初始化====================================//
        init() {
            //取消鼠标右键实例对象
            document.body.addEventListener("click", () => {
                if (this.mouseContext) {
                    document.body.removeChild(this.mouseContext.$el);
                    this.mouseContext = null;
                }
            });
            this.$el.addEventListener("contextmenu", (e) => {
                e.returnValue = false;
            });
            //获取本地tabs信息
            const projectId = this.$route.query.id;
            const tabs = localStorage.getItem("apidoc/editTabs") ? JSON.parse(localStorage.getItem("apidoc/editTabs")) : {};
            const locatActiveDoc = localStorage.getItem("apidoc/activeTab") ? JSON.parse(localStorage.getItem("apidoc/activeTab")) : {};
            const currentProjectTabs = tabs[projectId] || [];
            const activeDoc = locatActiveDoc[projectId] || {};
            this.$store.commit("apidoc/updateAllTabs", {
                projectId,
                tabs: currentProjectTabs,
            });
            this.$store.commit("apidoc/changeCurrentTab", {
                projectId,
                ...activeDoc,
            });
            this.$nextTick(() => { //tabs数据未完成渲染
                this.checkEnableMoveHandle();//判断是否可以点击右侧控制按钮滑动到右侧
            })
            //绑定tabs移动事件
            const wrap = this.$refs.tabWrap.$el;
            wrap.addEventListener("transitionend", () => {
                this.enableMove = true;
            })
        },
        //=====================================tabs操作====================================//
        //选择当前标签
        selectCurrentTab(item) {
            this.$store.commit("apidoc/changeCurrentTab", {
                projectId: this.$route.query.id,
                ...item,
            });
        },
        //关闭当前标签
        handleCloseCurrent(item, index) {
            const deleteTab = () => {
                this.$store.commit("apidoc/deleteTabByPosition", {
                    projectId: this.$route.query.id,
                    start: index,
                    num: 1,
                });
                if (item._id === this.currentSelectDoc._id) { //如果删除的是当前选择的doc
                    if (!this.tabs[index]) { //删除位置不存在节点则下一个元素作为选中的tab
                        if (this.tabs[index - 1]) { //选择上一个元素作为
                            this.$store.commit("apidoc/changeCurrentTab", {
                                projectId: this.$route.query.id,
                                ...this.tabs[index - 1],
                            });
                        } else { //上一个元素不存在则置空
                            this.$store.commit("apidoc/changeCurrentTab", {
                                projectId: this.$route.query.id,
                            });
                        }
                    } else {
                        this.$store.commit("apidoc/changeCurrentTab", {
                            projectId: this.$route.query.id,
                            ...this.tabs[index],
                        });
                    }
                }
            }
            if (item.changed) {
                this.$confirm(`是否保存对 "${item.name}" 接口的修改`, "提示", {
                    confirmButtonText: "保存",
                    cancelButtonText: "不保存",
                    distinguishCancelAndClose: true,
                    type: "warning",
                }).then(() => {
                    const matchedComponent = this.getComponentByName("REQUEST_OPERATION");
                    matchedComponent.saveRequest()
                    deleteTab();
                }).catch((err) => {
                    if (err === "cancel") { //不保存
                        this.$store.commit("apidoc/changeCurrentTabById", {
                            _id: this.currentSelectDoc._id,
                            projectId: this.$route.query.id,
                            changed: false,
                        });
                        deleteTab();
                    } else if (err === "close") {
                        return 0;
                    }
                    return this.$errorThrow(err, this);
                });
            } else {
                deleteTab()
            }
        },
        //关闭右侧
        handleCloseRight(item, index) {
            if (this.tabs.length !== 1) { //只剩一个tab删除无意义不做处理
                this.$store.commit("apidoc/deleteTabByPosition", {
                    projectId: this.$route.query.id,
                    start: index + 1,
                    num: this.tabs.length - index - 1,
                });
                if (!this.tabs.find((val) => val._id === this.currentSelectDoc._id)) { //关闭右侧后若在tabs里面无法找到选中节点，则取最后一个节点为选中节点
                    this.$store.commit("apidoc/changeCurrentTab", {
                        projectId: this.$route.query.id,
                        ...this.tabs[this.tabs.length - 1],
                    });
                }
            }
        },
        //关闭左侧
        handleCloseLeft(item, index) {
            if (this.tabs.length !== 1) { //只剩一个tab删除无意义不做处理
                this.$store.commit("apidoc/deleteTabByPosition", {
                    projectId: this.$route.query.id,
                    start: 0,
                    num: index,
                });
                if (!this.tabs.find((val) => val._id === this.currentSelectDoc._id)) { //关闭左侧后若在tabs里面无法找到选中节点，则取第一个节点为选中节点
                    this.$store.commit("apidoc/changeCurrentTab", {
                        projectId: this.$route.query.id,
                        ...this.tabs[0],
                    });
                }
            }
        },
        //关闭其他标签
        handleCloseOther(item, index) {
            if (this.tabs.length !== 1) {
                this.$store.commit("apidoc/deleteTabByPosition", {
                    projectId: this.$route.query.id,
                    start: index + 1,
                    num: this.tabs.length - index - 1,
                });
                this.$store.commit("apidoc/deleteTabByPosition", {
                    projectId: this.$route.query.id,
                    start: 0,
                    num: index,
                });
                this.$store.commit("apidoc/changeCurrentTab", {
                    projectId: this.$route.query.id,
                    ...this.tabs[0],
                });
            }
        },
        //右键菜单
        handleRightClick(e, item, index) {
            e.stopPropagation();
            e.preventDefault();
            const ContextmenuConstructor = Vue.extend(contextmenu);
            const x = e.clientX; //当前点击位置
            const y = e.clientY; //当前点击位置
            if (this.mouseContext) {
                document.body.removeChild(this.mouseContext.$el);
                this.mouseContext = null;
            }
            this.mouseContext = new ContextmenuConstructor({
                store: this.$store,
                router: this.$router,
                propsData: {
                    left: x,
                    top: y,
                    id: item._id,
                },
            }).$mount();
            document.body.appendChild(this.mouseContext.$el);
            this.mouseContext.$on("closeRight", () => {
                this.handleCloseRight(item, index);
            })
            this.mouseContext.$on("closeLeft", () => {
                this.handleCloseLeft(item, index);
            })
            this.mouseContext.$on("closeCurrent", () => {
                this.handleCloseCurrent(item, index);
            })
            this.mouseContext.$on("closeOther", () => {
                this.handleCloseOther(item, index);
            })
        },
        //往左移动
        moveLeft() {
            if (this.tabs.length === 0) {
                return;
            }
            const wrap = this.$refs.tabWrap.$el;
            const item = this.$refs.tabItem ? this.$refs.tabItem[0] : null;
            const wrapStyle = window.getComputedStyle(wrap)
            const itemRect = item.getBoundingClientRect();
            // console.log(itemRect.width, wrapStyle.left, this.enableMove)
            if (!this.enableMove) {
                return;
            }
            if (parseFloat(wrapStyle.left) > 0) {
                return;
            }
            wrap.style.left = `${parseFloat(wrapStyle.left) + itemRect.width}px`;
            this.enableMove = false;
            this.checkEnableMoveHandle();
        },
        //往右移动
        moveRight() {
            if (this.tabs.length === 0) {
                return;
            }
            const wrap = this.$refs.tabWrap.$el;
            const item = this.$refs.tabItem ? this.$refs.tabItem[0] : null;
            const itemLen = this.$refs.tabItem ? this.$refs.tabItem.length : 0;
            const wrapRect = wrap.getBoundingClientRect();
            const wrapStyle = window.getComputedStyle(wrap)
            const itemRect = item.getBoundingClientRect();
            if (!this.enableMove) {
                return;
            }
            if (parseFloat(wrapStyle.left) < wrapRect.width - (itemLen - 1) * itemRect.width) {
                return;
            }
            wrap.style.left = `${parseFloat(wrapStyle.left) - itemRect.width}px`;
            this.enableMove = false;
            this.checkEnableMoveHandle();
        },
        //检查是否允许左右移动
        checkEnableMoveHandle() {
            const wrap = this.$refs.tabWrap.$el;
            const wrapWidth = wrap.getBoundingClientRect().width;
            const wrapMoveLeft = parseFloat(wrap.style.left || 0);
            const item = this.$refs.tabItem ? this.$refs.tabItem[0] : null;
            const itemWidth = item ? item.getBoundingClientRect().width : 0;
            const itemNum = this.tabs.length;
            if (wrapMoveLeft < 0) {
                this.enableLeftMoveHandle = true;
            } else {
                this.enableLeftMoveHandle = false;
            }
            const itemTotalWidth = itemWidth * itemNum - itemWidth / 2;
            if (itemTotalWidth > wrapWidth - wrapMoveLeft) {
                this.enableRightMoveHandle = true;
            } else {
                this.enableRightMoveHandle = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.tabs {
    width: 100%;
    height: size(40);
    background: #eee;
    display: flex;
    .my-tabs {
        width: 90%;
        min-width: 300px;
        // width: 300px;
        overflow-x: hidden;
        overflow-y: hidden;
        position: relative;
        .btn {
            flex: 0 0 auto;
            height: size(40);
            width: size(25);
            position: relative;
            z-index: $zIndex-tabs;
            background: $gray-200;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: $box-shadow-base;
            position: absolute;
            &.left {
                left: 0;
            }
            &.right {
                right: 0;
            }
        }
        .tab-list {
            width: calc(100% - #{size(50)});
            line-height: 40px;
            height: 40px;
            display: flex;
            color: #5f6368;
            white-space: nowrap;
            position: absolute;
            left: size(25);
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
                    max-width: size(130);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
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
</style>
