/** 
 * @description        接口文档全局混入，所有公共方法必须引入mixin进行使用
 * @author             shuxiaokai
 * @create             2021-01-16 17:30
 */
export default {
    methods: {
        /** 
         * @description        生成参数
         * @author             shuxiaokai
         * @create             2021-01-16 17:33
         * @param {string=}    [type = 'string'] - 参数类型       
         * @return {property}}    返回参数
         * @remark
           interface Property {
               key:string, //参数key
               type:PropertyTypeEnum, //参数类型
               description:string, //参数描述
               value:string, //参数值
               required:boolean, //是否必填
               children:Array<Property>, //子参数
               _select:boolean, //是否被选中
           }
           enum PropertyTypeEnum { string, number, boolean, array, object, file }
         */
        generateProperty(type = "string") {
            return {
                id: this.$helper.uuid(),
                key: "",
                type, 
                description: "",
                value: "", 
                required: true,
                children: [],
                _select: true,
            }
        }
    },
}