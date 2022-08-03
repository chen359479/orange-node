// 公共参数
const { router , utilSuccess , utilErr , db  } = require('../../util/util');

// 验证token中用户的角色
let userTypeFn = (req,res,next)=>{
    let { type } = req.user;
    if( type == 'superAdmin' || type == 'admin' ){
        next()
    }else{
        res.send({
            ...utilErr,
            msg: "没有权限！",
        })
    }
}

// 获取微信用户列表
router.get('/getWxuserList',(req,res)=>{
    let { page , pageSize , username = "" , phone = ""} = req.query,
    selectSql = `select SQL_CALC_FOUND_ROWS * from wxuser where username like "%${username}%" and phone like "%${phone}%" limit ?,?;SELECT FOUND_ROWS() as total;`;
    db( selectSql , res , [ Number(page)-1 , Number(pageSize) ]  ).then( sqldata =>{
        console.log(sqldata)
        res.send({
            ...utilSuccess,
            msg: "获取微信用户成功",
            data:sqldata[0].length?sqldata[0].map(item=>{
                delete item.openid ;
                return item
            }):[],
            total:sqldata[1][0].total,
            page,
            pageSize
        })
    })
})

// 删除微信用户
router.post('/deleteWxuser', [ userTypeFn ] ,  (req,res)=>{
    let { id  } = req.body,
    deleteSql =  'delete from wxuser where id in (?)';
    db( deleteSql , res , [ id ] ).then( sqldata =>{
        console.log(sqldata)
        if( sqldata.affectedRows ){
            res.send({
                ...utilSuccess,
                msg: "删除用户成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "删除用户失败",
            })
        }
    })

})



module.exports = router;
