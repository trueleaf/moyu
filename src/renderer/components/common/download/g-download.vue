/*
    创建者：shuxiaokai
    创建时间：2021-06-23 22:36
    模块名称：下载组件
    备注：
*/
<template>
    <div class="s-download mr-2" @click.stop="downloadFile">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

type DownloadResponse = {
    fileName?: string,
    data: string | Blob,
}

export default defineComponent({
    props: {
        static: { //1.false 通过ajax下载文件流 2. true 通过url请求
            type: Boolean,
            default: false,
        },
        url: { //文件下载地址
            type: String,
            required: true,
            default: "",
        },
        params: { //额外参数
            type: Object,
            default: () => ({}),
        },
    },
    emits: ["finish", "start"],
    data() {
        return {
        };
    },
    methods: {
        //导出任务明细
        downloadFile() {
            this.$emit("start");
            if (this.static) {
                window.open(this.url);
                this.$emit("finish");
                return;
            }
            this.axios.get<DownloadResponse, DownloadResponse>(this.url, {
                responseType: "blob",
                params: this.params,
            }).then((res) => {
                let blobUrl = "";
                blobUrl = URL.createObjectURL(res.data as Blob);
                const downloadElement = document.createElement("a");
                downloadElement.href = blobUrl;
                downloadElement.download = res.fileName ? decodeURIComponent(res.fileName) : this.$t("未命名"); //下载后文件名
                document.body.appendChild(downloadElement);
                downloadElement.click(); //点击下载
                document.body.removeChild(downloadElement); //下载完成移除元素
                window.URL.revokeObjectURL(blobUrl); //释放掉blob对象
            }).catch((err) => {
                console.error(err);
            }).finally(() => {
                this.$emit("finish");
            });
        },
    },
})
</script>

<style lang="scss">
.s-download {
    &>button {
        height: 100%;
    }
}
</style>
