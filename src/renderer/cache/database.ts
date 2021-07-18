/**
 * @description        数据库和数据表定义
 * @author             shuxiaokai
 * @create             2021-7-13 22:50
 */
import Dexie from "dexie";
import config from "@/../config/config";
// import { ResApiProjectList } from "@@/global"
type Demo = {
    id?: number,
    name: string,
    age: number,
}

class MoyuDataBase extends Dexie {
    public projectList: Dexie.Table<Demo, number>
    public constructor() {
        super("MoyuDataBase");
        this.version(config.renderConfig.indexedDB.version).stores({
            projectList: "++id, name, age"
        });
        this.projectList = this.table("projectList");
    }
}

const db = new MoyuDataBase();
db.transaction("rw", db.projectList, async () => {
    if ((await db.projectList.where({ name: "Josephine" }).count()) === 0) {
        await db.projectList.add({ name: "Josephine", age: 21 });
    }
    const result = await db.projectList.where("age").below(25).toArray();
    console.log(result)
}).catch((e) => {
    console.error(e);
});

export default db;
