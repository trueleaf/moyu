/*
    创建者：shuxiaokai
    创建时间：2021-10-11 22:26
    模块名称：在线链接
    备注：
*/
<template>
    <div class="online-link">
        <div class="link-wrap">
            <div class="d-flex j-center mt-5">
                <svg class="link-icon" aria-hidden="true">
                    <use xlink:href="#iconlink"></use>
                </svg>
            </div>
            <s-fieldset title="生成链接">
                <div class="d-flex">
                    <pre class="link w-70">{{ shareLink }}</pre>
                    <el-button-group class="flex0 w-200px">
                        <!-- <el-button v-copy="shareLink" :size="config.renderConfig.layout.size">复制</el-button> -->
                        <!-- <el-button v-copy="shareLink" :size="config.renderConfig.layout.size">复制</el-button> -->
                    </el-button-group>
                </div>
            </s-fieldset>
            <s-fieldset title="额外配置">
                <s-config label="密码设置" :has-check="false" description="密码可不填写">
                    <el-input
                        v-model="formInfo.password"
                        :size="config.renderConfig.layout.size"
                        placeholder="请输入密码"
                        class="w-100"
                        maxlength="100"
                        type="password"
                        show-password
                        clearable
                    >
                    </el-input>
                </s-config>
                <s-config label="过期时间" :has-check="false" description="不填默认一个月后过期，最大日期为一年">
                    <el-radio-group v-model="formInfo.maxAge" :disabled="customMaxAge">
                        <el-radio :label="86400000">1天后</el-radio>
                        <el-radio :label="86400000 * 7">1周后</el-radio>
                        <el-radio :label="86400000 * 30">1个月后</el-radio>
                        <el-radio :label="86400000 * 90">1个季度后</el-radio>
                    </el-radio-group>
                    <el-checkbox v-model="customMaxAge" class="ml-5" :label="true">自定义</el-checkbox>
                    <el-slider v-if="customMaxAge" v-model="formInfo.maxAge" :min="86400000" :step="86400000" :max="86400000 * 365" :format-tooltip="formatTooltip"></el-slider>
                </s-config>
                <s-config ref="configShare" label="选择分享" description="开启后可以自由选择需要分享的文档">
                    <template #default="scope">
                        <div v-if="scope.enabled" class="doc-nav">
                            <div>
                                <span>总数：</span>
                                <span>{{ allCheckedNodes.length }}</span>
                                <el-divider direction="vertical"></el-divider>
                                <span>文件夹数量：</span>
                                <span>{{ allCheckedNodes.filter(node => node.isFolder).length }}</span>
                                <el-divider direction="vertical"></el-divider>
                                <span>文档数量：</span>
                                <span>{{ allCheckedNodes.filter(node => !node.isFolder).length }}</span>
                            </div>
                            <hr>
                            <el-tree
                                ref="docTree"
                                :data="navTreeData"
                                node-key="_id"
                                show-checkbox
                                :expand-on-click-node="true"
                                @check-change="handleCheckChange"
                            >
                                <template #default="prop">
                                    <div
                                        class="custom-tree-node"
                                        tabindex="0"
                                    >
                                        <!-- file渲染 -->
                                        <template v-if="!prop.data.isFolder">
                                            <template v-for="(req) in projectInfo.rules.requestMethods">
                                                <span v-if="prop.data.item.method.toLowerCase() === req.value.toLowerCase()" :key="req.name" class="file-icon" :style="{color: req.iconColor}">{{ req.name }}</span>
                                            </template>
                                            <div class="node-label-wrap">
                                                <s-emphasize class="node-top" :title="prop.data.info.name" :value="prop.data.info.name"></s-emphasize>
                                            </div>
                                        </template>
                                        <!-- 文件夹渲染 -->
                                        <template v-if="prop.data.isFolder">
                                            <i class="iconfont folder-icon iconweibiaoti-_huabanfuben"></i>
                                            <div class="node-label-wrap">
                                                <s-emphasize class="node-top" :title="prop.data.info.name" :value="prop.data.info.name"></s-emphasize>
                                            </div>
                                        </template>
                                    </div>
                                </template>
                            </el-tree>
                        </div>
                    </template>
                </s-config>
                <div class="d-flex j-center mt-2">
                    <el-button :size="config.renderConfig.layout.size" :loading="loading" type="primary" @click="handleGenerateLink">生成链接</el-button>
                </div>
            </s-fieldset>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, Ref } from "vue"
import { ElMessage } from "element-plus"
import { axios } from "@/api/api"
import { store } from "@/store/index"
import config from "@/../config/config"
import { ApidocBanner } from "@@/global";
import { router } from "@/router"
import { TreeNodeOptions } from "element-plus/packages/components/tree/src/tree.type"
// import type { Config } from "@@/config"


// const config: Ref<Config> = ref(globalConfig)
//生成链接额外配置信息
const formInfo = ref({
    password: "",
    maxAge: 86400000 * 30,
})
//自定义过期时间
const customMaxAge = ref(false);
//当前选中需要分享的节点信息
const allCheckedNodes: Ref<ApidocBanner[]> = ref([]);


//树形数据
const navTreeData = computed(() => {
    return store.state["apidoc/banner"].banner;
})

//=====================================生成链接====================================//
const projectInfo = computed(() => store.state["apidoc/baseInfo"] ) //项目基本信息
const configShare: Ref<{ enabled: boolean } | null> = ref(null); //配置组件实例
const projectId = router.currentRoute.value.query.id as string; //项目id
const loading = ref(false); //生成在线链接加载
const shareLink = ref(""); //在线链接地址

//生成在线链接
const handleGenerateLink = () => {
    const enableCustomExport = configShare.value?.enabled;
    const customExportIsEmpty = allCheckedNodes.value.length === 0;
    if (enableCustomExport && customExportIsEmpty) { //允许自定义分享并且数据为空
        ElMessage.warning("请至少选择一个文档分享");
        return;
    }
    loading.value = true;
    const { maxAge, password } = formInfo.value; //默认一个月过期
    const selectedIds = allCheckedNodes.value.map((val) => val._id);
    const expire = Date.now() + maxAge;
    const params = {
        projectId,
        maxAge,
        password,
        selectedDocs: selectedIds,
    };
    axios.post("/api/project/export/online", params).then((res) => {
        const shareId = res.data;
        const { projectName } = projectInfo.value;
        shareLink.value = `${config.renderConfig.share.baseUrl}/#/?shareId=${shareId}&projectName=${projectName}&expire=${expire}`;
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
}
//=====================================其他操作====================================//
const docTree: Ref<TreeNodeOptions["store"] | null> = ref(null);
//节点选中状态改变时候
const handleCheckChange = () => {
    const checkedNodes = docTree.value?.getCheckedNodes() || [];
    const halfCheckedNodes = docTree.value?.getHalfCheckedNodes() || [];
    allCheckedNodes.value = checkedNodes.concat(halfCheckedNodes) as ApidocBanner[];
}
//格式化展示
const formatTooltip = (val: number) => {
    return `${val / 86400000}天后`;
}
</script>

<style lang="scss">
.online-link {
    overflow-y: auto;
    height: calc(100vh - #{size(100)});
    width: 100%;
    .link-wrap {
        width: 70%;
        min-width: size(768);
        margin: 0 auto;
        .link {
            height: size(28);
            white-space: nowrap;
            overflow-y: auto;
            user-select: auto;
            &::-webkit-scrollbar {
                height: 0px;
            }
        }
        .link-icon {
            width: size(120);
            height: size(120);
        }
    }
    .doc-nav {
        .custom-tree-node {
            @include custom-tree-node;
        }
    }
}
</style>
