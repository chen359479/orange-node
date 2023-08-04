// 第三方插件
const mysql = require('mysql');
const express = require("express");
const app = express();
const router = express.Router();
const { axios } = require("./request")
const sd = require('silly-datetime');
const path = require('path');
const fs = require('fs');

let ip = "http://127.0.0.1:8199",
// 数据库信息
dbinfo = {
    host: '127.0.0.1', //数据库的ip地址
    user: 'root',      //登录数据库的账号
    password: '123456',//数据库的密码
    database: 'orange', //数据库的名称
    multipleStatements: true, // 支持执行多条 sql 语句
},
// 调用db方法必须传入三个参数 sql语句 ，res ，参数
db = function (sql, res, params = []) {
    return new Promise((resolve, reject) => {
        // 一、新建一个连接池
        let pool = mysql.createPool(dbinfo)
        // 二、连接
        pool.getConnection((error, connection) => {
            // 三、使用sql语句操作
            connection.query(sql, params, (err, results, fields) => {
                if (err) {
                    res.send({
                        code: 500,
                        status: false,
                        msg: "服务器内部错误：" + err.message
                    })
                } else {
                    resolve(results)
                }
                // 四、释放连接池
                connection.release()
            })
        })
    })
},
// 获取
getHeader = async (res) => {
    let selectHeader = " select * from header",
        headerArr = [];
    await db(selectHeader, res).then(header => {
        headerArr = header
    })
    return headerArr
},
// 上传文件
uploadFile = ( req )=>{
    return new Promise((resolve, reject) => {
        let name = req.file.originalname, // 获取上传上来的文件名
        i = name.lastIndexOf("."), // 找到后缀名点的位置
        suffix = name.substring(i, name.length), // 截取文件的后缀名
        fileName = name.substring( 0, i ),
        newFileName = fileName + "(" +sd.format(new Date(), 'YYYY-MM-DD HH-mm-ss') + ")" + suffix; //  上传的文件名+ 时间 + 后缀名
        
        let fileSrc = path.join(__dirname, '../files/', newFileName);
        fs.writeFile(fileSrc, req.file.buffer, err => {
            if (err) {
                reject(err.message)
            } else {
                resolve({
                    src: ip + "/files/" + newFileName ,
                    suffix,
                    newFileName
                })
            }
        })
    })
}


module.exports = {
    secret: "qwert!@#$5,.!",  // token秘钥
    db,
    uploadFile,
    utilSuccess: {
        code: 200,
        status: true,
        msg: "执行成功!"
    },
    utilErr: {
        code: 400,
        status: false,
        msg: "执行失败!"
    },
    router,
    app,
    express,
    axios,
    sd,
    getHeader,
    ip,
    appId: "xxxxxx",   // 小程序appid
    appSecret: "xxxxxx",  // 小程序秘钥
}