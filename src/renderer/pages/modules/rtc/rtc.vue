/*
    创建者：shuxiaokai
    创建时间：2020-09-09 10:39
    模块名称：rtc
    备注：xxxx
*/
<template>
    <div>
        <video ref="localView"></video>
    </div>
</template>

<script>
import "aliyun-webrtc-sdk"
export default {
    data() {
        return {
            rtcInstance: null, //rtc实例
            localView: null,
        };
    },
    mounted() {
        this.initRtc();
    },
    methods: {
        //=====================================初始化====================================//
        initRtc() {
            this.localView = this.$refs["localView"];
            this.rtcInstance = new AliRtcEngine();
            this.rtcInstance.isSupport().then((res)=>{
                this.rtcInstance.startPreview(
                    this.localView    
                ).then(()=>{

                }).catch((error) => {
                    // 预览失败
                });
            }).catch((error)=>{
                console.error(error);
                this.$message.error("当前环境不支持webrtc");
            })
        },
    }
};
</script>



<style lang="scss">

</style>
