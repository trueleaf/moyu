<div align="center" width="130px" height="130px">
    <img src="https://online.jobtool.cn/imgs/logo.png" alt="logo"/>
</div>
<h1 align="center">摸鱼(客户端)</h1>
<h3 align="center">一款基于 Vue 和 Electron 的接口文档管理工具</h3>
<div align="center">

[客户端下载](https://gitee.com/shuzhikai/moyu/attach_files/626980/download/moyu%20Setup%200.2.2.exe) | [完整文档](https://www.yuque.com/shuxiaokai/moyu) | [在线体验](https://online.jobtool.cn/)

</div>
<div align="center">
  <a href="https://github.com/trueleaf/moyu/releases/latest">
    <img src="https://img.shields.io/github/v/release/trueleaf/moyu?style=flat-square" alt="">
  </a>

  <a href="https://github.com/trueleaf/moyu/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/trueleaf/moyu" alt="LICENSE">
  </a>

  <a href="https://github.com/trueleaf/moyu/releases/latest">
    <img alt="GitHub All Releases" src="https://img.shields.io/github/downloads/trueleaf/moyu/total">
  </a>
</div>

## 预览
<div align="center">
    <img src="https://online.jobtool.cn/imgs/a.png" alt="logo"/>
</div>
<div align="center">
    <img src="https://online.jobtool.cn/imgs/c.png" alt="logo"/>
</div>
<div align="center">
    <img src="https://online.jobtool.cn/imgs/b.png" alt="logo"/>
</div>

## 常用

[完整文档](https://www.yuque.com/happymoyu) 

[在线体验](https://online.jobtool.cn/)(由于浏览器限制，完整版功能需要下载客户端)

[客户端下载](https://gitee.com/shuzhikai/moyu/attach_files/626980/download/moyu%20Setup%200.2.2.exe)

[客户端GitHub地址](https://github.com/trueleaf/moyu) | [服务端GitHub地址](https://github.com/trueleaf/moyu-server) | [客户端Gitee地址](https://gitee.com/shuzhikai/moyu) | [服务端Gitee地址](https://gitee.com/shuzhikai/moyu-server)

QQ群 977506603

## 适用场景&人群

### 前端开发人员

如果你是一名前端开发人员，直观简洁的接口展示，快速的接口定位联调对你来说是非常重要的。

#### 展示方式

相比于 **表格** 的数据呈现方式，**带注释的JSON**可能是更好的呈现方式，你可以很快定位到你需要的字段。
<div align="center">
    <img src="https://online.jobtool.cn/imgs/json.png" alt="logo"/>
</div>

#### 接口导航&定位

任意层级文档分类嵌套，URL搜索、创建者搜索、名称搜索都会极大提高你定位接口速度。
<div style="display: flex; justify-content: space-between">
    <img src="https://online.jobtool.cn/imgs/search.png" alt="logo" style="flex: 0 0 auto; margin-right: 20px"/>
    <img src="https://online.jobtool.cn/imgs/search2.png" alt="logo" style="flex: 0 0 auto; "/>
</div>

#### 模拟请求&Mock

你可以使用客户端直接发送请求进行调试，如果后端接口还未就绪，你可以选择Mock服务器进行数据Mock。
<div align="center">
    <img src="https://online.jobtool.cn/imgs/send.png" alt="logo"/>
</div>

#### 规范录入

常见开发过程中，你可能会遇到这些问题。
1. 接口录入人员可能一个分类下录入大量接口，增大了后期维护和前期联调难度
2. 某些字段因为一些原因忘记录入备注信息，增大前后端沟通成本
3. 联调时，接口提供端未检验接口是否联调或者返回字段是否与录入字段相同，增大联调成本

为了减少联调过程中的沟通成本，我们对录入过程进行了一些规范，这些规范可以根据自身团队特点灵活定制
<div align="center">
    <img src="https://online.jobtool.cn/imgs/rule.png" alt="logo"/>
</div>

### 后端开发人员

对于后端开发来说，如果写完了代码接口文档就可以根据代码逻辑自动生成那是最好不过的，类似**apidoc**之类的工具能够通过**注解**的方式自动生成文档，这在某些条件下会非常节约开发时间。但是这类工具也存在一些问题.
1. 对代码存在一些入侵，你需要按照他的规范进行书写
2. 在稍微大规模团队协作上面会存在许多弊端
3. 没法很好的支持模拟请求或者数据Mock

#### 快捷录入
为了提高后端开发人员录入效率，我们在许多地方都进行了优化。

**将远端返回值应用为接口文档**

<img src="https://online.jobtool.cn/imgs/template4.gif" alt="logo"/>

**通过模板将常用参数值保存起来**

<img src="https://online.jobtool.cn/imgs/template.gif" alt="logo"/>

**通过JSON导入参数时候自动在词库中匹配相关备注信息**

<img src="https://online.jobtool.cn/imgs/template2.gif" alt="logo"/>

**自动补全参数描述**

<img src="https://online.jobtool.cn/imgs/template3.gif" alt="logo"/>

**导出文档&生成在线链接等**

<img src="https://online.jobtool.cn/imgs/export.gif" alt="logo"/>

> [在线文档(密码：111111)](https://share.jobtool.cn/#/?shareId=39c3ae1d-04ca-4c6d-8846-fddba905990e&projectName=快乐摸鱼&expire=1647500174107)

**技术管理人员**
规范对于团队协作来说至关重要，前后端大部分协作时间可能都花在沟通联调上面。举例一些比较典型的场景。

* 接口传参拥有非常多的方式，一个**post**请求可以将参数携带在**body**中，传输的数据格式可以为`application/json` `multipart/form-data` `application/x-www-form-urlencoded`

* 参数录入过程中，因为一些疏忽会漏写一些参数的备注，在联调阶段会增加沟通成本

* 接口录入参数与实际返回参数字段个数和字段类型对不上

简单点解决的话大家可以协商一份规范文档，在开发过程中遵守这份文档就行。当然如果能通过工具来规范这个过程，那么整体效果会好很多，我们在工具中提供规范的自定义，降低约束成本。

<img src="https://online.jobtool.cn/imgs/rules2.png" alt="logo"/>

#### 团队协作

为了简化操作，我们定制了三种角色 **只读** **读写** **管理员**。只读用户只能预览文档，读写用户可以预览和编辑文档，管理员可以额外拥有拉人权限。
<img src="https://online.jobtool.cn/imgs/group.gif" alt="group"/>

#### 细粒度权限控制 

如果团队的权限比较灵活上述三种角色没法满足业务场景怎么办？我们提供了非常细粒度的权限控制，你甚至可以控制到每一个接口。如果你对更加细粒度的权限控制感兴趣你可以参考 [权限控制](https://www.yuque.com/happymoyu/as0gig/ksv015)
<img src="https://online.jobtool.cn/imgs/permission.png" alt="group"/>


### 二次开发&学习




## 主要功能

我们制作了一份建议的思维导图来概括整个项目的功能，你可以点击 [产品思维导图](https://www.yuque.com/docs/share/194c68d0-c739-4c42-876c-7c7917567316) 查看。

<div align="center">
    <img src="https://online.jobtool.cn/imgs/d.png" alt="logo"/>
</div>


### 团队协作

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



## License
MIT
