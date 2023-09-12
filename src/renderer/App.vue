/*
    创建者：shuxiaokai
    创建时间：2021-06-08 19:20
    模块名称：首页
    备注：
*/
<template>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from 'vue'
import type { IpcRenderer } from 'electron';
import config from '@/../config/config'
import { $t } from './i18n/i18n';

let ipcRenderer: IpcRenderer;
if (window.require) {
  // eslint-disable-next-line prefer-destructuring
  ipcRenderer = window.require('electron').ipcRenderer;
}
const bindShortcut = (e: KeyboardEvent) => {
  if (e.ctrlKey && (e.key === 'R' || e.key === 'r')) {
    window.location.reload()
  } else if (e.ctrlKey && (e.key === 'F5')) {
    ipcRenderer.send('force-reload')
  } else if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
    ipcRenderer.send('open-dev-tools')
  }
}

onMounted(() => {
  if (!config.isDev && config.localization.consoleWelcome) {
    console.log(`
                     _ _            _ _           _ _ _ _ _ _ _     _ _      _ _    _ _        _ _
                    / _ \\          / _ \\         / _ _ _ _ _ _ \\    \\   \\   /   /   |  |       |  |
                   / / \\ \\        / / \\ \\       / /           \\ \\    \\   \\ /   /    |  |       |  |
                  / /   \\ \\      / /   \\ \\     | |             | |    \\   /   /     |  |       |  |
                 / /     \\ \\    / /     \\ \\    | |             | |     \\ /   /      |  |       |  |
                / /       \\ \\  / /       \\ \\    \\ \\_ _ _ _ _ _/ /       /   /       \\ _|_ _ _ _| _/
               /_/         \\_\\/_/         \\_\\    \\_ _ _ _ _ _ _/       /_ _/         \\ _ _ _ _ _ /

               ${$t('基于Vue和Electron的接口文档工具')}

               ${$t('GitHub地址')}：https://github.com/trueleaf/moyu

               ${$t('Gitee地址')}：https://gitee.com/shuzhikai/apiflow

               ${$t('最近一次更新')}：${process.env.VUE_APP_BUILD_TIME}
            `)
  }
  if (!config.localization.consoleWelcome) {
    console.log(process.env.VUE_APP_BUILD_TIME);
  }
  document.title = `${config.isDev ? `${config.localization.title}(本地)` : config.localization.title} `;
  window.addEventListener('keydown', bindShortcut);
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', bindShortcut);
})

</script>

<style lang="scss">
#app {
    width: 100vw;
    height: 100vh;
}
</style>
