<div align="center" width="130px" height="130px">
    <img src="http://jobtool.cn/imgs/logo.png" alt="logo"/>
</div>
<h1 align="center">摸鱼(客户端)</h1>
<h3 align="center">一款基于 Vue 和 Electron 的接口文档管理工具</h3>
<div align="center">

[下载](https://github.com/shuxiaokai3/jobtool-electron/releases) | [完整文档](https://www.yuque.com/shuxiaokai/moyu) | [在线体验](http://47.107.70.26/jobtool)

</div>
<div align="center">
  <a href="https://github.com/shuxiaokai3/jobtool-electron/releases/latest">
    <img src="https://img.shields.io/github/v/release/shuxiaokai3/jobtool-electron?style=flat-square" alt="">
  </a>

  <a href="https://github.com/shuxiaokai3/jobtool-electron/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/shuxiaokai3/jobtool-electron" alt="LICENSE">
  </a>

  <a href="https://github.com/shuxiaokai3/jobtool-electron/releases/latest">
    <img alt="GitHub All Releases" src="https://img.shields.io/github/downloads/shuxiaokai3/jobtool-electron/total">
  </a>
</div>

## 预览
<div align="center">
    <img src="http://jobtool.cn/imgs/a.png" alt="logo"/>
</div>
<div align="center">
    <img src="http://jobtool.cn/imgs/c.png" alt="logo"/>
</div>
<div align="center">
    <img src="http://jobtool.cn/imgs/b.png" alt="logo"/>
</div>

## 常用
[客户端GitHub地址](https://github.com/trueleaf/moyu)

[服务端GitHub地址](https://github.com/trueleaf/moyu-server)

[客户端Gitee地址](https://gitee.com/shuzhikai/moyu)

[服务端Gitee地址](https://gitee.com/shuzhikai/moyu-server)

[客户端下载](https://github.com/shuxiaokai3/jobtool-electron/releases)

[完整文档](https://www.yuque.com/shuxiaokai/moyu) 

[在线体验](http://47.107.70.26/jobtool)(由于浏览器限制，完整版功能需要下载客户端)

## QQ交流群

3073155898 欢迎加入
## 主要功能
1. 团队协作
2. 自定义接口规则
3. 支持常见请求方式
4. 本地内网发送接口(类似postman)
5. 优雅的离线版本导出
6. 细粒度的权限管理
7. 尽可能的提高录入接口效率
8. 开源免费，内网部署安全有保障

## 部署&二次开发

### 环境要求
* nodejs(10+)
* mongodb(2.6+)
* nginx(任意web服务器，可选)

### 主要技术栈
* Vue
* Electron
* Egg.js
* ElementUI
* MongoDB

### 客户端部署
> 请确保已经安装MongoDB和Node.js
```bash
git clone https://github.com/trueleaf/moyu.git
cd moyu
npm install # 国内推荐使用cnpm进行安装
# 运行不同命令
npm run dev # 以开发模式启动项目
npm run build # 打包项目，会生成相应的安装包
npm run build:web # 仅打包web版本
```
你可以通过修改配置文件来进行一些简单的自定义，配置文件路径为 `/src/config/config.default.js`

```js
module.exports = {
    //更新相关配置
    updateConfig: {
        version: "", //当前项目版本
        server: "", //更新服务器地址
        filePath: "", //更新文件地址
    },
    //渲染进程配置
    renderConfig: {
        //布局相关
        layout: {
            title: "", //项目标题
            size: "", //项目中组件库大小
        },
        //http请求相关
        httpRequest: {
            url: isDev ? "" : "", //后端请求url
            imgUrl: isDev ? "" : "", //图片请求url
            timeout: 20000, //请求超时时间
            withCredentials: true, //是否携带cookie
            whiteList: ["/login"], //前端路由白名单，白名单内路由不做权限校验
        },
        //全局组件配置
        components: {
            tableConfig: {
                pageSizes: [10, 20, 30, 50, 70, 100], //每页条数
                pageSize: 20, //每页默认显示数量
            }
        },
        //本地数据库配置
        indexedDB: {
            dbName: "moyu", //indexedDB名称
            version: 1, //indexedDB版本信息
        }
    },
    //主进程配置
    mainConfig: {
        width: 1440, //初始化窗口宽度
        height: 768, //初始化窗口高度
        useLocalFile: true, //使用本地文件作为主进程加载内容，版本更新会比较麻烦
        onlineUrl: "", //线上地址
    },
    //打包相关配置
    build: {
        publicPath: "", 
    }
};
```
注意：为了获取web的更新体验，你可以把electron当作一个壳，通过它来加载远端HTML页面。修改 `mainConfig.userLocalFile`为false，同时将 `mainConfig.onlineUrl`设置为远端地址，就可以享受web端的更新体验。

### 服务端部署
> 请确保已经安装MongoDB和Node.js
```bash
git clone https://github.com/trueleaf/moyu-server.git
cd moyu
npm install # 国内推荐使用cnpm进行安装
# 运行不同命令
npm run dev # 以开发模式启动项目
npm run start # Egg.js自带进程守护
```
你可以通过修改配置文件来进行一些简单的自定义，配置文件路径为 `/src/config/config.default.js`

* 修改MongoDB配置
```js
mongoose: {
    url: "mongodb://127.0.0.1:27017", //MongoDB地址
    options: {
        user: "", //用户名称(无账号和密码的数据库非常不安全)
        pass: "", //密码
        useUnifiedTopology: true,
    },
},
```
* 修改监听端口
```js
cluster = {
    listen: {
        port:7004, //如果你采用第三方云厂商，请确保在安全组中开启端口
        hostname: "0.0.0.0", //为了安全你应该将hostname设置为你信任的ip
    }
};
```
* 短信和图片服务(基于阿里云)

你可以根据需要开通这个两个服务，失去短信服务你将不能通过短信进行注册，失去图片服务你将不能在富文本中上传图片








> 更详细的[部署细节](https://www.yuque.com/shuxiaokai/moyu)

## 详细文档

[服务端Git地址](https://github.com/shuxiaokai3/moyu-server)
[完整的开发和使用文档(语雀)](https://www.yuque.com/shuxiaokai/moyu)

## License
MIT