/*
    创建者：shuxiaokai
    创建时间：2020-06-26 19:07
    模块名称：新增文档弹窗
    备注：xxxx
*/
<template>
    <s-dialog title="新建文档" :isShow="visible" width="40%" @close="handleClose">
        <el-form ref="form" :model="formInfo" :rules="rules" label-width="150px" @submit.native.prevent="handleAddFile">
            <el-form-item label="文档名称" prop="name">
                <el-input ref="nameInput" v-model="formInfo.name" size="mini" placeholder="请输入文件名称" class="w-100" maxlength="100" clearable></el-input>
            </el-form-item>
        </el-form> 
        <div slot="footer">
            <el-button :loading="loading" size="mini" type="primary" @click="handleAddFile">确定</el-button>
            <el-button size="mini" type="warning" @click="handleClose">取消</el-button>
        </div>
    </s-dialog>
</template>

<script>
export default {
    props: {
        visible: { //是否现实弹窗
            type: Boolean,
            default: false
        },
        pid: { //文档父id
            type: String,
            default: ""
        },
    },
    data() {
        return {
            formInfo: {
                name: "", //------文件名称
            }, 
            rules: {
                name: [{ required: true, message: "请输入文件名称", trigger: "blur" }]
            },
            //=====================================其他参数====================================//
            loading: false, //----确认按钮状态
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        //=====================================初始化页面====================================//
        init() {
            setTimeout(() => {
                console.log(this.$refs["nameInput"].focus())
            })
        },
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//

        //=====================================组件间交互====================================//  
        handleAddFile() {
            this.$refs["form"].validate((valid) => {
                if (valid) {
                    this.loading = true;
                    const params = {
                        docName: this.formInfo.name,
                        isFolder: false,
                        projectId: this.$route.query.id,
                        pid: this.pid,
                    };
                    this.axios.post("/api/project/new_doc", params).then((res) => {
                        this.$emit("success", res.data); //一定要先成功然后才关闭弹窗,因为关闭弹窗会清除节点父元素id
                        this.handleClose();
                    }).catch(err => {
                        this.$errorThrow(err, this);
                    }).finally(() => {
                        this.loading = false;
                    });
                } else {
                    this.$message.warning("请完善必填信息");
                    this.loading = false;
                }
            });
        },
        //=====================================其他操作=====================================//
        //关闭弹窗
        handleClose() {
            this.$emit("update:visible", false);
            this.$emit("close");
        },
    }
};
</script>



<style lang="scss">

</style>
