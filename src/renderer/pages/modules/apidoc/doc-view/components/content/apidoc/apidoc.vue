/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div class="view-content">
        <s-loading :loading="loading" class="view-area">
           <h2>基本信息</h2>
           <div>asdsad</div>
           <h2>请求头</h2>
           <div>asdsad</div>
        </s-loading>
        <div class="remote-view">
            <s-overview></s-overview>
        </div>
    </div>
</template>

<script>
import axios from "axios"
import mixin from "@/pages/modules/apidoc/mixin" //公用数据和函数
import overview from "./components/overview/overview.vue" //展示区域

const { CancelToken } = axios;
//=========================================================================//
export default {
    name: "APIDOC_CONTENT",
    mixins: [mixin],
    components: {
        "s-overview": overview,
    },
    watch: {
        currentSelectDoc: {
            handler(currentDoc, oldDoc) {
                if (currentDoc.tabType !== "doc") { //只处理类型为doc数据
                    if (this.cancel.length > 0) { //切换时都清除上一次请求
                        this.cancel.forEach((c) => {
                            c("取消请求");
                        })
                    }
                    return;
                }
                if (!oldDoc || currentDoc._id !== oldDoc._id) { //这个判断代表只有是切换tab才会触发请求
                    this.$store.commit("apidoc/clearRespons"); //清空上一次返回数据
                    this.getDocDetail();
                }
            },
            deep: true,
            immediate: true,
        },
    },
    computed: {
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        tabs() { //全部tabs
            return this.$store.state.apidoc.tabs[this.$route.query.id];
        },
        apidocInfo() { //接口文档信息
            return this.$store.state.apidoc.apidocInfo;
        },
        loading() {
            return this.$store.state.apidoc.apidocLoading;
        },
    },
    data() {
        return {
            //=====================================其他参数====================================//
            cancel: [], //----请求列表
        };
    },
    mounted() {},
    methods: {
        //=====================================获取数据====================================//
        //获取接口数据
        getDocDetail() {
            if (!this.currentSelectDoc || !this.currentSelectDoc._id) { //没有id不请求数据
                return
            }
            const params = {
                _id: this.currentSelectDoc._id,
                projectId: this.$route.query.id,
            };
            if (this.cancel.length > 0) {
                this.cancel.forEach((c) => {
                    c("取消请求");
                })
            }
            setTimeout(() => { //hack让请求加载不受取消影响
                this.$store.commit("apidoc/changeApidocLoading", true);
            })
            this.axios.get("/api/project/doc_detail", {
                params,
                cancelToken: new CancelToken((c) => {
                    this.cancel.push(c);
                }),
            }).then((res) => {
                if (res === undefined) { //取消接口
                    return
                }
                if (res.data === null) { //接口不存在提示用户删除接口
                    this.confirmInvalidDoc();
                    return;
                }
                const resData = res.data;
                const apidocInfo = JSON.parse(JSON.stringify(resData));
                this.$store.commit("apidoc/changeApidocInfo", apidocInfo);
                this.broadcast("REQUEST_BODY", "dataReady");
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.$store.commit("apidoc/changeApidocLoading", false);
            });
        },
        //=====================================组件间操作====================================//
        //接口不存在提醒用户，可能是同时操作的用户删掉了这个接口导致接口不存在
        confirmInvalidDoc() {
            this.$confirm("当前接口不存在，可能已经被删除!", "提示", {
                confirmButtonText: "关闭接口",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                this.$store.commit("apidoc/deleteTabById", {
                    projectId: this.$route.query.id,
                    deleteIds: [this.currentSelectDoc._id],
                });
                if (!this.tabs.find((val) => val._id === this.currentSelectDoc._id)) { //关闭左侧后若在tabs里面无法找到选中节点，则取第一个节点为选中节点
                    this.$store.commit("apidoc/changeCurrentTab", {
                        _id: this.tabs[this.tabs.length - 1]._id,
                        projectId: this.$route.query.id,
                        name: this.tabs[this.tabs.length - 1].name,
                        changed: this.tabs[this.tabs.length - 1].changed,
                        tail: this.tabs[this.tabs.length - 1].tail,
                        tabType: "doc",
                    });
                }
            }).catch((err) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
    },
};
</script>

<style lang="scss">
.view-content {
    display: flex;
    height: calc(100vh - #{size(100)});
    // 编辑区域
    .view-area {
        padding: size(10);
        border-right: 1px solid $gray-400;
        flex: 1;
        .info-wrap {
            padding: size(10) size(20);
            box-shadow: 0 3px 2px $gray-400;
            position: relative;
            z-index: 1;
        }
        .params-wrap {
            padding: size(20);
            max-height: calc(100vh - #{size(230)});
            overflow-y: auto;
        }
    }
    // 数据返回区域
    .remote-view {
        flex-grow: 0;
        flex-shrink: 0;
        width: size(550);
    }
}
</style>
