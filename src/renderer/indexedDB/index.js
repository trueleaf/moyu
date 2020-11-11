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
                const db = event.target.result;
                //创建文档详情
                if (!db.objectStoreNames.contains("user")) {
                    objectStore = db.createObjectStore("user", {
                        autoIncrement: true,
                    });
                }
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
    read(key) {
        return new Promise((resolve, reject) => {
            const request = this.dbInstance
                .transaction(["user"])
                .objectStore("user")
                .get(key);

            request.onsuccess = function(event) {
                resolve(event);
            };

            request.onerror = function(event) {
                reject(event)
            };
        });
    }
}

export default MyIndexedDB;
