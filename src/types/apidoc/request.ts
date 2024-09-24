import { ApidocHttpRequestMethod } from "../global";


export type ApidocRequest = {
  url: string, //请求url
  headers: Record<string, string>, //请求头
  method: ApidocHttpRequestMethod, //请求方法
  body: string | FormData, //请求body
};