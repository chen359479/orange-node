// 第三方中间件
const WXBizDataCrypt = require('../../util/WXBizDataCrypt')

// 公共参数
const { router , utilSuccess , utilErr , db , appId   } = require('../../util/util');


// 修改用户信息
router.post('/updateWxuserInfo',(req,res)=>{
    let { id } = req.user,
    { username , avatar , city , sex  } = req.body,
    updateSql = 'update wxuser set username=? , avatar=? , city=? , sex=? where id = ? ';
    db( updateSql , res , [ username , avatar , city , sex , id ] ).then(sqldata=>{
        if(sqldata.changedRows == 1){
            res.send({
                ...utilSuccess,
                msg: "更新微信用户信息成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "更新微信用户信息失败",
            })
        }
    })
})

// 修改用户手机号
router.post('/updateWxuserPhone',(req,res)=>{
    let { id } = req.user,
    { iv , encryptedData , key  } = req.body,
    pc = new WXBizDataCrypt(appId, key )
    updateSql = 'update wxuser set phone=?  where id = ?',
    data = pc.decryptData(encryptedData , iv);

    db( updateSql , res , [ data.phoneNumber , id ] ).then(sqldata=>{
        if(sqldata.changedRows == 1){
            res.send({
                ...utilSuccess,
                msg: "更新微信用户手机号成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "更新微信用户手机号失败",
            })
        }
    })
})





module.exports = router;
