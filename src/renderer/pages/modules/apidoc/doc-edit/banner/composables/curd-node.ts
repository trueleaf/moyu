/**
 * 删除节点
 */

import { Ref } from "vue"
import type { ApidocBanner, Response } from "@@/global"
import { findNodeById, forEachForest, flatTree, uniqueByKey } from "@/helper/index"
import { ElMessageBox } from "element-plus"
import { store } from "@/store/index"
import { router } from "@/router/index"
import { axios } from "@/api/api"

type MapId = {
    oldId: string, //历史id
    newId: string, //新id
    oldPid: string, //历史pid
    newPid: string, //新pid
};
/**
 * 删除某个(多个)节点
 */
export function deleteNode(selectNodes: ApidocBanner[], silent?: boolean): void {
    const { banner } = store.state["apidoc/banner"];
    const projectId = router.currentRoute.value.query.id;
    const deleteIds: string[] = [];
    selectNodes.forEach((node) => {
        deleteIds.push(node._id); //删除自己
        if (node.isFolder) { //如果是文件夹则删除所有子元素
            forEachForest(node.children, (item) => {
                if (!deleteIds.find((id) => id === item._id)) {
                    deleteIds.push(item._id);
                }
            });
        }        
    })
    const deleteTip = selectNodes.length > 1 ? `确定批量删除 ${deleteIds.length} 个节点?` : `确定删除 ${selectNodes[0].name} 节点`
    const deleteOperation = () => {
        const params = {
            data: {
                projectId,
                ids: deleteIds,
            },
        };
        axios.delete("/api/project/doc", params).then(() => {
            selectNodes.forEach((node) => {
                const deletePid = node.pid;
                if (!deletePid) { //不存在pid代表在根元素删除
                    const delIndex = banner.findIndex((val) => val._id === node._id);
                    store.commit("apidoc/banner/splice", {
                        start: delIndex,
                        deleteCount: 1,
                    })
                } else {
                    const parentNode = findNodeById(banner, node.pid, {
                        idKey: "_id",
                    });
                    const delIndex = parentNode?.children.findIndex((val) => val._id === node._id);
                    store.commit("apidoc/banner/splice", {
                        start: delIndex,
                        deleteCount: 1,
                        opData: parentNode?.children,
                    })
                }                    
            })
        }).catch((err) => {
            console.error(err);
        });        
    }
    if (silent) { //不提示用户删除，静默删除
        deleteOperation();
        return;
    }
    ElMessageBox.confirm(deleteTip, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
    }).then(() => {
        deleteOperation();
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
export function pasteNodes(currentOperationalNode: Ref<ApidocBanner | null>, pasteNodes: ApidocBanner[]): void {
    const flatNodes: ApidocBanner[] = [];
    pasteNodes.forEach((pasteNode) => {
        flatNodes.push(...flatTree(pasteNode))
    })
    const uniqueFlatNodes = uniqueByKey(flatNodes, "_id");
    const params = {
        projectId: router.currentRoute.value.query.id,
        mountedId: currentOperationalNode.value?._id,
        docs: uniqueFlatNodes.map((v) => ({
            _id: v._id,
            pid: v.pid,
        })),
    };
    axios.post<Response<MapId[]>, Response<MapId[]>>("/api/project/paste_docs", params).then((res) => {
        const mapIds = res.data;
        store.commit("apidoc/banner/changeBannerIdAndPid", mapIds);
        pasteNodes.forEach((pasteNode) => {
            pasteNode.pid = currentOperationalNode.value?._id || "";
            addFileAndFolderCb(currentOperationalNode, pasteNode);
        })
    }).catch((err) => {
        console.error(err);
    });
}

/**
 * 新增文件和文件夹回调
 */
export function addFileAndFolderCb(currentOperationalNode: Ref<ApidocBanner | null>, data: ApidocBanner): void {
    const { banner } = store.state["apidoc/banner"];
    if (currentOperationalNode.value) { //插入到某个节点下面
        if (data.type === "folder") {
            const lastFolderIndex = currentOperationalNode.value.children.findIndex((node) => !node.isFolder)
            if (lastFolderIndex === -1) {
                store.commit("apidoc/banner/splice", {
                    start: currentOperationalNode.value.children.length,
                    deleteCount: 0,
                    item: data,
                    opData: currentOperationalNode.value.children,
                })
            } else {
                store.commit("apidoc/banner/splice", {
                    start: lastFolderIndex,
                    deleteCount: 0,
                    item: data,
                    opData: currentOperationalNode.value.children,
                })
            }
        } else{ //如果是文本
            store.commit("apidoc/banner/splice", {
                start: currentOperationalNode.value.children.length,
                deleteCount: 0,
                item: data,
                opData: currentOperationalNode.value.children,
            });
        }
    } else { //插入到根节点
        if (data.type === "folder") {
            const lastFolderIndex = banner.findIndex((node) => !node.isFolder);
            if (lastFolderIndex === -1) {
                store.commit("apidoc/banner/splice", {
                    start: banner.length,
                    deleteCount: 0,
                    item: data,
                })
            } else {
                store.commit("apidoc/banner/splice", {
                    start: lastFolderIndex,
                    deleteCount: 0,
                    item: data,
                })
            }
        } else { //如果是文本
            store.commit("apidoc/banner/splice", {
                start: banner.length,
                deleteCount: 0,
                item: data,
            })
        }
    }
}

/**
 * 生成文件副本
 */
export function forkNode(currentOperationalNode: ApidocBanner): void {
    const projectId = router.currentRoute.value.query.id;
    const params = {
        _id: currentOperationalNode._id,
        projectId,
    };
    axios.post<Response<ApidocBanner>, Response<ApidocBanner>>("/api/project/copy_doc", params).then((res) => {
        console.log(res.data)
    }).catch((err) => {
        console.error(err);
    });
    console.log(currentOperationalNode)
}
