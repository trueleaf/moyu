/*
    创建者：shuxiaokai
    创建时间：2021-03-19 14:01
    模块名称：编辑词条
    备注：
*/
<template>
    <div class="s-edit">
        <s-fieldset title="修改名词">
            <el-form ref="form" :model="formInfo" :rules="rules" label-width="100px">
                <el-form-item label="中文名称：">
                    <el-input v-model="formInfo.name" placeholder="eg：笨鸟先飞" size="mini" class="w-80"></el-input>
                </el-form-item>
                <el-form-item label="英文名称：">
                    <el-input v-model="formInfo.name" placeholder="eg：stupid" size="mini" class="w-80"></el-input>
                </el-form-item>
                <el-form-item label="词汇举例：">
                    <el-input v-model="formInfo.name" placeholder="eg：老师经常对我说：笨鸟先飞" size="mini" class="w-80"></el-input>
                </el-form-item>
            </el-form>
            <s-rich-text></s-rich-text>
            <div class="submit">
                <el-button size="mini" type="success">确定修改</el-button>
            </div>
        </s-fieldset>
        <i class="el-icon-close close" @click="handleClose"></i>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            formInfo: {},
            rules: {},
            //===================================枚举参数====================================//

            //===================================业务参数====================================//

            //===================================其他参数====================================//
        };
    },
    created() {

    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //关闭
        handleClose() {
            this.$event.emit("dictionary/closeEdit");
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.s-edit {
    min-width: size(550);
    width: 50%;
    position: relative;
    .form {
        border: 1px solid $gray-300;
        border-bottom: none;
        padding: size(10) 0;
    }
    .el-divider--horizontal {
        margin: size(5) 0 size(15);
    }
    .el-form-item {
        margin-bottom: size(5);
    }
    .close {
        display: inline-flex;
        width: size(35);
        height: size(35);
        align-items: center;
        justify-content: center;
        position: absolute;
        right: size(10);
        top: size(20);
        font-size: fz(18);
        cursor: pointer;
        &:hover {
            color: $red;
        }
    }
    .submit {
        padding: size(10);
        display: flex;
        align-items: center;
        justify-content: center;
        border-top: none;
    }
    .s-fieldset {
        .content {
            padding: 0;
            padding-top: size(35);
            .w-e-text-container {
                border: none!important;
            }
            .w-e-toolbar {
                border: none!important;
                border-bottom: 1px solid $gray-300!important;
            }
        }
    }
}
</style>
