
/** 
 * @description        文档编辑相关信息
 * @author             shuxiaokai
 * @updateAuthor       shuxiaokai
 * @create             2020-01-09 18:39
 * @update             2020-01-09 18:39
 */
import http from "@/api/api.js"
import { recursion } from "@/lib/index"
const { axios } = http;

export default {
    state: {
        rowDocBanner: [],
        isEditing: false, //是否处于编辑状态
        defaultExpandKeys: [], 
    },
    mutations: {
        //更新编辑状态
        changeEditingState(state, payload) {
            state.isEditing = payload;
        },
        //改变文档导航菜单
        changeDocBanner(state, payload) {
            state.rowDocBanner = payload;
        },
    },
    actions: {
        async getDocBanner(context, payload) {
            const params = {
                _id: payload._id
            };
            axios.get("/api/project/doc_tree_node", { params }).then(res => {
                const result = res.data;
                recursion({
                    data: result,
                    before: (val) => {
                        val.id = val._id;
                        val.isRemoteData = true; //是否为远程返回数据
                        val.label = val.docName;
                        val.__isNew = false;
                        delete val.docName;
                        val.nodeType = val.isFolder ? "folder" : "file";
                        if (!val.children) {
                            val.children = []
                        }
                    },
                    condition: (val) => {
                        return val.children && val.children.length > 0;
                    },
                    next: (val) => {
                        return val.children
                    }
                });
                context.commit("changeDocBanner", result);
            }).catch(err => {
                console.error(err);
            });
        }
    },
};
