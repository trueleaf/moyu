/*
    创建者：shuxiaokai
    创建时间：2021-06-24 22:57
    模块名称：上传文件
    备注：
*/
<template>
    <el-upload
        class="s-download-plain"
        :action="url"
        :http-request="upload"
        :show-file-list="false"
        :before-upload="checkFileSizeAndType"
    >
        <slot />
    </el-upload>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
// import { UploadFile } from "element-plus/lib/components/upload/src/upload.type";

export default defineComponent({
    props: {
        /**
         * 上传地址
         */
        url: {
            type: String,
            default: "",
            required: true
        },
        /**
         * 上传大小显示 10M
         */
        size: {
            type: Number,
            default: 10
        },
        /**
         * 上传文件类型
         * application/vnd.openxmlformats-officedocument.wordprocessingml.document => word  .docx文件
         * pplication/msword => word  .doc文件
         * application/vnd.openxmlformats-officedocument.spreadsheetml.sheet => excel
         * application/x-zip-compressed => zip
         */
        type: {
            type: Array as PropType<string[]>,
            default: () => []
        },
        /**
         * 是否上传pdf
         */
        pdf: {
            type: Boolean,
            default: false,
        },
        /**
         * 是否上传excel
         */
        excel: {
            type: Boolean,
            default: false,
        },
        /**
         * 是否上传word
         */
        word: {
            type: Boolean,
            default: false,
        },
        /**
         * 是否上传zip
         */
        zip: {
            type: Boolean,
            default: false,
        },
        /**
         * 额外参数,会合并到最后请求参数中
         */
        params: {
            type: Object,
            default: () => ({} as Record<string, unknown>),
        },
    },
    emits: ["start", "finish", "success"],
    data() {
        return {
        };
    },
    methods: {
        //上传文件
        upload(file: { file: File }) {
            this.$emit("start");
            const formData = new FormData();
            formData.append("file", file.file);
            Object.keys(this.params).forEach((key) => {
                formData.append(key, this.params[key]);
            })
            let response: string;
            this.axios.post<{ data: string }, { data: string }>(this.url, formData).then((res) => {
                response = res.data;
                this.$emit("success", response);
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.$emit("finish", response);
            });
        },
        checkFileSizeAndType() {
            // const isLtnM = file.size > 1024 * 1024 * this.size;
            // let isValidType = this.type.includes(file.type);
            // //=========================================================================//
            // if (this.pdf && file.type === "application/pdf") {
            //     isValidType = true;
            // }
            // if (this.excel && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.name.endsWith("xls") || file.name.endsWith("xlsx"))) {
            //     isValidType = true;
            // }
            // if (this.word && (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword")) {
            //     isValidType = true;
            // }
            // if (this.zip && file.type === "application/x-zip-compressed") {
            //     isValidType = true;
            // }
            // //=========================================================================//
            // if (isLtnM) {
            //     this.$message.warning(`每个文件大小限制为${this.size}M`);
            // } else if (!isValidType) {
            //     this.$message.warning("文件类型不正确");
            // }
            // return !isLtnM && isValidType;
        },
    },
})
</script>

<style lang="scss">

</style>
