/*
    创建者：shuxiaokai
    创建时间：2019-09-19 15:59
    模块名称：下载上传组件
    备注：xxxx
*/
<template>
    <el-button :loading="loading" :size="config.renderConfig.layout.size" :type="type" icon="el-icon-upload" v-bind="$attrs" v-on="$listeners" @click.stop="downloadFile">
        <slot />
    </el-button>
</template>

<script>
export default {
    props: {
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
        static: { //1.false 通过ajax下载文件流 2. true 通过url请求
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: "primary"
        },
        fileName: {
            type: String,
            default: "未命名"
        }
    },
    data() {
        return {
            loading: false
        };
    },
    created() {},
    methods: {
        //导出任务明细
        downloadFile() {
            if (this.static) {
                // window.open(this.url);
                const downloadElement = document.createElement("a");
                downloadElement.href = this.url;
                
                downloadElement.download = decodeURIComponent(this.fileName); //下载后文件名
                document.body.appendChild(downloadElement);
                downloadElement.click(); //点击下载
                document.body.removeChild(downloadElement); //下载完成移除元素
                return
            }
            this.loading = true;
            this.axios.get(this.url, {
                responseType: "blob",
                params: this.params,
            }).then(res => {
                let blobUrl = "";
                console.log(res)
                blobUrl = URL.createObjectURL(res);
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

</style>
