/*
    创建者：shuxiaokai
    创建时间：2021-01-29 13:22
    模块名称：名词库维护
    备注：
*/
<template>
    <div class="dictionary">
        <div class="search-wrap">
            <img src="@/assets/imgs/logo.png" alt="logo" class="logo">
            <div class="ipt-wrap" :class="{active: isActive}">
                <input type="text" class="ipt" placeholder="输入你感兴趣的名词..." @focus="handleFocus" @blur="handleBlur">
                <div v-show="isActive" class="list-wrap">
                    <div v-for="item in 10" :key="item" class="item">
                        <div class="head"></div>
                        <div class="content">野生动物</div>
                        <div class="tail">xxx</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//

            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
            isActive: true, //是否出现备选项
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

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
    .search-wrap {
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translate(-50%, 0);
        display: flex;
        flex-direction: column;
        align-items: center;
        .logo {
            width: size(100);
            height: size(100);
        }
        .ipt-wrap {
            border-top-left-radius: size(20);
            border-top-right-radius: size(20);
            border-bottom-left-radius: size(20);
            border-bottom-right-radius: size(20);
            border: 1px solid $gray-500;
            width: size(550);
            height: size(45);
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
                width: size(550);
                height: size(300);
                border: 1px solid $gray-500;
                margin-left: size(-1);
                border-top-color: transparent;
                font-size: fz(16);
                padding: size(10) 0;
                overflow-y: auto;
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
            width: size(500);
            height: 100%;
            font-size: fz(16);
            border: none;
        }
    }
}
</style>
