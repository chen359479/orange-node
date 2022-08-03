// 第三方插件
const mysql = require('mysql');
const express = require("express");
const app = express();
const router = express.Router();
const axios = require('axios')
const sd = require('silly-datetime');

let dbinfo = {
    host: '127.0.0.1', //数据库的ip地址
    user: 'root',      //登录数据库的账号
    password: '123456',//数据库的密码
    database: 'orange', //数据库的名称
    multipleStatements: true, // 支持执行多条 sql 语句
}

// 调用db方法必须传入三个参数 sql语句 ，res ，参数
let db = function (sql, res, params = []) {
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
}

// 获取
let getHeader = async (res) => {
    let selectHeader = " select name , title , id from header where type = 1",
        headerArr = [];
    await db(selectHeader, res).then(header => {
        headerArr = header
    })
    return headerArr
}

// 处理axios
axios.defaults.timeout = 2000000;      //响应时间
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";  //配置请求头

//POST传参序列化(添加请求拦截器)
axios.interceptors.request.use((config) => {
    //在发送请求之前做某件事
    // config.headers.Accept="appliaction/json,text/plan";
    if (config.method === "post") {
        config.data = qs.stringify(config.data);
    }
    return config;
}, (error) => {
    console.log("错误的传参")
    return Promise.reject(error);
});
axios.interceptors.response.use((res) => {
    //对响应数据做些事
    if (!res.data) {
        return Promise.resolve(res);
    }
    return res;
}, (error) => {
    return Promise.reject(error);
});

//返回状态判断(添加响应拦截器)
axios.interceptors.response.use((res) => {
    //对响应数据做些事
    if (!res.status == 200) {
        return Promise.resolve(res);
    }
    return res.data;
}, (error) => {
    console.log("网络异常")
    return Promise.reject(error);
});


module.exports = {
    secret: "qwert!@#$5,.!",  // token秘钥
    db,
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
    appId: "xxxxxx",   // 小程序appid
    appSecret: "xxxxxx",  // 小程序秘钥
}