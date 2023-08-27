import { apidocGenerateProperty, uuid } from '@/helper'
import { ApidocProperty } from '@@/global';

//https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers
const standarHeaders = [{
  name: 'Accept',
  description: '用户代理期望的MIME 类型列表',
}, {
  name: 'Accept-Charset',
  description: '列出用户代理支持的字符集',
}, {
  name: 'Accept-Encoding',
  description: '列出用户代理支持的压缩方法',
}, {
  name: 'Accept-Language',
  description: '列出用户代理期望的页面语言',
}, {
  name: 'Access-Control-Allow-Credentials',
  description: '跨域头，是否允许携带凭证',
}, {
  name: 'Access-Control-Allow-Origin',
  description: '跨域头，允许跨域的origin',
}, {
  name: 'Access-Control-Allow-Methods',
  description: '跨域头，允许跨域的请求方法',
}, {
  name: 'Access-Control-Allow-Headers',
  description: '跨域头，允许客户端添加额外的HTTP请求头',
}, {
  name: 'Access-Control-Max-Age',
  description: '跨域头，多长时间内不再发送预请求',
}, {
  name: 'Access-Control-Expose-Headers',
  description: '跨域头，允许客户端获取的额外请求头',
}, {
  name: 'Accept',
  description: '用户代理期望的MIME 类型列表',
}, {
  name: 'Cookie',
  description: 'Cookie',
}]

const headers: ApidocProperty[] = [{
  _id: uuid(),
  key: 'Authorization',
  value: '',
  type: 'string',
  required: true,
  description: '服务器用于验证用户代理身份的凭证',
  select: true,
}]
standarHeaders.forEach(header => {
  const property = apidocGenerateProperty();
  property.key = header.name;
  property.description = header.description;
  headers.push(property)
})

export default headers
