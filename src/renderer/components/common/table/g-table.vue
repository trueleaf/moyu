/*
    创建者：shuxiaokai
    创建时间：2021-06-14 14:26
    模块名称：
    备注：
*/
<template>
    <s-loading :loading="loading">
        <el-table
            ref="table"
            v-bind="$attrs"
            :data="tableData"
            stripe
            border
            :size="config.renderConfig.layout.size"
            :height="tableHeight"
            @selection-change="handleSelectionChange"
        >
            <el-table-column v-if="selection || deleteMany" type="selection" align="center" :reserve-selection="reserveSelection"></el-table-column>
            <el-table-column v-if="index" type="index" label="序号" align="center"></el-table-column>
            <slot />
        </el-table>
        <div v-if="!plain" class="d-flex j-end mt-1">
            <slot name="operation" />
            <el-button :loading="loading" type="primary" :icon="Refresh" :size="config.renderConfig.layout.size" @click="getData">{{ $t("刷新") }}</el-button>
            <el-button
                v-if="deleteMany"
                :loading="loading2"
                :disabled="selectData.length === 0"
                :title="disableTip"
                type="danger"
                :icon="Delete"
                :size="config.renderConfig.layout.size"
                @click="deleteData"
            >
                {{ $t("批量删除") }}
            </el-button>
            <el-pagination
                v-model:currentPage="formInfo.pageNum"
                class="ml-4"
                :layout="paging ? 'total, sizes, prev, pager, next, jumper' : 'total'"
                :total="total"
                background
                :page-sizes="config.renderConfig.components.tableConfig.pageSizes"
                :page-size="config.renderConfig.components.tableConfig.pageSize"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            >
            </el-pagination>
        </div>
    </s-loading>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { Delete, Refresh } from "@element-plus/icons-vue"
import config from "@/../config/config"

export default defineComponent({
    props: {
        /**
         * 仅显示表格
         */
        plain: {
            type: Boolean,
            default: false,
        },
        /**
         * 数据回调钩子,回调第一个参数是返回值,返回子组件
         */
        resHook: {
            type: Function,
            default: null
        },
        /**
         * 请求url
         */
        url: {
            type: String,
            required: true,
        },
        /**
         * 是否显示序号
         */
        index: {
            type: Boolean,
            default: true
        },
        /**
         * 是否开启多选
         */
        selection: {
            type: Boolean,
            default: false
        },
        /**
         * 额外参数
         */
        params: {
            type: Object,
            default: () => ({}),
        },
        /**
         * 是否立即请求数据
         */
        immediate: {
            type: Boolean,
            default: true
        },
        /**
         * 表格高度
         */
        height: {
            type: Number,
            default: 0
        },
        /**
         * 是否存在批量删除
         */
        deleteMany: {
            type: Boolean,
            default: false,
        },
        /**
         * 批量删除地址
         */
        deleteUrl: {
            type: String,
            default: ""
        },
        /**
         * 批量删除key值
         */
        deleteKey: {
            type: String,
            default: "ids"
        },
        /**
         * 表格数据的key值
         */
        deleteDataKey: {
            type: String,
            default: "_id"
        },
        /**
         * 批量删除额外参数
         */
        deleteParams: {
            type: Object,
            default: () => ({}),
        },
        /**
         * 是否记住选中项目,翻页记忆
         */
        reserveSelection: {
            type: Boolean,
            default: false
        },
        /**
         * 是否展示分页
         */
        paging: {
            type: Boolean,
            default: true
        },
    },
    emits: ["finish", "select", "deleteMany"],
    setup() {
        return {
            Delete,
            Refresh
        };
    },
    data() {
        return {
            //=====================================表格参数====================================//
            formInfo: {
                pageSize: config.renderConfig.components.tableConfig.pageSize, //----分页大小
                pageNum: 1, //-------------------------------------------------------当前页数
            },
            tableData: [], //--------------------------------------------------------表格数据
            tableHeight: "100", //-----------------------------------------------------表格高度
            selectData: [] as Record<string, unknown>[], //-------------------------------------------------------选中的表格数据
            total: 0, //-------------------------------------------------------------数据总数
            responseData: null, //---------------------------------------------------表格返回数据
            //=====================================其他参数====================================//
            loading: false, //-------------------------------------------------------获取数据加载效果
            loading2: false, //------------------------------------------------------批量删除加载效果
            config,
        };
    },
    computed: {
        disableDelete(): boolean { //是否禁止删除
            return this.selectData.length === 0;
        },
        disableTip(): string { //禁止提示信息
            if (this.selectData.length === 0) {
                return "在左侧进行数据选择后方可删除数据";
            }
            return ""
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        //初始化
        init() {
            if (this.immediate) {
                this.getData();
            }
            this.initTableHeight();
            window.addEventListener("resize", this.$helper.debounce(() => {
                this.initTableHeight();
            }, 300))
        },
        //获取数据
        getData(searchParams?: unknown) {
            return new Promise((resolve, reject) => {
                this.$nextTick(() => {
                    let p = {};
                    if (Object.prototype.toString.call(searchParams).slice(8, -1) !== "MouseEvent") { //修复鼠标事件导致第一个参数数据错误
                        p = JSON.parse(JSON.stringify(searchParams || {})); //防止数据变化产生递归
                    }
                    const params = this.paging ? Object.assign(this.formInfo, p, this.params) : Object.assign(p, this.params);

                    this.loading = true;
                    this.axios.get(this.url, { params }).then((res) => {
                        this.responseData = res.data;
                        if (this.resHook) {
                            this.resHook(res, this);
                        } else if (this.paging) { //分页
                            this.total = res.data.total;
                            this.tableData = res.data.rows;
                        } else { //不分页
                            this.total = res.data.length;
                            this.tableData = res.data;
                        }
                        resolve(res);
                    }).catch((err) => {
                        console.error(err);
                        reject(err);
                    }).finally(() => {
                        this.loading = false;
                        this.$nextTick(() => {
                            this.$emit("finish", this.responseData, this);
                        })
                    });
                })
            });
        },
        // 分页
        handleSizeChange(size: number) {
            this.formInfo.pageNum = 1;
            this.formInfo.pageSize = size;
            this.getData();
        },
        // 改变页码
        handleCurrentChange(page: number) {
            this.formInfo.pageNum = page;
            this.getData();
        },
        //=========================================================================//
        //初始化
        initTableHeight() {
            const tableDom = this.$refs.table?.$el;
            if (tableDom) {
                //hack
                setTimeout(() => {
                    const { top } = tableDom.getBoundingClientRect(); //表格距离顶部距离
                    const height = this.height || window.innerHeight - top - 70; //100是试出来
                    this.tableHeight = height < 200 ? "200px" : `${height}px`; //高度至少200px
                })
            }
        },
        //选择了数据
        handleSelectionChange(val: Record<string, unknown>[]) {
            this.selectData = val;
            this.$emit("select", val);
        },
        //批量删除
        deleteData() {
            this.$confirm(this.$t("此操作将删除条记录, 是否继续?", { msg: this.selectData.length.toString() }), this.$t("提示"), {
                confirmButtonText: this.$t("确定"),
                cancelButtonText: this.$t("取消"),
                type: "warning"
            }).then(() => {
                const params = {} as Record<string, unknown>;
                params[this.deleteKey] = this.selectData.map((val) => val[this.deleteDataKey]);
                Object.assign(params, this.deleteParams);
                this.loading2 = true;
                this.axios.delete(this.deleteUrl, { data: params }).then(() => {
                    this.$emit("deleteMany", params.ids);
                }).catch((err) => {
                    console.error(err);
                }).finally(() => {
                    this.loading2 = false;
                });
            }).catch((err: Error | string) => {
                if (err === "cancel" || err === "close") {
                    return;
                }
                console.error(err);
            });
        },
    },
})
</script>

<style lang="scss">

</style>
