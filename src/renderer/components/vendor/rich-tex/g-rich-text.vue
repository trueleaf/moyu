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
// import axios from "axios"
import scssData from "@/scss/variables/_variables.scss"
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
                zIndex: parseInt(scssData.zIndexEditor),
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
            isSignImageUrl: false, //是否对图片url进行了转换
            aliOssConfig: null,
        };
    },
    mounted() {
        this.initEditor();
        
    },
    methods: {
        //初始化编辑器
        async initEditor() {
            this.editorInstance = new E("#editor");
            this.editorInstance.highlight = hljs
            Object.assign(this.editorInstance.config, this.config)
            if (!this.expireTime || this.expireTime * 1000 < Date.now()) {
                await this.getStsToken();
            }
            this.editorInstance.config.onchange = (value) => {
                if (!this.isSignImageUrl) {
                    this.$emit("input", value);
                }
                this.isSignImageUrl = false;
            }
            this.initUploadFile();
            this.editorInstance.create();
            const signValue = this.signAllImageUrl();
            this.editorInstance.txt.html(signValue)
        },
        //将图片地址进行签名替换,只替换阿里oss上传的图片
        signAllImageUrl() {
            const ossBaseUrl = `${this.aliOssConfig.bucket}.${this.aliOssConfig.region}.aliyuncs.com`;
            const urlRegExp = new RegExp(`https?://${ossBaseUrl}([^?]+)([^"]+)`, "g");
            const signValue = this.value.replace(urlRegExp, ($1, $2) => {
                const signUrl = this.client.signatureUrl($2, {
                    expires: 60 * 60, //单位s
                })
                // console.log(signUrl)
                this.isSignImageUrl = true;
                return signUrl;
            })
            return signValue;
        },
        initUploadFile() {
            this.editorInstance.config.customUploadImg = async (resultFiles, cb) => {
                if (!this.expireTime || this.expireTime * 1000 < Date.now()) {
                    await this.getStsToken();
                }
                const fileName = `/${this.aliOssConfig.folder}/${Date.now()}_richtext`
                this.client.put(fileName, resultFiles[0]).then(async () => {       
                    const url = this.client.signatureUrl(fileName, {
                        expires: 60 * 60, //单位s
                    })
                    cb(url)
                }).catch(err => {
                    this.$errorThrow(err, this);
                });  
            }
        },
        getStsToken() {
            return new Promise((resolve, reject) => {
                this.axios.get("/api/oss/sts").then(res => {
                    this.aliOssConfig = res.data;
                    this.expireTime = new Date(res.data.expire).valueOf();
                    this.client = new OSS({
                        accessKeyId: this.aliOssConfig.accessKeyId,
                        accessKeySecret: this.aliOssConfig.accessKeySecret,
                        stsToken: this.aliOssConfig.stsToken,
                        bucket: this.aliOssConfig.bucket,
                        region: this.aliOssConfig.region,
                    });
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
