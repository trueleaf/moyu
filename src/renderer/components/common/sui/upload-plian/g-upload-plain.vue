/*
    创建者：shuxiaokai
    创建时间：2020-03-02 14:24
    模块名称：文件上传，支持slot
    备注：xxxx
*/
<template>
    <el-upload
            class="s-download-plain"
            :action="url"
            :http-request="upload"
            :show-file-list="false"
            :before-upload="checkFileSizeAndType">
        <slot />
    </el-upload>
</template>

<script>
export default {
    props: {
        url: {
            type: String,
            default: "",
            required: true
        },
        size: {
            //单张文件大小限制
            type: Number,
            default: 10
        },
        type: {
            //上传文件类型      
            // application/vnd.openxmlformats-officedocument.wordprocessingml.document => word  .docx文件
            // application/msword => word  .doc文件
            // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet => excel
            // application/x-zip-compressed => zip
            type: Array,
            default: function() {
                return [
                    // "image/jpg",
                    // "image/png",
                    // "image/gif",
                    // "image/jpeg",
                    // "application/pdf",
                    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    // "application/x-zip-compressed"
                ];
            }
        },
        pdf: {
            //是否上传pdf
            type: Boolean,
            default: false,
        },
        excel: {
            //是否上传excel
            type: Boolean,
            default: false,
        },
        word: {
            //是否上传word
            type: Boolean,
            default: false,
        },
        zip: {
            //是否上传zip
            type: Boolean,
            default: false,
        },
        params: { //额外参数,会合并到最后请求参数中
            type: Object,
            default() {
                return {};
            }
        },
    },
    data() {
        return {
            loading: false,
            resData: null,
        };
    },
    computed: {
        // action() {
        //     let server = this.url; //文件上传url, //文件上传url
        //     if (server.endsWith("/") && this.url.startsWith("/")) {
        //         server = server.replace(/\/$/, "");
        //     } else if (!server.endsWith("/") && !this.url.startsWith("/")) {
        //         server = server + "/";
        //     }
        //     return server;
        // }
    },
    created() {

    },
    methods: {
        upload(file) {
            this.$emit("upload");
            const hasProp = Object.hasOwnProperty; 
            const formData = new FormData();
            formData.append("file", file.file);
            for (const i in this.params) {
                if (hasProp.call(this.params, i)) {
                    formData.append(i, this.params[i]);
                }
            }
            this.axios.post(this.url, formData).then(res => {
                this.resData = res.data;
                this.$emit("success", this.resData);
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.$emit("finish", this.resData);
            });
            console.log(222, file)
        },
        //=====================================文件相关判断====================================//
        /* 
            @description  检查上传文件大小和类型
            @author        shuxiaokai
            @create       2019-07-04 14:05"
            @params       
            @return       
        */
        checkFileSizeAndType(file) {
            const isLtnM = file.size > 1024 * 1024 * this.size;
            let isValidType = this.type.includes(file.type);
            //=========================================================================//
            if (this.pdf && file.type === "application/pdf") {
                isValidType = true;
            }
            if (this.excel && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith("xls") || file.name.endsWith("xlsx"))) {
                isValidType = true;
            }
            if (this.word && (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword")) {
                isValidType = true;
            }
            if (this.zip && file.type === "application/x-zip-compressed") {
                isValidType = true;
            } 
            //=========================================================================//
            console.log("文件类型", file.name, isValidType)
            if (isLtnM) {
                this.$message({
                    type: "warning",
                    message: `每个文件大小限制为${this.size}M`
                });
            } else if (!isValidType) {
                this.$message({
                    type: "warning",
                    message: `文件类型不正确`
                });
            }
            return !isLtnM && isValidType;
        },
    }
};
</script>



<style lang="scss">
    .s-download-plain {
        margin-right: size(10); 
        .el-upload {
            height: 100%;
        }
        .el-button {
            height: 100%;
        }
    }
</style>
