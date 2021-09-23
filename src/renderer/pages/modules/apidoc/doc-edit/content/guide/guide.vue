/*
    创建者：shuxiaokai
    创建时间：2021-08-15 16:28
    模块名称：引导界面
    备注：
*/
<template>
    <div class="guide">
        <div class="wrap">
            <img :src="require('@/assets/imgs/logo.png')" width="150" height="150" alt="logo图片" class="logo">
            <h2>当前版本0.8.0</h2>
            <p>预计将会在年底发布第一个稳定版本！</p>
            <!-- <ul>
                <li>支持web端调试</li>
                <li>支持表单</li>
            </ul> -->
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    data() {
        return {
        };
    },
    methods: {
    },
})
</script>

<style lang="scss">
.guide {
    height: calc(100vh - #{size(100)});
    position: relative;
    .wrap {
        text-align: center;
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translate(-50%, 0);
    }
}
</style>
