/*
    创建者：shuxiaokai
    创建时间：2019-08-24 12:15
    模块名称：xxxx
    备注：
*/
<template>
    <div class="s-img-wrap">
        <div v-for="(item, index) in previewList" :key="index" class="s-img-list" :style="{width: size + 'px', height: size + 'px'}">
            <img class="img" :src="item.src" :style="{width: size + 'px', height: size + 'px'}">
            <div class="list-shadow">
                <span class="list-op el-icon-zoom-in" title="预览" @click="viewFileList(item)"></span>
            </div>
        </div>
        <el-dialog title="预览" :visible.sync="showModel" width="50%">
            <s-file-viewer :url="currentFileUrl" :file-list="previewList.map(val => val.src)"></s-file-viewer>
        </el-dialog>
    </div>
</template>

<script>
import viewer from "./children/file-viewer.vue"
export default {
    components: {
        "s-file-viewer": viewer
    },
    props: {
        previewList: { //类型 [{srcs:xxx}]
            type: Array,
            default() {
                return [];
            }
        },
        size: { //图片展示的长宽
            type: Number,
            default: 170
        }
    },
    data() {
        return {
            currentFileUrl: "", //当前预览文件url
            showModel: false,
        };
    },
    created() {

    },
    methods: {
        viewFileList(item) {
            this.currentFileUrl = item.src;
            this.showModel = true;
        }
    }
};
</script>



<style lang="scss">
    .s-img-wrap {
        display: flex;
        flex-wrap: wrap;        
    }
    .s-img-list {
        border-radius: 5px;
        position: relative;
        margin-bottom: 10px;
        margin-right: 10px;
        .list-shadow {
            transition: opacity .3s;
            display: flex;
            position: absolute;
            left: 0;
            top: 0;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, .5);
            opacity: 0;
            border-radius: 5px;
            .list-op {
                display: inline-flex;
                width: 25px;
                height: 25px;
                font-size: 25px;
                margin-right: 10px;
                color: $white;
                cursor: pointer;
            }
        }
        &:hover {
            .list-shadow {
                opacity: 1;
            }
        }
    }
</style>
