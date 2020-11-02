/*
    创建者：shuxiaokai
    创建时间：2020-02-18 16:26
    模块名称：table封装
    备注：xxxx
*/
<template>
    <div v-loading="loading" :element-loading-text="randomTip()" element-loading-background="rgba(255, 255, 255, 0.9)">
        <el-table ref="s-table" v-bind="$attrs" :data="tableInfo" stripe border :size="$root.config.renderConfig.layout.size" :height="tableHeight" v-on="$listeners" @selection-change="handleSelectionChange">
            <el-table-column v-if="selection || deleteMany" type="selection" align="center" :reserve-selection="reserveSelection"></el-table-column>
            <el-table-column v-if="index" type="index" label="序号" align="center"></el-table-column>
            <slot />
        </el-table>
        <div v-if="plain !== true" class="d-flex j-end mt-1">
            <slot name="operation" />
            <el-button :loading="loading" type="primary" icon="el-icon-refresh" :size="$root.config.renderConfig.layout.size" @click="getData">刷新</el-button>
            <el-button v-if="deleteMany" :loading="loading2" :disabled="selectData.length === 0" :title="disableTip" type="danger" icon="el-icon-delete" :size="config.renderConfig.layout.size" @click="deleteData">批量删除</el-button>
            <el-pagination 
                    class="ml-4" 
                    layout="total, sizes, prev, pager, next, jumper" 
                    :total="total"
                    background 
                    :page-sizes="$root.config.renderConfig.components.tableConfig.pageSizes" 
                    :page-size="$root.config.renderConfig.components.tableConfig.pageSize" 
                    :current-page.sync="formInfo.pageNum" 
                    @size-change="handleSizeChange" 
                    @current-change="handleCurrentChange"
            >
            </el-pagination>
        </div>            
    </div>
</template>

<script>
import { debounce } from "@/lib"
export default {
    props: {
        resHook: { //数据回调钩子,回调第一个参数是返回值,返回子组件
            type: Function,
            default: null
        },
        url: { //请求url
            type: String,
            required: true,
        },
        index: { //是否显示序号
            type: Boolean,
            default: true
        },
        selection: {
            type: Boolean,
            default: false
        },
        params: { //额外参数
            type: Object,
            default() {
                return {};
            }
        },
        immediate: { //是否立即请求数据
            type: Boolean,
            default: true
        },
        height: { //表格高度
            type: String,
            default: ""
        },
        deleteMany: { //是否存在批量删除
            type: Boolean,
            default: false,
        },
        deleteUrl: { //批量删除地址
            type: String,
            default: ""
        },
        deleteKey: { //批量删除key值
            type: String,
            default: "ids"
        },
        deleteDataKey: { //表格数据的key值
            type: String,
            default: "_id"
        },
        reserveSelection: { //是否记住选中项目
            type: Boolean,
            default: false
        },
        plain: { //是否展示分页
            type: Boolean,
            default: false
        }
    },
    data() {
        
        return {
            //=====================================表格参数====================================//
            formInfo: {
                pageSize: this.$root.config.renderConfig.components.tableConfig.pageSize,
                pageNum: 1, //-------------------------------------------------------当前页数
            },
            tableInfo: [], //表格数据
            tableHeight: 100, //表格高度
            selectData: [], //选中的表格数据
            total: 0, //-------------------------------------------------------------数据总数
            responseData: null, //表格返回数据
            //=====================================其他参数====================================//
            loading2: false, //其他参数
        };
    },
    computed: {
        loading: { //表格加载效果
            get() {
                return this.$store.state.components.searchLoading;
            },
            set(val) {
                this.$store.commit("changeSearchLoading", val);
            }
        },
        disableDelete() { //是否禁止删除
            return this.selectData.length === 0;
        },
        disableTip() { //禁止提示信息
            if (this.selectData.length === 0) {
                return "在左侧进行数据选择后方可删除数据";
            } else {
                return ""
            }
        }

    },
    mounted() {
        if (this.immediate) {
            this.getData();
        }
        this.initTableHeight();
        window.addEventListener("resize", debounce(() => {
            this.initTableHeight();
        }))
    },
    methods: {
        //=====================================数据获取====================================//
        //获取数据
        getData(searchParams) {
            this.$nextTick(() => {
                let p = {};
                if (Object.prototype.toString.call(searchParams).slice(8, -1) !== "MouseEvent") { //修复鼠标事件导致第一个参数数据错误
                    p = JSON.parse(JSON.stringify(searchParams || {})); //防止数据变化产生递归
                }
                const params = !this.plain ? Object.assign(this.formInfo, p, this.params) : Object.assign(p, this.params);

                this.loading = true;
                this.axios.get(this.url, { params }).then(res => {
                    this.responseData = res.data;
                    if (this.resHook) {
                        this.resHook(res, this);
                    } else {
                        this.total = res.data.total;
                        this.tableInfo = res.data.rows;
                    }
                }).catch(err => {
                    this.$errorThrow(err, this);
                }).finally(() => {
                    this.loading = false;
                    this.$nextTick(() => {
                        this.$emit("finish", this.responseData, this);
                    })
                });                
            })
        },
        // 分页
        handleSizeChange(size) {
            this.formInfo.pageNum = 1;
            this.formInfo.pageSize = size;
            this.getData();
        },
        // 改变页码
        handleCurrentChange(page) {
            this.formInfo.pageNum = page;
            this.getData();
        },
        //=========================================================================//
        //初始化
        initTableHeight() {
            const tableDom = this.$refs["s-table"] ? this.$refs["s-table"].$el : null;
            if (!tableDom) {
                return;
            }
            //hack
            setTimeout(() => {
                const top = tableDom.getBoundingClientRect()["top"]; //表格距离顶部距离
                const height = this.height || window.innerHeight - top - 100; //100是试出来
                this.tableHeight = height < 200 ? 200 : height; //高度至少200px
            })
        },
        //选择了数据
        handleSelectionChange(val) {
            this.selectData = val;
            this.$emit("select", val);
        },
        //批量删除
        deleteData() {
            this.$confirm(`此操作将删除${this.selectData.length}条记录, 是否继续?`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                const params = {};
                params[this.deleteKey] = this.selectData.map(val => val[this.deleteDataKey]);
                this.loading2 = true;
                this.axios.delete(this.deleteUrl, { data: params }).then(() => {
                    this.getData();
                    this.$emit("deleteMany");
                }).catch(err => {
                    this.$errorThrow(err, this);
                }).finally(() => {
                    this.loading2 = false;
                });
            }).catch(err => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                this.$errorThrow(err, this);
            });
        },
    }
};
</script>

<style lang="scss">

</style>
