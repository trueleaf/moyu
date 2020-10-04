/*
    创建者：shuxiaokai
    创建时间：2019-09-19 15:59
    模块名称：下载上传组件
    备注：xxxx
*/
<template>
    <div class="s-download-button mr-2" @click.stop="downloadFile">
        <slot></slot>   
    </div>
</template>

<script>
export default {
    props: {
        static: { //1.false 通过ajax下载文件流 2. true 通过url请求
            type: Boolean,
            default: false
        },
        url: { //文件下载地址
            type: String,
            required: true,
            default: "",
        },
        params: { //额外参数
            type: Object,
            default() {
                return {};
            }
        },
    },
    data() {
        return {
            
        };
    },
    created() {},
    methods: {
        //导出任务明细
        downloadFile() {
            this.loading = true;
            if (this.type === "static") {
                window.open(this.url);
                return
            }
            
            this.axios.get(this.url, {
                responseType: "blob",
                params: this.params,
            }).then(res => {
                let blobUrl = "";
                console.log(res)
                blobUrl = URL.createObjectURL(res.blob);
                const downloadElement = document.createElement("a");
                downloadElement.href = blobUrl;
                downloadElement.download = res.fileName ? decodeURIComponent(res.fileName) : "未命名"; //下载后文件名
                document.body.appendChild(downloadElement);
                downloadElement.click(); //点击下载
                document.body.removeChild(downloadElement); //下载完成移除元素
                window.URL.revokeObjectURL(blobUrl); //释放掉blob对象
            }).catch(err => {
                this.$errorThrow(err, this);
            }).finally(() => {
                this.loading = false;
                this.$emit("finish");
            });   
        },
    },
};
</script>



<style lang="scss">
.s-download-button {
    &>button {
        height: 100%;
    }
}
</style>
