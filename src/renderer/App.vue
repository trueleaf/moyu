<template>
  <div>sadsad</div>
  <!-- <router-view></router-view> -->
</template>

<script setup lang="ts">
import { config } from '@/config/config';
import { onMounted } from 'vue';


// export default defineComponent({
//   created() {
//     if (!config.isDev && config.localization.consoleWelcome) {
//       console.log(`
//                      _ _            _ _           _ _ _ _ _ _ _     _ _      _ _    _ _        _ _
//                     / _ \\          / _ \\         / _ _ _ _ _ _ \\    \\   \\   /   /   |  |       |  |
//                    / / \\ \\        / / \\ \\       / /           \\ \\    \\   \\ /   /    |  |       |  |
//                   / /   \\ \\      / /   \\ \\     | |             | |    \\   /   /     |  |       |  |
//                  / /     \\ \\    / /     \\ \\    | |             | |     \\ /   /      |  |       |  |
//                 / /       \\ \\  / /       \\ \\    \\ \\_ _ _ _ _ _/ /       /   /       \\ _|_ _ _ _| _/
//                /_/         \\_\\/_/         \\_\\    \\_ _ _ _ _ _ _/       /_ _/         \\ _ _ _ _ _ /

//                ${this.$t('基于Vue和Electron的接口文档工具')}

//                ${this.$t('GitHub地址')}：https://github.com/trueleaf/moyu

//                ${this.$t('Gitee地址')}：https://gitee.com/shuzhikai/apiflow

//                ${this.$t('最近一次更新')}：${process.env.VUE_APP_BUILD_TIME}
//             `)
//     }
//     if (!config.localization.consoleWelcome) {
//       console.log(process.env.VUE_APP_BUILD_TIME);
//     }
//     document.title = `${config.isDev ? `${config.localization.title}(本地)` : config.localization.title} `;
//   },
// })

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

        `)
  }
  // ${this.$t('基于Vue和Electron的接口文档工具')}

  // ${this.$t('GitHub地址')}：https://github.com/trueleaf/moyu

  // ${this.$t('Gitee地址')}：https://gitee.com/shuzhikai/apiflow

  // ${this.$t('最近一次更新')}：${process.env.VUE_APP_BUILD_TIME}
})


</script>

<style lang="scss" scoped>
#app {
  width: 100vw;
  height: 100vh;
}
</style>
