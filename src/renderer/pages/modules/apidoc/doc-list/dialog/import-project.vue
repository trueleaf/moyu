/*
    创建者：shuxiaokai
    创建时间：2021-04-05 21:21"
    模块名称：导入项目
    备注：xxxx
*/
<template>
    <s-dialog title="导入生成项目" :is-show="visible" class="import-doc" @close="handleClose">
        <s-import class="wrap" import-as-project></s-import>
    </s-dialog>
</template>

<script>
import importProject from "@/pages/modules/apidoc/mixin/content/import/import.vue";

export default {
    components: {
        "s-import": importProject,
    },
    props: {
        visible: { //弹窗是否显示
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
        };
    },
    created() {
        this.$event.once("apidoc/importAsProjectSuccess", () => {
            this.$emit("update:visible", false);
        });
    },
    methods: {
        //=====================================其他操作=====================================//
        handleClose() {
            this.$emit("update:visible", false);
        },
    },
};
</script>

<style lang="scss">
.import-doc {
    .wrap {
        width: 100%;
        height: 60vh;
    }
}
</style>
