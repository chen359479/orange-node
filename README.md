# 小橙子管理系统 --- NODE



## 前言

该方案作为搭配小橙子后台管理系统的后台代码模板。

后台node项目地址：https://gitee.com/chen359479/orange-node

前端vue项目地址：  https://gitee.com/chen359479/orange-vue

小程序项目地址：    https://gitee.com/chen359479/orange-uniapp

资源网站预览地址：http://175.24.172.244:8088/#/index


## 技术

在Node.js ( 14.8.x ) + Mysql ( 5.7.26 ) + Express（4.17.3） 平稳运行。





## 功能

- [x] 登录 / 添加

- [x] 三级菜单

- [x] 菜单权限

- [x] 文件上传

- [x] 短信功能（阿里云）

- [x] 手机号登录

- [x] 微信登录

- [x] 微信注册

  

## 安装步骤

```
git https://gitee.com/chen359479/orange-node.git //下载模板到本地

// 运行前请先确保电脑上安装了mysql，并将文件夹里的orange.sql导入数据库，数据库名称orange
// 如果不会安装和启动mysql请看下方教程。
cd orange-node //进入后端模板目录
npm install //安装依赖
node app.js // 启动服务，开发调试建议使用nodemon启动命令

```

## Mysql

推荐使用PHPStudy，可视化操作、新手友好。[官网](https://www.xp.cn/) 

![](https://www.ktkyio.xyz/files/orange1.png)

打开首页可以看到，默认安装了mysql，直接点击启动命令即可，需要操作数据库必须开启此命令。如果node在运行过程中报错，请检查是否开启mysql。如果没有默认安装，点击软件管理->数据库，选择版本安装即可。

![](https://www.ktkyio.xyz/files/orange2.png)

在数据库栏修改数据库密码

![](https://www.ktkyio.xyz/files/orange6.png)

成功启动mysql之后，推荐使用navicat数据库可视化操作工具，默认生成了localhost连接，左键双击之后打开localhost连接，等待连接名称变成绿色之后，右键->新建数据库，对照图片填好数据，点击确定即可生成数据库。

![](https://www.ktkyio.xyz/files/orange3.png)



新建orange数据库完成之后，左键双击连接数据库，右键->运行sql文件。

![](https://www.ktkyio.xyz/files/orange4.png)

![](https://www.ktkyio.xyz/files/orange5.png)

选中nodeJs里的orange.sql，点击开始即可。导入成功之后刷新数据库便可看到数据表，至此数据库的创建和导入完成。



