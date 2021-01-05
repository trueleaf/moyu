
/*
* 参考：https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
*/ 



import data from "./data"


class OpenApiTranslate {

    constructor() {
        this.openApiData = data;
    }

    init() {
        console.log("openApi", this.openApiData);
        console.log("info", this.getInfo());
        console.log("servers", this.getServers());
        console.log("docs", this.getDocInfo());
    }
    /** 
     * @description        解析变量信息
     * @author              shuxiaokai
     * @create             2021-01-05 11:13
     * @param {Variable}   变量信息
     * @return             解析后变量信息   
     */
    getVariables() {

    }


    /** 
     * @description        获取接口文档元数据信息
     * @author             shuxiaokai
     * @create             2021-01-05 10:50
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#infoObject
     * @remark
     * 解析  title字段  description字段   version字段
     * @return  
     *   {
     *     title: String,
     *     description: String,
     *     version: String
     *   }
     */
    getInfo() {
        const openApiInfo = this.openApiData.info;
        if (!openApiInfo) {
            console.warn("缺少Info字段")
        }
        return {
            title: openApiInfo?.title || null,
            description: openApiInfo?.description || null,
            version: openApiInfo?.version || null,
        };
    }

    /** 
     * @description        获取服务器信息
     * @author             shuxiaokai
     * @create             2021-01-05 10:50
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#serverObject
     * @remark
     * 解析  url字段  description字段   variables字段
     * @return  
     *   [{
     *     url: String,
     *     description: String,
     *   }]
     */
    getServers() {
        const openApiServers = this.openApiData.servers;
        const result = [];
        if (!openApiServers) {
            console.warn("缺少servers字段");
            return result;
        }
        if (!Array.isArray(openApiServers)) {
            console.warn("servers字段必须为数组");
            return result;
        }
        openApiServers.forEach(server => {
            const variables = server.variables || {};
            const keys = Object.keys(variables);
            const varValue = keys.map(key => {
                return {
                    key,
                    value: variables[key].default
                }
            })
            const url = server.url.replace(/{([^{}]+)}/g, ($1, $2) => {
                const matched = varValue.find(val => val.key === $2) 
                return matched.value || $1
            })
            result.push({
                url,
                description: server.description
            });
        })
        return result;
    }
    /** 
     * @description        获取接口详情信息
     * @author             shuxiaokai
     * @create             2021-01-05 10:50
     * @refer              https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#pathItemObject
     * @remark
     * 
     * @return  
     *   
     */
    getDocInfo() {
        const openApiDocInfo = this.openApiData.paths;
        const result = [];
        if (!openApiDocInfo) {
            console.warn("缺少paths字段");
            return result;
        }
        for(let item in openApiDocInfo) {
            const element = openApiDocInfo[item];
            for(let doc in element) {
                console.log(doc)
            }
        }
        // openApiDocInfo.forEach(server => {
        //     const variables = server.variables || {};
        //     const keys = Object.keys(variables);
        //     const varValue = keys.map(key => {
        //         return {
        //             key,
        //             value: variables[key].default
        //         }
        //     })
        //     const url = server.url.replace(/{([^{}]+)}/g, ($1, $2) => {
        //         const matched = varValue.find(val => val.key === $2) 
        //         return matched.value || $1
        //     })
        //     result.push({
        //         url,
        //         description: server.description
        //     });
        // })
        return result;
    }

    generateDoc() {
        return {
            methods: "get", //---------------请求方式
            requestType: "params", //
            url: {
                host: "", //-----------------主机(服务器)地址
                path: "", //-----------------接口路径
            }, //----------------------------请求地址信息
            requestParams: [],
            responseParams: [],
            header: [], //-------------------请求头信息
            description: "", //--------------请求描述
        }
    }


}
export default OpenApiTranslate;