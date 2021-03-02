/*
    创建者：shuxiaokai
    创建时间：2020-07-20 11:21"
    模块名称：导入第三方文档
    备注：xxxx
*/
<template>
    <s-dialog title="导入第三方文档" :isShow="visible" class="import-doc" @close="handleClose">
        <div class="mb-5">
            <span>文档类型：</span>
            <el-radio-group v-model="formInfo.type">
                <el-radio label="postman">postman 2.1</el-radio>
                <el-radio label="moyu">摸鱼文档</el-radio>
            </el-radio-group>
        </div>
        <div class="mb-5">
            <span>导入方式：</span>
            <el-radio-group v-model="formInfo.cover" size="mini">
                <el-radio-button :label="true">覆盖方式</el-radio-button>
                <el-radio-button :label="false">追加方式</el-radio-button>
            </el-radio-group>
        </div>
        <el-upload
                class="w-100"
                :limit="1"
                drag
                action=""
                :before-upload="handleBeforeUpload"
                :http-request="requestHook">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        </el-upload>
        <div slot="footer">
            <el-button :loading="loading" size="mini" type="primary" @click="handleSubmit">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: { //弹窗是否显示
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            formInfo: {
                type: "moyu",
                cover: false,
            }, //-------项目信息
            docs: [], //-----------导入的文档列表
            loading: false, //-----导入第三方加载效果
            jsonText: "",
        };
    },
    created() {},
    methods: {
        //=====================================图片上传====================================//
        handleBeforeUpload(file) {
            const isJson = file.type === "application/json";
            const isLt10M = file.size / 1024 < 1024 * 10;
            if (!isJson) {
                this.$message.error("只能上传json文件");
            }
            if (!isLt10M) {
                this.$message.error("文件大小不超过1M");
            }
            return isJson && isLt10M;
        },
        requestHook(e) {
            e.file.text().then((jsonText) => {
                this.jsonText = jsonText;
                console.log(this.jsonText);
            });
        },
        //=====================================原始数据转换====================================//
        //=====================================组件间交互====================================//
        handleSubmit() {
            this.loading = true;
            let moyuData = null;
            try {
                if (this.formInfo.type === "postman") {
                    this.convertPostmanData(JSON.parse(this.jsonText));
                } else if (this.formInfo.type === "moyu") {
                    moyuData = JSON.parse(this.jsonText);
                }
            } catch (error) {
                console.error(error);
                this.loading = false;
            }
            const params = {
                projectId: this.$route.query.id,
                cover: this.formInfo.cover,
                moyuData,
            };
            this.axios.post("/api/project/import/moyu", params).then(() => {
                this.$emit("success");
                this.handleClose();
            }).catch((err) => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
            });
        },
        //=====================================其他操作=====================================//
        handleClose() {
            this.$emit("update:visible", false);
        },
    },
};
</script>

<style lang="scss">
.import-doc {
    .el-upload {
        width: 100%;
    }
    .el-upload-dragger {
        width: 100%;
    }
}
</style>
