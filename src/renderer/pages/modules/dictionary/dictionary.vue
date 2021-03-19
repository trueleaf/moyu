/*
    创建者：shuxiaokai
    创建时间：2021-01-29 13:22
    模块名称：名词库维护
    备注：
*/
<template>
    <div class="dictionary">
        <div class="search">
            <img src="@/assets/imgs/logo.png" alt="logo" class="logo">
            <div class="ipt-wrap" :class="{active: isActive}">
                <input type="text" class="ipt" placeholder="在这里进行名词查询" @click.stop="() => {}" @focus="handleFocus" @blur="handleBlur">
                <div v-show="isActive" class="list-wrap">
                    <div v-for="item in 10" :key="item" class="item">
                        <div class="head"></div>
                        <div class="content">野生动物</div>
                        <div class="tail">xxx</div>
                    </div>
                </div>
            </div>
            <div class="common">
                <div class="tag">老虎</div>
                <div class="tag">花牌坊</div>
            </div>
        </div>
        <s-view v-if="activeTanb === 's-view'"></s-view>
        <s-edit v-if="activeTanb === 's-edit'"></s-edit>
        <s-add v-if="activeTanb === 's-add'"></s-add>
    </div>
</template>

<script>
import edit from "./components/edit.vue"
import view from "./components/view.vue"
import add from "./components/add.vue"

export default {
    components: {
        "s-edit": edit,
        "s-view": view,
        "s-add": add,
    },
    data() {
        return {
            //=================================表单与表格参数================================//

            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
            activeTanb: "s-edit",
            isActive: false, //是否出现备选项
        };
    },
    created() {
        this.init();
    },
    methods: {
        //==================================初始化&获取远端数据===============================//
        //初始化
        init() {
            document.documentElement.addEventListener("click", () => {
                this.isActive = false;
            })
            this.$event.on("dictionary/edit", () => {
                this.activeTanb = "s-edit";
            })
            this.$event.on("dictionary/add", () => {
                this.activeTanb = "s-add";
            })
            this.$event.on("dictionary/close", () => {
                this.activeTanb = "s-view";
            })
        },
        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        handleFocus() {
            this.isActive = true;
        },
        handleBlur() {
            this.isActive = false;
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.dictionary {
    height: calc(100vh - #{size(60)});
    min-height: size(600);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    .search {
        display: flex;
        align-items: center;
        flex-direction: column;
        min-width: size(550);
        width: 50%;
        .logo {
            width: size(100);
            height: size(100);
        }
        // 搜索框与下拉框
        .ipt-wrap {
            border-top-left-radius: size(20);
            border-top-right-radius: size(20);
            border-bottom-left-radius: size(20);
            border-bottom-right-radius: size(20);
            border: 1px solid $gray-500;
            height: size(45);
            width: 100%;
            padding: 0 size(25);
            position: relative;
            &.active {
                border-top-left-radius: size(20);
                border-top-right-radius: size(20);
                border-bottom-left-radius: size(0);
                border-bottom-right-radius: size(0);
            }
            .list-wrap {
                position: absolute;
                left: 0;
                top: size(44);
                width: 100%;
                height: size(300);
                border: 1px solid $gray-500;
                margin-left: size(-1);
                border-top-color: transparent;
                font-size: fz(16);
                padding: size(10) 0;
                overflow-y: auto;
                z-index: $zIndex-panel;
                background: $white;
                .item {
                    height: size(35);
                    display: flex;
                    align-items: center;
                    padding: 0 size(20);
                    cursor: pointer;
                    &:hover {
                        background-color: $gray-200;
                    }
                    .head {
                        margin-right: size(10);
                    }
                    .content {
                        flex: 1;
                    }
                    .tail {
                        font-size: fz(16);
                        color: $gray-500;
                        flex: 0 0 size(50);
                    }
                }
            }
        }
        .ipt {
            width: 100%;
            height: 100%;
            font-size: fz(16);
            border: none;
        }
        // 热门搜索参数
        .common {
            width: 100%;
            margin-top: size(15);
            .tag {
                display: inline-flex;
                padding: size(2) size(10);
                border: 1px solid $gray-300;
                border-radius: 99999999999px;
                margin-right: size(10);
                cursor: pointer;
            }
        }
    }
}
</style>
