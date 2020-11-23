/*
    创建者：shuxiaokai
    创建时间：2020-11-20 13:46
    模块名称：
    备注：xxxx
*/
<template>
    <div id="editor">

    </div>
</template>

<script>
import E from "wangeditor"
import hljs from "highlight.js"
import OSS from "ali-oss"
export default {
    props: {
        value: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            editorInstance: null,
            config: {
                heigth: 300,
                placeholder: "在这里可以添加一些描述信息",
                showFullScreen: false,
                menus: [
                    "head",
                    "bold",
                    "fontSize",
                    "italic",
                    "underline",
                    "strikeThrough",
                    "indent",
                    "foreColor",
                    "backColor",
                    "link",
                    "list",
                    "justify",
                    "quote",
                    "image",
                    "table",
                    "code",
                    "splitLine",
                    "undo",
                    "redo",
                ]
            },
            //=====================================图片相关====================================//
            expireTime: null, //票据过期时间
            aliOssConfig: null,
        };
    },
    mounted() {
        this.initEditor();
    },
    methods: {
        async initEditor() {
            this.editorInstance = new E("#editor");
            this.editorInstance.highlight = hljs
            this.editorInstance.config.height = this.config.heigth;
            this.editorInstance.config.placeholder = this.config.placeholder;
            this.editorInstance.config.menus = this.config.menus;
            this.editorInstance.config.showFullScreen = this.config.showFullScreen;
            this.editorInstance.config.onchange = (value) => {
                this.$emit("input", value);
            }
            if (!this.expireTime || this.expireTime * 1000 < Date.now()) {
                await this.getStsToken();
            }
            this.initUploadFile();
            this.editorInstance.txt.html(this.value)
            this.editorInstance.create();
        },
        initUploadFile() {
            console.log({
                accessKeyId: this.aliOssConfig.accessKeyId,
                accessKeySecret: this.aliOssConfig.accessKeySecret,
                stsToken: this.aliOssConfig.stsToken,
                bucket: this.aliOssConfig.bucket,
                region: this.aliOssConfig.region,
            })
            this.editorInstance.config.customUploadImg = async (resultFiles, cb) => {
                if (!this.expireTime || this.expireTime * 1000 < Date.now()) {
                    await this.getStsToken();
                }

                const client = new OSS({
                    accessKeyId: this.aliOssConfig.accessKeyId,
                    accessKeySecret: this.aliOssConfig.accessKeySecret,
                    stsToken: this.aliOssConfig.stsToken,
                    bucket: this.aliOssConfig.bucket,
                    region: this.aliOssConfig.region,
                });
                const fileName = `/${this.aliOssConfig.folder}/${Date.now()}_richtext`
                client.put(fileName, resultFiles[0]).then(() => {
                    cb(this.config.renderConfig.httpRequest.imgUrl + "/" + fileName)
                }).catch(err => {
                    this.$errorThrow(err, this);
                });  
                // const formData = new FormData();
                // const fileName = "richText" 
                // const fileUrl = this.aliOssConfig.dir + Date.now() + "_" + fileName;
                // formData.append("name", fileName);
                // formData.append("key", fileUrl);
                // formData.append("policy", this.aliOssConfig.policy);
                // formData.append("OSSAccessKeyId", this.aliOssConfig.accessKeyId);
                // formData.append("success_action_status", 200);
                // formData.append("signature", this.aliOssConfig.signature);
                // formData.append("file", resultFiles[0]);

                // console.log(this.aliOssConfig, 999)

                // axios.post(this.config.renderConfig.httpRequest.imgUrl, formData).then(res => {
                //     console.log(res)
                //     cb(this.config.renderConfig.httpRequest.imgUrl + "/" + fileUrl)
                // }).catch(err => {
                //     this.$errorThrow(err, this);
                // });    
                // console.log(this.aliOssConfig, resultFiles)
            }
        },
        getStsToken() {
            return new Promise((resolve, reject) => {
                this.axios.get("/api/oss/sts").then(res => {
                    this.aliOssConfig = res.data;
                    this.expireTime = new Date(res.data.expire).valueOf();
                    resolve();
                }).catch(err => {
                    console.error(err);
                    reject();
                });                
            })
        },
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
