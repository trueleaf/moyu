/** 
 * @description        第三方api转换为摸鱼接口文档
 * @author             shuxiaokai
 * @create             2020-11-27 10:38
 * @param {string}     apiData - 第三方接口json格式数据       
 * @param {string}     type - 允许转换的第三方api类型      
 */
import store from "@/store"


class ApiTranslator {
    constructor(apiData, type, payload) {
        this.projectId = payload.projectId;
        this.apiData = apiData;
        this.type = type;
        this.contentTypeRules = store.state.apidocRules.contentType
    }
    /** 
     * @description        获取转换后结果
     * @author              shuxiaokai
     * @create             2020-11-27 13:40
     * @return {doc}       文档详情
     */
    getResult() {
        if (this.type === "openapi") { //openapi转换
            const version = this.apiData.openapi;
            if (!version || version.startsWith("3")) {
                console.warn("未检测到版本信息或者版本信息低于3，将默认按照3.0进行解析");
            }
        }
    }
    //解析openapi接口
    resolvingOepnapiPaths() {
        const paths = this.apiData.paths;
        // const paramsPosition = ["body"]; //参数传递方式
        for(const i in paths) {
            const queryPath = paths[i]; //请求路径
            for(const j in paths[i]) {
                const docInfo = this.generateDocInfo();
                const methods = j; //请求方法
                const apidoc = paths[i][j]; //文档数据
                const parameters = apidoc.parameters;
                docInfo.docName = apidoc.summary;
                docInfo.docType = "file";
                docInfo.sort = Date.now();
                docInfo.item.description = apidoc.description;
                docInfo.item.methods = methods;
                docInfo.item.url.path = queryPath;
                docInfo.item.requestType = this.contentTypeRules.find((val) => val.name === methods)?.enabledContenType[0];
                for(let i = 0; i < parameters.length; i++) { //请求参数处理
                    const params = parameters[i];
                    const paramsPosition = params.in;
                    console.log(paramsPosition)
                }
                
            }


        }

    }
    //生成标准接口文档
    generateDocInfo() {
        return {
            pid: "", //父元素id用于判断是否是目录
            docName: "", //文档名称
            docType: "", //文档类型 1.文件夹 2.普通文档 3.markdown文档
            isFolder: false, //是否是文件夹
            sort: 0, //排序，js时间戳保留到毫秒
            projectId: this.projectId, //项目id
            enabled: true, //使能
            publish: false, //是否发布   
            item: {
                description: "",
                methods: "",
                url: {
                    host: "",
                    path: ""
                },
                requestType: "",
                header: [],
                requestParams: [],
                responseParams: [],
                otherParams: []
            },
        }
    }

    /** 
     * @description        获取基础数据信息
     * @author              shuxiaokai
     * @create             2020-11-27 10:24
     * @return {object}    返回基础数据信息
     * @remark
     * 
     *   {
     *      pid: "", //父元素id用于判断是否是目录
     *      docName: "", //文档名称
     *      docType: "", //文档类型 1.文件夹 2.普通文档 3.markdown文档
     *      isFolder: true, //是否是文件夹
     *      sort： 122121212, //排序，js时间戳保留到毫秒
     *      projectId: "", //项目id
     *      enabled: true, //使能
     *      publish: false, //是否发布   
     *   }
     */
    getBaseInfo() {
        const baseInfo = {
            pid: "", //父元素id用于判断是否是目录
            docName: "", //文档名称
            docType: "", //文档类型 1.文件夹 2.普通文档 3.markdown文档
            isFolder: true, //是否是文件夹
            sort: 0, //排序，js时间戳保留到毫秒
            projectId: "", //项目id
            enabled: true, //使能
            publish: false, //是否发布   
        };
        if (this.type === "openapi") {
            const version = this.apiData.openapi;
            if (!version || version.startsWith("3")) {
                console.warn("未检测到版本信息或者版本信息低于3，将默认按照3.0进行解析");
            }
        }
        return baseInfo
    }
}

export default ApiTranslator;