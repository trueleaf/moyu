/*
    创建者：shuxiaokai
    创建时间：2020-10-13 13:08
    模块名称：server(域名)维护
    备注：xxxx
*/
<template>
    <div class="mb-2">
        <el-radio-group :value="value" @input="handleInput" size="mini">
            <el-popover placement="top-start" trigger="hover" :close-delay="0" :content="mockServer" class="mr-2">
                <el-radio slot="reference" :label="mockServer" border>mock服务器</el-radio>
            </el-popover>
            <el-popover v-for="(item, index) in hostEnum" :key="index" :close-delay="0" placement="top-start" trigger="hover" :content="item.url" class="mr-2">
                <el-radio slot="reference" :label="item.url" border>{{ item.name }}</el-radio>
            </el-popover>
        </el-radio-group>
        <el-button type="text" size="small" @click="dialogVisible = true;">域名维护</el-button>
        <s-host-manage v-if="dialogVisible" :visible.sync="dialogVisible" @change="getHostEnum"></s-host-manage>
    </div>
</template>

<script>
import hostManage from "../dialog/host-manage"
export default {
    components: {
        "s-host-manage": hostManage,
    },
    props: {
        value: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            mockServer: "", //-------------------mock服务器
            hostEnum: [], //---------------------域名列表
            dialogVisible: false, //-------------域名维护弹窗
        };
    },
    created() {
        this.getHostEnum(); //获取host枚举值
    },
    methods: {
        //=====================================获取远程数据==================================//
        //获取host枚举值
        getHostEnum() {
            const params = {
                projectId: this.$route.query.id,
            };
            this.axios.get("/api/project/doc_service", { params }).then(res => {
                this.hostEnum = res.data;
            }).catch(err => {
                console.error(err);
            })
        },
        //=====================================前后端交互====================================//
        handleInput(value) {
            this.$emit("input", value)
        },
        //=====================================组件间交互====================================//  
        
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">

</style>
