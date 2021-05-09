/*
    创建者：shuxiaokai
    创建时间：2020-10-13 13:08
    模块名称：server(域名)维护
    备注：xxxx
*/
<template>
    <div class="s-host mb-2">
        <el-radio-group v-model="host" size="mini" @change="handleChangeServer">
            <el-popover placement="top-start" trigger="hover" :open-delay="600" :content="mockServer" class="mr-2">
                <el-radio slot="reference" :label="mockServer" border>Mock服务器</el-radio>
            </el-popover>
            <el-popover v-for="(item, index) in hostEnum" :key="index" :open-delay="600" placement="top-start" trigger="hover" :content="item.url" class="mr-2">
                <el-radio slot="reference" :label="item.url" border>{{ item.name }}</el-radio>
            </el-popover>
        </el-radio-group>
        <el-button type="text" size="small" @click="dialogVisible = true;">地址维护</el-button>
        <!-- <div class="tag-wrap">
            <el-select v-model="currentTag" :size="config.renderConfig.layout.size" placeholder="选择标签">
                <el-option
                    v-for="(item, index) in tagsEnum"
                    :key="index"
                    :label="item.name"
                    :value="item.name"
                >
                    <span>{{ item.name }}</span>
                </el-option>
            </el-select>
        </div> -->
        <s-host-manage v-if="dialogVisible" :visible.sync="dialogVisible" @change="getHostEnum"></s-host-manage>
    </div>
</template>

<script>
import config from "@/../config/index"
import hostManage from "@/pages/modules/apidoc/doc-edit/dialog/host-manage.vue"

export default {
    components: {
        "s-host-manage": hostManage,
    },
    props: {
        request: {
            type: Object,
            default() {
                return {}
            },
        },
    },
    data() {
        return {
            mockServer: `http://${config.renderConfig.mock.ip}:${config.renderConfig.mock.port}`, //-------------------mock服务器
            dialogVisible: false, //-------------域名维护弹窗
        };
    },
    computed: {
        currentSelectDoc() { //当前选中的doc
            return this.$store.state.apidoc.activeDoc[this.$route.query.id];
        },
        hostEnum: {
            get() {
                return this.$store.state.apidoc.hostEnum;
            },
            set(val) {
                this.$store.commit("apidoc/initAndChangeHostEnum", val);
            },
        },
        host: { //host信息
            get() {
                return this.$store.state.apidoc.apidocInfo?.item?.url.host;
            },
            set(val) {
                this.$store.commit("apidoc/changeDocHost", val);
            },
        },
    },
    created() {
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取host枚举值
        getHostEnum() {
            const params = {
                projectId: this.$route.query.id,
            };
            this.axios.get("/api/project/doc_service", { params }).then((res) => {
                this.hostEnum = res.data;
            }).catch((err) => {
                console.error(err);
            })
        },
        //改变server
        handleChangeServer(val) {
            let localServer = localStorage.getItem("apidoc/server") || "{}";
            localServer = JSON.parse(localServer);
            if (!localServer[this.$route.query.id]) {
                localServer[this.$route.query.id] = "";
            }
            if (val !== "") {
                localServer[this.$route.query.id] = val;
                localStorage.setItem("apidoc/server", JSON.stringify(localServer));
            }
        },
        //=====================================前后端交互====================================//
        //=====================================其他操作=====================================//
    },
};
</script>

<style lang="scss">
.s-host {
    width: 100%;
    display: flex;
}
</style>
