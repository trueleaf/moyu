<template>
  <div>{{ $i18next.language }}{{ $t('基于Vue和Electron的接口文档工具') }}</div>
  <!-- <router-view></router-view> -->
</template>

<script setup lang="ts">
import { config } from '@/../config/config';
import { nextTick, onMounted } from 'vue';
import { t } from 'i18next';
onMounted(() => {
  nextTick(() => {
    console.log(t('name'))
  })
  if (!config.isDev && config.localization.consoleWelcome) {
    console.log(`
              _ _            _ _           _ _ _ _ _ _ _     _ _      _ _    _ _        _ _
            / _ \\          / _ \\         / _ _ _ _ _ _ \\    \\   \\   /   /   |  |       |  |
            / / \\ \\        / / \\ \\       / /           \\ \\    \\   \\ /   /    |  |       |  |
          / /   \\ \\      / /   \\ \\     | |             | |    \\   /   /     |  |       |  |
          / /     \\ \\    / /     \\ \\    | |             | |     \\ /   /      |  |       |  |
        / /       \\ \\  / /       \\ \\    \\ \\_ _ _ _ _ _/ /       /   /       \\ _|_ _ _ _| _/
        /_/         \\_\\/_/         \\_\\    \\_ _ _ _ _ _ _/       /_ _/         \\ _ _ _ _ _ /

        `)
  }
  document.title = `${config.isDev ? `${config.localization.title}(本地)` : config.localization.title} `;
  // ${this.$t('基于Vue和Electron的接口文档工具')}

  // ${this.$t('GitHub地址')}：https://github.com/trueleaf/moyu

  // ${this.$t('Gitee地址')}：https://gitee.com/shuzhikai/apiflow
  if (!config.isDev) {
    // ${this.$t('最近一次更新')}：${__APP_BUILD_TIME__}
  }
})



</script>

<style lang="scss" scoped>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
