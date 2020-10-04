

/* 
    @description  错误捕获并且上传
    @author        shuxiaokai
    @create       2019-07-07 13:20"
    
    一. 错误类型为uncatchError,一般出现于promise中的异常抛出，常规情况无法捕获，需要在window上面监听unhandledrejection事件进行处理，这类异常只上报相关堆栈信息
    二. 错误类型为http错误，一般出现于后台500，404，请求超时这种情况，在axios中走response拦截器，这时可以返回Promise.reject(err)将错误信息暴露到业务代码的then方法中
        这样做的目的是为了获取更多报错信息(路由信息，vm信息)，在err上面多挂上两个私有变量__time(请求时间),__isHttpError(是否为请求错误)，
    三. 错误类型为aaa

*/
import { BaseConfig } from "@/config.default"
/*eslint-disable*/ 



class Logs {
    constructor() {
        this.errorCatch = this.errorCatch.bind(this);
        this.httpCatch = this.httpCatch.bind(this);
        this.httpFailCatch = this.httpFailCatch.bind(this);
        this.langTimeCatch = this.langTimeCatch.bind(this);
        this.initUnHandledRejection();
    }
    /* 
        @description  封装http错误上报信息
        @author        shuxiaokai
        @create       2019-07-29 15:45"
    */
    async addHttpErrorPayload(err, time, route) {
        console.error(err)
    }

    /* 
        @description  添加代码错误上报信息
        @author        shuxiaokai
        @create       2019-07-29 16:28"
    */
    addCodeErrorPayload(err, vm) {
        console.error(err)
    }


    /* 
        @description  未捕获异常拦截(通常出现在promise中的抛错)
        @author        shuxiaokai
        @create       2019-07-09 14:10"
    */
    initUnHandledRejection() {
      
    }

    /* 
        @description  http错误拦截,拦截http状态码不为200的错误
        @author        shuxiaokai
        @create       2019-07-08 16:42"
    */
    httpCatch(err, time, vm) {
        console.error(err)
    }


    /* 
        @description  拦截http状态未ok，但是自定义状态码异常的请求
        @author        shuxiaokai
        @create       2019-07-29 11:36"
    */
    async httpFailCatch(err, time, route) {
        console.error(err)
    }

    /* 
        @description  时间过长请求拦截
        @author        shuxiaokai
        @create       2019-07-08 16:42"
        @params       
        @return       
    */
    langTimeCatch(err, time, route) {
        console.error(err)
    }
    /* 
        @description  代码错误捕获
        @author        shuxiaokai
        @create       2019-07-29 11:21"
        @params       
        @return       
    */
    errorCatch(err, vm, info) {
        console.error(err)
    }
}



export default Logs;

