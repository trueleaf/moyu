/*
    创建者：shuxiaokai
    创建时间：2021-08-17 21:28
    模块名称：域名、服务器地址、环境维护
    备注：
*/
<template>
    <s-dialog :model-value="modelValue" top="10vh" width="70%" title="域名、服务器地址、环境维护" @close="handleClose">
        <div class="host-wrap">
            <s-resize-x :min="400" :max="600" :width="400" name="curd-host" tabindex="1" class="add-host">
                <s-fieldset title="符合规范的服务器地址组成">
                    <ul>
                        <li class="mb-2">
                            <div class="mb-1">ip地址+路径(可选)</div>
                            <div class="gray-600">
                                <span>例如:</span>
                                <span class="ml-1">http://127.0.0.199:81</span>
                                <el-divider direction="vertical"></el-divider>
                                <span>http://127.0.0.199:81/api</span>
                            </div>
                        </li>
                        <li>
                            <div class="mb-1">域名+路径(可选)</div>
                            <div class="gray-600">
                                <span>例如:</span>
                                <span class="ml-1">www.demo.com</span>
                                <el-divider direction="vertical"></el-divider>
                                <span>www.demo.com/api</span>
                            </div>
                        </li>
                    </ul>
                </s-fieldset>
                <el-form ref="form" :model="formInfo" :rules="rules" label-width="120px" class="mt-2">
                    <el-form-item label="服务器名称：" prop="name">
                        <el-input v-model="formInfo.name" size="mini" placeholder="例如：张三本地" class="w-100" maxlength="8" clearable show-word-limit></el-input>
                    </el-form-item>
                    <el-form-item label="服务器地址：" prop="server">
                        <el-input v-model="formInfo.server" name="name" size="mini" placeholder="服务器地址+请求地址" class="w-100" maxlength="100" clearable>
                            <template #prepend>
                                <el-select v-model="formInfo.protocol" class="w-100px" size="mini">
                                    <el-option value="http://" label="http://"></el-option>
                                    <el-option value="https://" label="https://"></el-option>
                                </el-select>
                            </template>
                        </el-input>
                    </el-form-item>
                    <div class="mb-2 bg-gray-200 h-30px d-flex a-center">{{ formInfo.protocol + formInfo.server }}</div>
                    <div class="d-flex j-end">
                        <!-- <el-button v-success="successLoading" :loading="loading" type="primary" size="mini" @click="handleAddHost">确认添加</el-button> -->
                    </div>
                </el-form>
            </s-resize-x>
            <div>
                bbb
            </div>
        </div>
        <template #footer>
            <el-button size="mini" type="warning" @click="handleClose">关闭</el-button>
        </template>
    </s-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue"],
    data() {
        const validateHost = (rule: string, value: string, callback: (err?: Error) => void) => {
            const ipReg = /^((\d|[1-9]\d|1\d{2}|2[0-5]{2})\.){3}(\d|[1-9]\d|1\d{2}|2[0-5]{2})(:\d{2,5})?(\/.+)?$/; //ip+端口(端口不必填)
            const dominReg = /^[a-zA-Z0-9-_.]+\.[a-zA-Z]+(\/.+)?$/;
            if (value === "") {
                callback(new Error("不能为空"));
            } else if (!value.match(ipReg) && !value.match(dominReg)) {
                callback(new Error("服务器地址不符合规范"))
            } else {
                callback();
            }
        }
        return {
            //=====================================表单及表单验证====================================//
            formInfo: {
                name: "", //-------------------服务器名称
                protocol: "http://", //--------协议
                server: "", //-----------------服务器url
            },
            rules: {
                name: [{ required: true, message: "请输入服务器名称", trigger: "blur" }],
                server: [
                    { required: true, validator: validateHost, trigger: "blur" },
                ],
            },
        };
    },
    methods: {
        //关闭弹窗
        handleClose() {
            this.$emit("update:modelValue", false);
        },
    },
})
</script>

<style lang="scss">
.host-wrap {
    display: flex;
    .add-host {
        padding-right: size(10);
        margin-right: size(10);
        border-right: 1px solid $gray-400;
    }
}
</style>
