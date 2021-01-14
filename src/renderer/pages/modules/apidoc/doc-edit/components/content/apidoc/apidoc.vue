/*
    创建者：shuxiaokai
    创建时间：2020-07-06 17:57
    模块名称：文档书写区域区域
    备注：xxxx
*/
<template>
    <div class="edit-content">
        <s-loading :loading="loading" class="edit-area">
            <!-- 基本配置 -->
            <div class="info-wrap">
                <pre>{{ apidocInfo }}</pre>
            </div>
            <!-- 参数录入 -->
            <div class="params-wrap">
               
            </div>            
        </s-loading>
        <div class="view-area"></div>
    </div>
</template>

<script>
import axios from "axios" 
const CancelToken = axios.CancelToken;
//=========================================================================//
export default {
    name: "APIDOC_CONTENT",
    components: {
        
    },
    watch: {
        currentSelectDoc: {
            handler(currentDoc) {
                this.checkCache(currentDoc);
            },
            deep: true,
            immediate: true
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

    },
    data() {
        return {
            //=====================================请求基本信息================================//
            //=====================================其他参数====================================//
            docDataReady: false, //文档数据是否加载完成
            cancel: [], //----请求列表
            loading: false, //请求加载效果
        };
    },
    mounted() {
        
    },
    methods: {
        //=====================================获取数据====================================//
        //查看是否存在缓存
        checkCache(currentDoc) {
            //不管有没有缓存，都取消上一次的请求
            if (this.cancel.length > 0) {
                this.cancel.forEach(c => {
                    c("取消请求");
                })
            }
            if (currentDoc.changed) { //存在缓存直接应用缓存
                
            } else {
                this.$store.commit("apidoc/clearRespons"); //清空上一次返回数据
                this.getDocDetail();
            }
        },
        //获取接口数据
        getDocDetail() {
            if (!this.currentSelectDoc || !this.currentSelectDoc._id) { //没有id不请求数据
                return
            }
            const params = {
                _id: this.currentSelectDoc._id,
                projectId: this.$route.query.id
            };
            if (this.cancel.length > 0) {
                this.cancel.forEach(c => {
                    c("取消请求");
                })
            }
            setTimeout(() => { //hack让请求加载不受取消影响
                this.loading = true;
                this.docDataReady = false;
            })
            this.axios.get("/api/project/doc_detail", {
                params,
                cancelToken: new CancelToken((c) => {
                    this.cancel.push(c);
                })
            }).then(res => {
                if (res === undefined) { //取消接口
                    return
                }
                if (res.data === null) { //接口不存在提示用户删除接口
                    this.confirmInvalidDoc();
                    return;
                }
                this.convertAndFormatApiInfo(); //转换部分api格式，让文档更易操作
                this.$store.commit("apidoc/changeDocDetail", res.data);
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================组件间操作====================================//
        //接口不存在提醒用户，可能是同时操作的用户删掉了这个接口导致接口不存在
        confirmInvalidDoc() {
            this.$confirm("当前接口不存在，可能已经被删除!", "提示", {
                confirmButtonText: "关闭接口",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                this.$store.commit("apidoc/deleteTabById", {
                    projectId: this.$route.query.id,
                    deleteIds: [this.currentSelectDoc._id]
                });
                if (!this.tabs.find(val => val._id === this.currentSelectDoc._id)) { //关闭左侧后若在tabs里面无法找到选中节点，则取第一个节点为选中节点
                    this.$store.commit("apidoc/changeCurrentTab", {
                        projectId: this.$route.query.id,
                        activeNode: this.tabs[this.tabs.length - 1],
                    });
                }
            }).catch(err => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
        //格式化部分api数据，对于请求参数和返回参数为空情况，默认添加一个操作数据
        convertAndFormatApiInfo() {
            
        }
    }
};
</script>



<style lang="scss">
.edit-content {
    display: flex;
    height: calc(100vh - #{size(100)});
    // 编辑区域
    .edit-area {
        border-right: 1px solid $gray-400;
        flex: 0 0 65%;
        .info-wrap {
            padding: size(20);
            height: size(170);
            box-shadow: 0 3px 2px $gray-400;
            position: relative;
            z-index: 1;
        }
        .params-wrap {
            padding: size(20);
            max-height: calc(100vh - #{size(300)});
            overflow-y: auto;
        }
    }
    // 展示区域
    .view-area {
        flex: 1 0 35%;
    }
    @media only screen and (max-width: 1440px) {
        flex-direction: column;
        .edit-area {
            flex: 0 0 auto;
        }
        .view-area {
            flex: 0 0 auto;
        }
    }
}
</style>
