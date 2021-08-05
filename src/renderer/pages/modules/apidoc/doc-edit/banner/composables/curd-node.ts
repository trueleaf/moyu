/**
 * 删除节点
 */

import { Ref } from "vue"
import type { ApidocBanner } from "@@/global"
import { findNodeById, forEachForest } from "@/helper/index"
import { ElMessageBox } from "element-plus"
import { store } from "@/store/index"
import { router } from "@/router/index"
import { axios } from "@/api/api"
import { flatTree, uniqueByKey } from "@/helper/index"

/**
 * 删除某个节点
 */
export function deleteNode(currentOperationalNode: Ref<ApidocBanner | null>): void {
    if (!currentOperationalNode.value) {
        console.warn("被删除节点不存在");
        return;
    }
    const { banner } = store.state["apidoc/banner"];
    const deletePid =  currentOperationalNode.value.pid;
    const projectId = router.currentRoute.value.query.id;
    const deleteIds = [currentOperationalNode.value._id]; //删除自己
    if (currentOperationalNode.value.isFolder) { //如果是文件夹则删除所有子元素
        forEachForest(currentOperationalNode.value.children, (item) => {
            deleteIds.push(item._id);
        });
    }
    ElMessageBox.confirm(`此操作将永久删除 ${currentOperationalNode.value.name} 节点, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        const params = {
            data: {
                projectId,
                ids: deleteIds,
            },
        };
        axios.delete("/api/project/doc", params).then(() => {
            if (!deletePid) { //不存在pid代表在根元素删除
                const delIndex = banner.findIndex((val) => val._id === currentOperationalNode.value?._id);
                store.commit("apidoc/banner/splice", {
                    start: delIndex,
                    deleteCount: 1,
                })
            } else {
                const parentNode = findNodeById(banner, currentOperationalNode.value?.pid as string, {
                    idKey: "_id",
                });
                const delIndex = parentNode?.children.findIndex((val) => val._id === currentOperationalNode.value?._id);
                store.commit("apidoc/banner/splice", {
                    start: delIndex,
                    deleteCount: 1,
                    opData: parentNode?.children,
                })
            }
            // console.log(findParentById())
            // const pNode = node.parent;
            // if (pNode && pNode.level !== 0) {
            //     const nodeIndex = pNode.data.children.findIndex((val) => val._id === data._id);
            //     pNode.data.children.splice(nodeIndex, 1)
            // } else {
            //     const nodeIndex = this.navTreeData.findIndex((val) => val._id === data._id);
            //     this.navTreeData.splice(nodeIndex, 1);
            // }
            // this.handleDeleteTabsById(deleteIds);
        }).catch((err) => {
            console.error(err);
        });
    }).catch((err) => {
        if (err === "cancel" || err === "close") {
            return;
        }
        console.error(err);
    });
}

/**
 * 粘贴某个节点
 * 转换逻辑如下
 * 1. 将所有嵌套数据取出变为扁平一维数组
 * 2. 根据_id去重所有节点
 * 3. 从去重数据中寻找无父元素的节点(pid在数组中无_id对应)
 * 4. 将这些
 */
export function pasteNode(currentOperationalNode: Ref<ApidocBanner | null>, pasteNode: ApidocBanner): void {
    console.log(currentOperationalNode.value, pasteNode)
    const flatNodes = flatTree(pasteNode);
    const uniqueFlatNodes = uniqueByKey(flatNodes, "_id");
    // console.log(uniqueFlatNodes)
    // pasteNode.pid = currentOperationalNode.value?._id || "";
    // if (currentOperationalNode.value) { //粘贴到某个文件夹
    //     store.commit("apidoc/banner/splice", {
    //         opData: currentOperationalNode.value.children,
    //         start: 0,
    //         deleteItem: pasteNode,
    //     })
    // }
    const params = {
        projectId: router.currentRoute.value.query.id,
        mountedId: currentOperationalNode.value?._id,
        docs: uniqueFlatNodes.map((v) => ({
            _id: v._id,
            pid: v.pid,
        })),
    };
    axios.post("/api/project/paste_docs", params).then((res) => {
        console.log(res.data)
    }).catch((err) => {
        console.error(err);
    });
    // const mountedId = currentOperationalNode.value?._id; //挂载点id
    // const projectId = router.currentRoute.value.query.id;
}


/**
 * 新增文件和文件夹回调
 */
export function addFileAndFolderCb(currentOperationalNode: Ref<ApidocBanner | null>, data: ApidocBanner): void {
    const { banner } = store.state["apidoc/banner"];
    if (currentOperationalNode.value) { //插入到某个节点下面
        if (data.type === "folder") {
            const lastFolderIndex = currentOperationalNode.value.children.findIndex((node) => !node.isFolder)
            if (lastFolderIndex !== -1) {
                store.commit("apidoc/banner/splice", {
                    start: currentOperationalNode.value.children.length,
                    deleteCount: 0,
                    deleteItem: data,
                })
            } else {
                store.commit("apidoc/banner/splice", {
                    start: currentOperationalNode.value.children.length,
                    deleteCount: 0,
                    deleteItem: data,
                })
            }
        } else{ //如果是文本
            store.commit("apidoc/banner/splice", {
                start: currentOperationalNode.value.children.length,
                deleteCount: 0,
                deleteItem: data,
                opData: currentOperationalNode.value.children,
            });
        }
    } else { //插入到根节点
        if (data.type === "folder") {
            const lastFolderIndex = banner.findIndex((node) => !node.isFolder)
            if (lastFolderIndex !== -1) {
                store.commit("apidoc/banner/splice", {
                    start: banner.length,
                    deleteCount: 0,
                    deleteItem: data,
                })
            } else {
                store.commit("apidoc/banner/splice", {
                    start: banner.length,
                    deleteCount: 0,
                    deleteItem: data,
                })
            }
        } else { //如果是文本
            store.commit("apidoc/banner/splice", {
                start: banner.length,
                deleteCount: 0,
                deleteItem: data,
            })
        }
    }
}