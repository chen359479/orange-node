// 第三方中间件
const fs = require('fs');
const path = require('path');
const Core = require('@alicloud/pop-core');

// 公共参数
const { router , utilSuccess , db , utilErr ,sd  } = require('../../util/util');

// 文件上传
router.post('/uploadFile', (req, res) => {
    let name = req.file.originalname; // 获取上传上来的文件名
    let i = name.lastIndexOf("."); // 找到后缀名点的位置
    let suffix = name.substring(i, name.length); // 截取文件的后缀名
    let fileName = req.user.name + "(" + new Date().getTime() + ")" + suffix; // 用户名 + 时间 + 后缀名

    let fileSrc = path.join(__dirname, '../files/', fileName);
    fs.writeFile(fileSrc, req.file.buffer, err => {
        if (err) {
            res.send({
                ...utilErr,
                msg: "文件上传失败！" + err.message
            })
        } else {
            let ip = "https://www.ktkyio.xyz/files/"; // 服务器对外暴露的静态资源路径，修改这里的files路径记得修改app.js的第19行
            res.send({
                ...utilSuccess,
                msg: "文件上传成功！",
                src: ip + fileName
            })
        }
    })
})

// 发送验证码
router.post('/sendCode', (req, res) => {
    let { mobile } = req.body;
    let codes = Math.floor(Math.random() * 10000) ; //生成四位随机数
    if( 1000 > codes){
       codes = Math.floor( codes * ( 1000 / codes + 2.3 ) )
    }

    let ip = req.headers['x-forwarded-for'] ||  // 获取IP地址
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    let start = new Date().getTime(); // 获取当前时间戳

    // 查询code表中是否存在当前手机号获取验证码的记录
    let codeSql = 'select * from code where phone=?';
    let end;
    db( codeSql , res, [ mobile ] ).then(sqldata => {
        sqldata.length ? end = new Date(sqldata[0].creat_time).getTime() : end = 1; //获取上次发送验证码的时间，用来限制前端多次请求
        // 判断当前时间与上次获取验证码时间是否超过五分钟
        if ((start - end) > 60000) {
            // 调用发送短信的方法
            sendAliCode(mobile, codes).then(sendStatus => {
                // 如果短信发送成功则执行
                if (sendStatus.Code === "OK") {
                    let codeData = {
                        code: codes,
                        ip,
                        creat_time: sd.format(new Date(start), 'YYYY/MM/DD HH:mm:ss'),
                        phone: mobile
                    };
                    // 将生成的验证码保存在code表中
                    if (sqldata.length) {
                        let updateCode = 'update code set ? where phone=?'
                        db(updateCode, [codeData, codeData.phone], res)
                    } else {
                        // 将code参数存入code表中
                        let creatCode = 'insert into code set ?';
                        db(creatCode, [ codeData ] , res)
                    }
                    // 返回短信成功的信息
                    res.send({
                        ...utilSuccess,
                        msg: "验证码发送成功！"
                    })
                }
                // 如果发送短信失败则执行 
                else {
                    res.send(sendStatus)
                }
            });

        } else {  // 如果没有超过5分钟则提示：
            res.send({
                ...utilErr,
                msg: "请求过于频繁！"
            })
        }
    })
})

// 发送短信验证码  传入手机号和验证码
let sendAliCode = async (phone, code) => {
    // accessKeyId 和 accessKeySecret 参考：https://help.aliyun.com/document_detail/53045.htm?spm=a2c4g.11186623.0.0.7b955d7acbMDU7
    let client = new Core({
        accessKeyId: 'xxxxxx',
        accessKeySecret: 'xxxxxx',
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25'
    });

    let params = {
        "PhoneNumbers": phone,
        "TemplateCode": "xxxxxx", // 你的短信模板CODE
        "SignName": "xxxxxx", // 你的短信签名名称
        "TemplateParam": "{code:" + code + "}"
    }

    let requestOption = {
        method: 'POST'
    };
    let results;
    await client.request('SendSms', params, requestOption).then((result) => {
        results = result;
    }, (ex) => {
        results = ex;
    })
    return results
}



module.exports = router;