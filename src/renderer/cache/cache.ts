/**
 * web存储，提供接口文档离线使用能力
 */
import { axios } from "@/api/api"
import { Response, ResApiProjectList } from "@@/global";
import "./database"

type Api = {
    /**
     * 获取项目列表数据
     */
    "/api/project/project_list": () => Promise<Response<ResApiProjectList>>,
}

const api: Api = {
    "/api/project/project_list"(): Promise<Response<ResApiProjectList>> {
        return new Promise((resolve, reject) => {
            axios.get<Response<ResApiProjectList>, Response<ResApiProjectList>>("/api/project/project_list").then((res) => {
                resolve(res);
            }).catch((err) => {
                console.error(err)
                reject(err)
            });
        })
    },
}

interface ICaceh {
    dbBase: IDBDatabase | null;
    get<URL extends keyof Api>(url: URL): ReturnType<Api[URL]>;
}

let singleton: null | ICaceh = null;
class Cache implements ICaceh {
    public dbBase: IDBDatabase | null = null;
    constructor() {
        if (!singleton) {
            singleton = this;
        } else {
            return singleton;
        }
    }

    /**
     * 获取数据信息
     */
    public get<URL extends keyof Api>(url: URL): ReturnType<Api[URL]> {
        const apiFn = api[url];
        return apiFn() as ReturnType<Api[URL]>;
    }
}

export default Cache;
