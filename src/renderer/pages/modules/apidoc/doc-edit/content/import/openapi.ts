// /*
// |--------------------------------------------------------------------------
// | 转换swagger，openapi格式数据
// |--------------------------------------------------------------------------
// | jsonSchema     https://json-schema.org/
// | openapi        https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
// | swaggerEditor  https://editor.swagger.io/
// |
// */

// import { uuid } from "@/helper/index"
// const TYPE_ENUM = { //参数类型映射
//     integer: "number",
//     long: "number",
//     float: "number",
//     double: "number",
//     number: "number",
//     string: "string",
//     byte: "string",
//     binary: "string",
//     boolean: "boolean",
//     date: "string",
//     dateTime: "string",
//     object: "object",
//     array: "array",
// };
// const VALID_CONTENT_TYPE = { //能够解析的contentType类型
//     "application/json": "application/json",
//     "application/x-www-form-urlencoded": "application/x-www-form-urlencoded",
//     "multipart/form-data": "multipart/form-data",
// }

// class OpenApiTranslate {
//     public projectId: string;
//     public openApiData: null;
//     public projectId: string;

//     constructor(projectId: string) {
//         this.projectId = projectId; //项目id
//         this.openApiData = null; //openapi数据
//         this.moyuProjectInfo = {}; //转换后符合规范的数据
//         this.config = {}; //配置信息
//     }
// }