/*
    创建者：shuxiaokai
    创建时间：2021-01-16 21:59
    模块名称：返回参数
    备注：xxxx
*/
<template>
    <div class="response-wrap">
        <s-collapse-card v-for="(item, index) in responseParams" :key="index">
            <s-params-tree 
                ref="paramsTree"
                :tree-data="item.values"
                nest
                :mind-params="mindParams.mindRequestParams"
                showCheckbox
            >
            </s-params-tree>
            <div slot="head" class="h-100 d-flex a-center">
                <span v-if="!item._isEdit" class="edit-title">{{ item.title }}</span>
                <input 
                    v-else 
                    v-model="item._title" 
                    :ref="'editInput' + index" 
                    class="edit-input" 
                    :class="{active: item._title.length === 0}"
                    type="text" 
                    @click.stop="() => {}" 
                    @keydown.enter="handleConfirmHead(item)"
                    @blur="handleBlur(item)">
                <span v-if="item._isEdit" class="ml-1 cursor-pointer theme-color" @click="handleConfirmHead(item)">确定</span>
                <span v-if="item._isEdit" class="ml-1 cursor-pointer theme-color" @click="handleCancelEditHead(item)">取消</span>
                <span v-if="index !== 0 && !item._isEdit" title="修改名称" class="edit-icon el-icon-edit" @click.stop="handleEditHead(item, index)"></span>
            </div>
            <div slot="tail" class="d-flex">
                <div v-if="index === 0" class="green cursor-pointer" @click="handleAddResponse">新增</div>
                <div v-if="index !== 0" class="red cursor-pointer" @click="handleDeleteResponse(index)">删除</div>
            </div>
        </s-collapse-card>        
    </div>

</template>

<script>
import mixin from "../../mixin" //公用数据和函数
export default {
    mixins: [mixin],
    computed: {
        responseParams: { //请求参数
            get(){
                return this.$store.state.apidoc.apidocInfo?.item?.responseParams;
            },
            set(val) {
                this.$store.commit("apidoc/changeResponse", val);
            }
        },
        mindParams() { //联想参数
            return this.$store.state.apidoc.mindParams;
        },
    },
    data() {
        return {

        };
    },
    created() {
        // document.documentElement.addEventListener("click", () => {
        //     this.responseParams.forEach(res => {
        //         this.$set(res, "_isEdit", false)
        //     })
        // })
    },
    methods: {
        //=====================================获取远程数据==================================//

        //=====================================前后端交互====================================//
        
        //=====================================组件间交互====================================//  
        //新增一个返回参数
        handleAddResponse() {
            if (this.responseParams.length > 3) {
                this.$message.warning("返回参数数量不超过3个")
                return;
            }
            const response = {
                title: "自定义返回参数",
                statusCode: 200,
                values: [this.generateProperty()],
            }
            this.$store.commit("apidoc/addResponse", response);
        },
        //删除一个返回
        handleDeleteResponse(index) {
            this.$store.commit("apidoc/deleteResponse", index);
        },
        //编辑head
        handleEditHead(item, index) {
            this.$set(item, "_isEdit", true);
            this.$set(item, "_title", item.title);
            this.$nextTick(() => {
                this.$refs[`editInput${index}`][0].focus();
            })
        },
        //取消编辑
        handleCancelEditHead(item) {
            item._title = item.title;
            item._isEdit = false;
        },
        //确认保存编辑
        handleConfirmHead(item) {
            if (item._title.length === 0) {
                item._title = item.title;
                item._isEdit = false;
                return
            }
            item.title = item._title;
            item._isEdit = false;
        },
        //blur
        handleBlur(item) {
            if (item._title.length === 0) {
                item._title = item.title;
                item._isEdit = false;
                return
            }
        },
        //=====================================其他操作=====================================//

    }
};
</script>



<style lang="scss">
.response-wrap {
    .edit-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        cursor: pointer;
        width: size(40);
        &:hover {
            color: $theme-color;
        }
    }
    .edit-title {
        border: 1px solid transparent;
    }
    .edit-input {
        border: 1px solid $gray-600;
        font-size: fz(14);
        height: size(20);
        line-height: size(20);
        &.active {
            border: 1px solid $red;
        }
    }
}
</style>
