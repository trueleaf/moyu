/*
    创建者：shuxiaokai
    创建时间：2021-03-19 14:01
    模块名称：新增词条
    备注：
*/
<template>
    <div class="s-add">
        <s-fieldset title="新增名词">
            <el-form ref="form" :model="formInfo" :rules="rules" label-width="100px">
                <el-form-item label="中文名称：" prop="cnName">
                    <el-input v-model="formInfo.cnName" placeholder="eg：笨鸟先飞" size="mini" class="w-80"></el-input>
                </el-form-item>
                <el-form-item label="同义词：">
                    <el-tag v-for="(item, index) in formInfo.synonym" :key="index" closable size="small" class="mr-1" @close="handleDeleteSynonym(item, index)">{{ item }}</el-tag>
                    <el-input
                        v-if="showInput"
                        ref="tagInput"
                        v-model="synonymValue"
                        class="w-100px"
                        size="mini"
                        @keyup.enter.native="handleConfirmSynonym"
                        @blur="handleConfirmSynonym"
                    >
                    </el-input>
                    <el-button v-else type="text" size="small" @click="handleShowSynonymInput">新增同义词</el-button>
                </el-form-item>
                <el-form-item label="英文名称：" prop="enName">
                    <el-input v-model="formInfo.enName" placeholder="eg：stupid" size="mini" class="w-80"></el-input>
                </el-form-item>
                <el-form-item label="标签信息：">
                    啊
                </el-form-item>
                <el-form-item label="词汇举例：">
                    <el-input v-model="formInfo.example" placeholder="eg：老师经常对我说：笨鸟先飞" size="mini" class="w-80"></el-input>
                </el-form-item>
                <el-form-item label="参考链接：">
                    <el-input v-model="formInfo.refer" placeholder="例如：https://baike.baidu.com/" size="mini" class="w-80"></el-input>
                </el-form-item>
            </el-form>
            <s-rich-text v-model="formInfo.remark"></s-rich-text>
            <div class="submit">
                <el-button :loading="loading" size="mini" type="success" @click="handleAddVocabulary">确定新增</el-button>
                <el-button v-if="hasCache" size="mini" type="success" @click="handleApplyCache">应用上次</el-button>
            </div>
            <i class="el-icon-close close" @click="handleClose"></i>
        </s-fieldset>
        <s-fieldset title="预览" class="ml-2 w-50 flex0">
            <div v-html="formInfo.remark" class="px-3"></div>
        </s-fieldset>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //=================================表单与表格参数================================//
            formInfo: {
                synonym: [],
            },
            rules: {
                cnName: [
                    { required: true, message: "请输入中文名称", trigger: "blur" },
                ],
                // enName: [
                //     { required: true, message: "请输入英文名称", trigger: "blur" },
                // ],
            },
            //===================================枚举参数====================================//

            //===================================业务参数====================================//
            synonymValue: "", //同义词绑定的值
            //===================================其他参数====================================//
            showInput: false, //是否展示同义词输入框
            loading: false, //新增词汇加载
            hasCache: false, //是否存在上次提交数据的缓存
        };
    },
    watch: {
        formInfo: {
            handler(val) {
                localStorage.setItem("dictionary/word", JSON.stringify(val));
            },
            deep: true,
        },
    },
    created() {
        this.hasCache = localStorage.getItem("dictionary/word");
    },
    methods: {
        //==================================初始化&获取远端数据===============================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//
        //关闭
        handleClose() {
            this.$emit("close");
            // this.$event.emit("dictionary/closeAdd");
        },
        //新增词汇
        handleAddVocabulary() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    const params = this.formInfo;
                    this.axios.post("/api/dictionary/dictionary", params).then((res) => {
                        console.log(res);
                        this.$message.success("操作成功");
                    }).catch((err) => {
                        console.error(err);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$nextTick(() => document.querySelector(".el-form-item.is-error input")?.focus());
                    this.$message.warning("请完善必填信息");
                    this.loading = false;
                }
            });
        },
        //应用上次填写的数据
        handleApplyCache() {
            let cache = localStorage.getItem("dictionary/word") || "{}";
            cache = JSON.parse(cache);
            console.log(cache)
            Object.assign(this.formInfo, cache);
        },
        //删除同义词
        handleDeleteSynonym(item, index) {
            this.formInfo.synonym.splice(index, 1);
        },
        //显示同义词输入框
        handleShowSynonymInput() {
            this.synonymValue = "";
            this.showInput = true;
            this.$nextTick(() => {
                this.$refs.tagInput.focus();
            })
        },
        //确认添加同义词
        handleConfirmSynonym() {
            if (this.synonymValue.trim() === "") {
                this.showInput = false;
            } else if (this.formInfo.synonym.includes((val) => val === this.synonymValue)) { //重复词汇
                this.showInput = false;
            } else {
                this.formInfo.synonym.push(this.synonymValue);
                this.showInput = false;
            }
        },
        //=====================================其他操作=====================================//

    },
};
</script>

<style lang="scss">
.s-add {
    min-width: size(550);
    width: 100%;
    position: relative;
    display: flex;
    .form {
        border: 1px solid $gray-300;
        border-bottom: none;
        padding: size(10) 0;
    }
    .el-divider--horizontal {
        margin: size(5) 0 size(15);
    }
    .el-form-item {
        margin-bottom: size(10);
    }
    .close {
        display: inline-flex;
        width: size(35);
        height: size(35);
        align-items: center;
        justify-content: center;
        position: absolute;
        right: size(10);
        top: size(10);
        font-size: fz(18);
        cursor: pointer;
        color: $red;
        &:hover {
            color: $red;
        }
    }
    .submit {
        padding: size(10);
        display: flex;
        align-items: center;
        justify-content: center;
        // border: 1px solid $gray-300;
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
