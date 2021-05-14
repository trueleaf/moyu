/*
    创建者：shuxiaokai
    创建时间：2021-05-07 16:41
    模块名称：标签选择
    备注：
*/
<template>
    <div class="tag">
        <el-popover v-model="popoverVisible" placement="bottom" trigger="manual" @click.native.stop="() => {}">
            <div class="tag-wrap">
                <!-- 搜索 -->
                <div class="search">
                    <el-input v-model="tagNameFilter" :size="config.renderConfig.layout.size" placeholder="搜索标签" class="w-100" maxlength="100" clearable>
                        <i slot="prefix" class="el-icon-search el-input__icon"></i>
                    </el-input>
                    <el-popover v-model="popoverVisible2" placement="right" trigger="manual" @click.native.stop="() => {}">
                        <div class="add-tag">
                            <div v-if="operationType === 'add'" class="gray-900 mb-4">新增标签</div>
                            <div v-if="operationType === 'edit'" class="gray-900 mb-4">修改标签</div>
                            <div class="mb-1 f-xs gray-600">标签名称</div>
                            <el-input v-model="formInfo.name" :size="config.renderConfig.layout.size" class="w-100 mb-3" maxlength="100" clearable></el-input>
                            <div class="mb-1 f-xs gray-600">颜色选择</div>
                            <div class="color-wrap mb-3">
                                <div v-for="item in colors" :key="item" class="rect" :style="{background: item}" @click="handleSelectColor(item)">
                                    <span v-if="item === selectTagColor" class="el-icon-check check"></span>
                                </div>
                                <el-color-picker v-model="formInfo.color" :size="config.renderConfig.layout.size" @change="handleChangeCustomColor"></el-color-picker>
                            </div>
                            <div class="mb-1 f-xs gray-600">已选择颜色</div>
                            <div class="rect" :style="{background: selectTagColor}"></div>
                            <span class="el-icon-close close" @click="handleClosePopover"></span>
                            <el-button v-if="operationType === 'add'" :loading="loading" :disabled="!formInfo.name" type="primary" :size="config.renderConfig.layout.size" class="submit" @click="handleAddTag">确认添加</el-button>
                            <el-button v-if="operationType === 'edit'" :loading="loading" :disabled="!formInfo.name" type="primary" :size="config.renderConfig.layout.size" class="submit" @click="handleEditTag">确认修改</el-button>
                        </div>
                        <el-button slot="reference" type="text" :size="config.renderConfig.layout.size" @click="handleOpenAddTagPopover">新增标签</el-button>
                    </el-popover>
                </div>
                <!-- 标签列表 -->
                <div class="content">
                    <div v-for="(item, index) in matchedTagEnum" :key="index" class="item" :class="{active: currentSelectTag && item._id === currentSelectTag._id}" @click="handleSelectTag(item)">
                        <span :style="{background: item.color}" class="dot"></span>
                        <span>{{ item.name }}</span>
                        <span class="ml-auto d-flex a-center">
                            <!-- 编辑 -->
                            <span class="edit el-icon-edit" @click.stop="handleOpenEditTagPopover(item)"></span>
                            <!-- 删除 -->
                            <el-popconfirm ref="delete" title="确实要删除当前标签吗？" @confirm="handleDeleteTag(item)" @cancel="handleCancelConfirm">
                                <span slot="reference">
                                    <span v-if="!loading2" class="delete el-icon-delete" @click="handleOpenDeleteTagPopover(item)"></span>
                                    <span v-else class="el-icon-loading"></span>
                                </span>
                            </el-popconfirm>
                        </span>
                    </div>
                </div>
            </div>
            <span slot="reference" class="cursor-pointer" @click="popoverVisible = !popoverVisible">
                <span class="el-icon-collection-tag f-sm mr-1"></span>
                <span v-if="!tagInfo.name" class="gray-600">选择标签</span>
                <span v-else :style="{color: tagInfo.color}">{{ tagInfo.name }}</span>
            </span>
        </el-popover>
    </div>
</template>

<script>
import scssData from "@/scss/variables/_variables.scss";

export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            formInfo: {
                name: "",
                color: scssData.colorBlue,
            },
            rules: {},
            //===================================枚举参数====================================//
            tagsEnum: [], //host枚举信息
            colors: [scssData.colorBlue, scssData.colorRed, scssData.colorOrange, scssData.colorYellow, scssData.colorGreen, scssData.colorPink, scssData.colorIndigo],
            //===================================业务参数====================================//
            operationType: "add", //编辑还是新增,add,edit
            tagNameFilter: "", //标签名称
            selectTagColor: scssData.colorBlue, //标签颜色
            currentSelectTag: null, //当前编辑或者删除的标签
            //===================================其他参数====================================//
            loading: false, //添加标签加载效果
            loading2: false, //删除标签加载效果
            popoverVisible: false, //是否显示标签弹出框
            popoverVisible2: false, //是否显示新增和编辑弹出框
            popoverVisible3: false, //是否显示确定弹出框
        };
    },
    computed: {
        matchedTagEnum() {
            return this.tagsEnum.filter((tag) => {
                const { name } = tag;
                return name.indexOf(this.tagNameFilter) !== -1;
            })
        },
        tagInfo: { //标签信息
            get() {
                return this.$store.state.apidoc.apidocInfo?.info?.tag || {};
            },
            set(val) {
                this.$store.commit("apidoc/changeTagInfo", val);
            },
        },
    },
    mounted() {
        const app = document.querySelector("#app") //hack防止弹窗确定让popover关闭
        app?.addEventListener("click", this.handleHidePopover);
        this.getTagsEnum();
    },
    beforeDestroy() {
        const app = document.querySelector("#app")
        app?.removeEventListener("click", this.handleHidePopover)
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //获取host枚举值
        getTagsEnum() {
            const params = {
                projectId: this.$route.query.id,
            };
            this.axios.get("/api/docs/docs_tag_enum", { params }).then((res) => {
                this.tagsEnum = res.data;
            }).catch((err) => {
                console.error(err);
            })
        },
        //=====================================前后端交互====================================//
        //新增标签
        handleAddTag() {
            this.loading = true;
            const params = {
                projectId: this.$route.query.id,
                ...this.formInfo,
            };
            this.axios.post("/api/docs/docs_tag", params).then((res) => {
                this.tagsEnum.push(res.data)
                this.popoverVisible2 = false;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //修改标签
        handleEditTag() {
            this.loading = true;
            const params = {
                projectId: this.$route.query.id,
                _id: this.currentSelectTag._id,
                ...this.formInfo,
            };
            this.axios.put("/api/docs/docs_tag", params).then((res) => {
                // this.tagsEnum.push(res.data)
                const tagIndex = this.tagsEnum.findIndex((tag) => tag._id === res.data._id);
                const tagInfo = res.data
                this.tagsEnum.splice(tagIndex, 1, tagInfo);
                if (this.tagInfo._id === res.data._id) {
                    this.tagInfo = tagInfo
                }
                this.popoverVisible2 = false;
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================组件间交互====================================//
        //打开新增tag弹窗
        handleOpenAddTagPopover() {
            this.operationType = "add"
            this.tagNameFilter = "";
            this.formInfo.name = "";
            this.popoverVisible2 = true;
        },
        //打开修改标签弹窗
        handleOpenEditTagPopover(item) {
            this.operationType = "edit"
            this.currentSelectTag = item;
            this.popoverVisible2 = true;
            this.formInfo.name = item.name;
            this.formInfo.color = item.color;
        },
        //打开删除标签弹窗
        handleOpenDeleteTagPopover(item) {
            this.currentSelectTag = item;
        },
        //关闭新增和修改弹窗
        handleClosePopover() {
            this.popoverVisible2 = false;
            this.currentSelectTag = null;
        },
        //隐藏popover弹窗
        handleHidePopover(e) {
            e.stopPropagation();
            this.popoverVisible = false;
            this.popoverVisible2 = false;
            this.popoverVisible3 = false;
            this.currentSelectTag = null;
            this.$refs.delete?.forEach((val) => { //hack
                val.visible = false;
            })
        },
        //选择颜色
        handleSelectColor(color) {
            this.selectTagColor = color;
            this.formInfo.color = color;
        },
        //选择自定义颜色
        handleChangeCustomColor(color) {
            this.selectTagColor = color;
        },
        //取消删除标签确认框
        handleCancelConfirm() {
            this.currentSelectTag = null;
        },
        //删除标签
        handleDeleteTag(item) {
            this.loading2 = true;
            const params = {
                ids: [item._id],
                projectId: this.$route.query.id,
            };
            this.axios.delete("/api/docs/docs_tag", { data: params }).then(() => {
                const deleteIndex = this.tagsEnum.findIndex((tag) => tag._id === item._id)
                this.tagsEnum.splice(deleteIndex, 1)
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading2 = false;
                this.currentSelectTag = null;
            });
        },
        //选择标签
        handleSelectTag(item) {
            this.tagInfo = item;
            this.popoverVisible = false;
            this.popoverVisible2 = false;
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.tag {
    margin-top: size(10);
}
.tag-wrap {
    width: size(250);
    .search {
        border-bottom: 1px solid $gray-300;
        margin-bottom: size(5);
        display: flex;
        .el-input__inner {
            border: none;
        }
    }
    .content {
        max-height: size(300);
        font-size: fz(13);
        .item {
            height: size(30);
            display: flex;
            align-items: center;
            cursor: pointer;
            &.active {
                background: $gray-200;
                .delete, .edit {
                    display: flex;
                }
            }
            &:hover {
                background: $gray-200;
                .delete, .edit {
                    display: flex;
                }
            }
            .dot {
                width: size(10);
                height: size(10);
                border-radius: 50%;
                margin-right: size(5);
                margin-top: -size(2);
            }
            .delete, .edit {
                height: size(30);
                width: size(25);
                display: none;
                align-items: center;
                justify-content: center;
                &:hover {
                    background: $gray-300;
                }
                // color: $red;
            }
        }
    }
}
.add-tag {
    width: size(250);
    height: size(250);
    position: relative;
    .color-wrap {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }
    .rect {
        cursor: pointer;
        width: size(20);
        height: size(20);
        margin-right: size(10);;
        margin-right: size(10);
        position: relative;
        .check {
            position: absolute;
            color: $white;
            font-weight: bolder;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }
    }
    .submit {
        right: size(0);
        bottom: size(0);
        position: absolute;
    }
    .close {
        position: absolute;
        top: size(0);
        right: size(0);
        margin-top: size(-3);
        font-size: fz(16);
        width: size(20);
        height: size(20);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &:hover {
            color: $red;;
        }
    }
}
</style>
