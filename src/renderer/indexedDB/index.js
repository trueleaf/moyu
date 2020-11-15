/**
 * @description        indexedDB数据库封装
 * @author              shuxiaokai
 * @create             2020-11-13 15:50
 */

import config from "@/../config";

class MyIndexedDB {
    constructor() {
        this.dbInstance = null;
        this.dbName = config.renderConfig.indexedDB.dbName;
        this.dbVersion = config.renderConfig.indexedDB.version;
    }
    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            //错误处理
            request.onerror = (event) => {
                reject(event)
            };
            //打开数据库成功
            request.onsuccess = (event) => {
                this.dbInstance = event.target.result;
                resolve(event);
            };
            //数据库升级，或者第一次创建
            request.onupgradeneeded = (event) => {
                //创建文档详情
                const db = event.target.result;
                db.createObjectStore("apidoc_doc", { keyPath: "id" });
            };
        })

    }
    create(collection, value) {
        return new Promise((resolve, reject) => {
            const request = this.dbInstance
                .transaction([collection], "readwrite")
                .objectStore(collection)
                .add(value);

            request.onsuccess = function(event) {
                resolve(event);
            };

            request.onerror = function(event) {
                reject(event)
            };
        });
    }
    findById(collection, id) {
        return new Promise((resolve, reject) => {
            const objectStore = this.dbInstance.transaction([collection]).objectStore(collection);
            const request = objectStore.get(id);
            request.onsuccess = function(event) {
                resolve(event.target.result);
            };
            request.onerror = function(event) {
                reject(event)
            };
        });
    }


    async findByIdAndUpdate(collection, id, update) {
        if (!id || !update) {
            throw new Error("缺少id和update")
        }   
        const storeInfo = await navigator.storage.estimate();
        if (storeInfo.usage > 1024 * 1024 * 500) {
            alert(`您的本地存储数据大小已经超过${(storeInfo.usage/1024/1024).toFixed(1)}MB`)
        }
        return new Promise((resolve, reject) => {
            const objectStore = this.dbInstance .transaction([collection], "readwrite").objectStore(collection)
            const request = objectStore.get(id)
            request.onsuccess = function(event) {
                let data = event.target.result;
                // 更新你想修改的数据
                data = {
                    id,
                    ...update
                };
                // 把更新过的对象放回数据库
                const requestUpdate = objectStore.put(data);
                requestUpdate.onerror = function(event) {
                    reject(event)
                };
                requestUpdate.onsuccess = function(event) {
                    resolve(event);
                };
               
            };

            request.onerror = function(event) {
                reject(event)
            };
        });
    }
}

export default MyIndexedDB;
