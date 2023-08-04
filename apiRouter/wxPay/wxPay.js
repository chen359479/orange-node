// 第三方中间件
const WxPay = require('wechatpay-node-v3');
const fs = require('fs');
const request = require('superagent');

// 公共参数
const { router , utilSuccess ,  utilErr , db , appId , appSecret , axios , sd } = require('../../util/util');


// 创建支付实例
const pay = new WxPay({
    appid: appId,
    mchid: '商户号',
    publicKey: fs.readFileSync('./apiclient_cert.pem'), // 公钥
    privateKey: fs.readFileSync('./apiclient_key.pem'), // 秘钥
});

// 定义一个获取支付参数路由（get请求）
router.post('/wxpay', async (req, res)=> {

    // 接收前端传过来的openid
    let { openid , orderID , price } = req.query;

    const params = {
        description: '冠和教育课程支付', // 订单描述
        out_trade_no: orderID, // 订单号，一般每次发起支付都要不一样，可使用随机数生成
        notify_url: 'https://pay.lipux.cn/notify_url',
        amount: {
            total: price*100, // 支付金额，单位为分
        },
        payer: {
            openid: openid, // 微信小程序用户的openid，一般需要前端发送过来
        },
        scene_info: {
            payer_client_ip: 'ip', // 支付者ip，这个不用理会也没有问题
        },
    };
    const result = await pay.transactions_jsapi(params);
    // 将结果响应给微信小程序前端
    res.send(result);

});


// 回调路由
app.post('/notify_url', async(req, res) => {
    // 申请的APIv3
    let key = '45c18fdfdgd45f5bc5321201dfdf453f';
    let { ciphertext, associated_data, nonce } = req.body.resource;
    // 解密回调信息
    const result = pay.decipher_gcm(ciphertext, associated_data, nonce, key);
    // 拿到订单号
    let { out_trade_no } = result;
    if (result.trade_state == 'SUCCESS') {
        // 支付成功之后需要进行的业务逻辑
        
    }
})


// 订单号生成函数
function randomNumber() {
    const now = new Date()
    let month = now.getMonth() + 1
    let day = now.getDate()
    let hour = now.getHours()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    hour = hour < 10 ? "0" + hour : hour;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    let orderCode = now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + (Math.round(Math.random() * 1000000)).toString();
    return orderCode;
}