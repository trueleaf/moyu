/**
 * web存储，提供接口文档离线使用能力
 */
import { axios } from "@/api/api"
import { Response, ResApiProjectList } from "@@/global";

type Api = {
    "/api/project/project_list": () => Promise<Response<ResApiProjectList>>,
    "b": () => number,
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
    b() {
        return 222;
    },
}
const cache = {
    /**
     * 获取数据信息
     */
    get<URL extends keyof Api>(url: URL): Api[URL] {
        const apiFn = api[url];
        return apiFn;
    }
}

// const foo = cache.get("/api/project/project_list")()
export default cache;
