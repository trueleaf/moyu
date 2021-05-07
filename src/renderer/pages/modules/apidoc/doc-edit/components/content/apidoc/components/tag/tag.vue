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
                <div class="search">
                    <el-input v-model="tagName" :size="config.renderConfig.layout.size" placeholder="搜索标签" class="w-100" maxlength="100" clearable>
                        <i slot="prefix" class="el-icon-search el-input__icon"></i>
                    </el-input>
                </div>
                <div class="content">
                    <div v-for="(item, index) in matchedTagEnum" :key="index" class="item">
                        <span :style="{background: item.color}" class="dot"></span>
                        <span>{{ item.name }}</span>
                    </div>
                </div>
                <div class="operation">
                    <el-popover v-model="popoverVisible2" placement="right" trigger="manual" @click.native.stop="() => {}">
                        <div class="add-tag">
                            <div class="gray-900 mb-3">新增标签</div>
                            <div class="mb-1 f-xs gray-600">标签名称</div>
                            <el-input v-model="formInfo.name" :size="config.renderConfig.layout.size" class="w-100 mb-3" maxlength="100" clearable></el-input>
                            <div class="mb-1 f-xs gray-600">颜色选择</div>
                            <div class="color-wrap">
                                <div v-for="item in colors" :key="item" class="rect" :style="{background: item}"></div>
                                <el-color-picker v-model="formInfo.color" :size="config.renderConfig.layout.size"></el-color-picker>
                            </div>
                            <el-button type="primary" :size="config.renderConfig.layout.size" class="submit">确认添加</el-button>
                        </div>
                        <el-button slot="reference" type="text" :size="config.renderConfig.layout.size" @click="popoverVisible2 = !popoverVisible2">新增标签</el-button>
                    </el-popover>
                </div>
            </div>
            <span slot="reference" class="cursor-pointer" @click="popoverVisible = !popoverVisible">
                <span class="el-icon-collection-tag f-sm mr-1"></span>
                <span class="gray-600">选择标签</span>
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
                color: "#2cf",
            },
            rules: {},
            //===================================枚举参数====================================//
            tagsEnum: [], //host枚举信息
            colors: [scssData.colorBlue, scssData.colorRed, scssData.colorOrange, scssData.colorYellow, scssData.colorGreen, scssData.colorPink, scssData.colorIndigo],
            //===================================业务参数====================================//
            tagName: "",

            //===================================其他参数====================================//
            popoverVisible: false, //是否显示弹出框
            popoverVisible2: false, //是否显示弹出框
        };
    },
    computed: {
        matchedTagEnum() {
            return this.tagsEnum.filter((tag) => {
                const { name } = tag;
                return name.indexOf(this.tagName) !== -1;
            })
        },
    },
    mounted() {
        document.documentElement.addEventListener("click", this.handleHidePopover);
        this.getTagsEnum();
    },
    beforeDestroy() {
        document.documentElement.removeEventListener("click", this.handleHidePopover)
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

        //=====================================组件间交互====================================//
        handleHidePopover(e) {
            e.stopPropagation();
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
            &:hover {
                background: $gray-200;
            }
            .dot {
                width: size(10);
                height: size(10);
                border-radius: 50%;
                margin-right: size(5);
            }
        }
    }
    .operation {
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
}
.add-tag {
    width: size(250);
    height: size(250);
    position: relative;
    .color-wrap {
        display: flex;
        flex-wrap: wrap;
        .rect {
            width: size(20);
            height: size(20);
            margin-right: size(10);;
            margin-right: size(10);
        }
    }
    .submit {
        right: size(0);
        bottom: size(0);
        position: absolute;
    }
}
</style>
