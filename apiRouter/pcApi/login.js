// 第三方中间件
const jwt = require('jsonwebtoken');

// 公共参数
const { router , utilSuccess , utilErr , db , secret } = require('../../util/util');

// 登录
router.post('/login', (req, res) => {
    let { username, password , phone , model} = req.body,
    select;
    if(model){
        select = 'select * from user where username=? and password=?';
    }else{
        select = 'select * from user where phone=? and password=?';
    }
    
    db(select , res , [ model?username:phone, password ]).then(sqldata => {
        if (sqldata.length) {
            let user = sqldata[0];
            if(user.state == 1){
                let token = "Bearer " + jwt.sign({ username , type:user.type , id : user.id}, secret, { expiresIn: "10h" });
                delete user.password;
                user.token = token;
                res.send({
                    ...utilSuccess,
                    msg: "登陆成功",
                    data: user
                })
            }else if(user.state == 2){
                res.send({
                    ...utilErr,
                    msg: "当前账户处于锁定状态，请联系管理员",
                })
            }else{
                res.send({
                    ...utilErr,
                    msg: "登陆失败，未查询到该用户有效状态"
                })
            }
            
        } else {
            res.send({
                ...utilErr,
                msg: model?"账号或密码错误":"密码错误",
            })
        }
    })
})


module.exports = router;