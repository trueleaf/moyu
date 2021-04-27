/*
    创建者：shuxiaokai
    创建时间：2020-11-25 17:32
    模块名称：数据统计
    备注：xxxx
*/
<template>
    <div class="statistics">
        <div class="flex1 d-flex flex-column a-center">
            <img :src="require('@/assets/imgs/logo.png')" width="150px" height="150px" alt="logo图片" class="logo">
            <div class="f-base">
                <div>
                    <span>接口数量：</span>
                    <span>{{ docNumInfo.docNum }}</span>
                </div>
            </div>
            <div class="f-base mt-2">
                <div class="text-center">
                    <span></span>
                    <span>Mock服务器已启动</span>
                    <span class="mx-2">http://127.0.0.1:{{ config.renderConfig.mock.port }}</span>
                    <el-popover placement="top-start" width="350" trigger="hover" content="">
                        <div class="f-sm mt-1">
                            <span class="d-inline-block w-70px">真实接口</span>
                            <span class="green ml-2">http://demo.com</span>
                            <span>/user_info</span>
                        </div>
                        <div class="f-sm mt-1">
                            <span class="d-inline-block w-70px">Mock接口</span>
                            <span class="green ml-2">http://127.0.0.1:{{ config.renderConfig.mock.port }}</span>
                            <span>/user_info</span>
                        </div>
                        <i slot="reference" class="el-icon-question"></i>
                    </el-popover>
                    <!-- <span class="ml-2 theme-color cursor-pointer">停止</span> -->
                </div>
            </div>
        </div>
        <div class="drawer">
            <el-tabs v-model="activeName">
                <el-tab-pane label="快捷键" name="s-a">
                    <div class="shortcut">
                        <div v-for="(item, index) in shortcutList" :key="index" class="shortcut-list">
                            <div class="head">{{ item.name }}</div>
                            <div class="tail">
                                <span v-for="(item2, index2) in item.keys" :key="index2">
                                    <span class="key">{{ item2 }}</span>
                                    <span v-if="index2 !== item.keys.length - 1" class="mx-2">+</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="提示内容" name="s-b"> </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            shortcutList: [{
                name: "查看历史记录",
                keys: ["Ctrl", "H"],
            }, {
                name: "文档导出",
                keys: ["Ctrl", "E"],
            }, {
                name: "文档导入",
                keys: ["Ctrl", "I"],
            }, {
                name: "文档预览",
                keys: ["Ctrl", "P"],
            }, {
                name: "项目设置",
                keys: ["Ctrl", ","],
            }, {
                name: "页面刷新",
                keys: ["Ctrl", "R"],
            }, {
                name: "使劲刷新",
                keys: ["Ctrl", "Shift", "R"],
            }],
            //=====================================其他参数====================================//
            activeName: "s-a",
        };
    },
    computed: {
        docNumInfo() {
            let docNum = 0;
            let folderNum = 0;
            const { banner } = this.$store.state.apidoc;
            this.$helper.dfsForest(banner, {
                rCondition(value) {
                    return value.children;
                },
                rKey: "children",
                hooks(data) {
                    if (!data.isFolder) {
                        docNum += 1;
                    } else {
                        folderNum += 1;
                    }
                },
            });
            return {
                docNum,
                folderNum,
            };
        },
        test() {
            return this.$store.state.apidoc.uniquePathEnum;
        },
    },
    created() {
    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//

        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.statistics {
    height: calc(100% - #{size(40)});
    position: relative;
    display: flex;
    .summary {
        display: flex;
        padding: size(20);
        border-bottom: 1px solid $gray-300;
        .brand {
            padding: size(10) size(20);
            width: size(150);
            max-width: 15%;
            height: size(80);
            border: 1px solid $gray-300;
            margin-right: size(20);
            .title {
                font-size: fz(20);
            }
            .value {
                font-size: fz(30);
            }
        }
    }
    .drawer {
        flex: 0 0 auto;
        width: size(350);
        height: 100%;
        // padding: size(10) 0;
        border-left: 1px solid $gray-400;
        .el-tabs__header {
            padding: 0 size(10);
            margin-bottom: size(5);
        }
    }
    // 快捷方式
    .shortcut {
        .shortcut-list {
            height: size(35);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: size(0) size(20);
            border-bottom: 1px solid $gray-300;
            &:hover {
                background: $gray-200;
            }
            .head {
                // width: size(100);
                margin-right: size(20);
                display: inline-flex;
                justify-content: flex-end;
            }
            .tail {
                display: inline-flex;
                align-items: center;
                font-size: fz(13);
                .key {
                    display: inline-block;
                    padding: size(2) size(5);
                    background: $gray-300;
                }
            }
        }
    }
}
</style>
