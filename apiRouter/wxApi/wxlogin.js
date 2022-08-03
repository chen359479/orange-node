// 第三方中间件
const jwt = require('jsonwebtoken');

// 公共参数
const { router , utilSuccess , secret, utilErr , db , appId , appSecret , axios , sd } = require('../../util/util');



// 微信用户登录接口
router.post('/wxlogin', (req, res) =>{
    let { code } = req.body,
    select = 'select * from wxuser where openid = ?';
    let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    
    axios.get( url ).then(response=>{
        if(response.errcode){
            res.send({
                ...utilErr,
                msg:"错误码：" + response.errcode
            })
        }else{
            login( response , res , select );
        }
    })
})


// 获取微信用户信息
let login = ( response , res , select )=>{
    db( select , res  , [ response.openid ] ).then(sqldata=>{
        if( sqldata.length ){
            let wxuser = sqldata[0],
            token = "Bearer " + jwt.sign({ id:wxuser.id }, secret , { expiresIn: "10h" });
            delete wxuser.openid
            res.send({
                ...utilSuccess,
                data:{
                    wxuser,
                    token,
                    sessionKey: response.session_key
                }
            })
        }else{
            registerWxuser( response , res , select);
        }
    })
}



// 注册微信用户
let registerWxuser = ( response , res , select )=>{
    let registerWxuser = 'insert into wxuser ( openid , created_time , unionid ) values (?,?,?)',
    created_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss') ;
    db( registerWxuser , res , [ response.openid , created_time , response.unionid ] ).then( register =>{
        if (register.affectedRows === 1) {
            // 注册完之后重新获取用户信息
            login( response , res , select );
        }else{
            res.send({
                ...utilErr,
                msg: "注册微信用户失败",
            })
        }
    })
}



module.exports = router;
