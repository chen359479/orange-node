// 公共参数
const { router , utilSuccess , db , utilErr } = require('../../util/util');

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

// 生成随机字符
function randomStringOrTime() {
    len = 18;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd+(new Date().getTime());
}

// 获取资源数据列表
router.get('/getOrderList', (req,res)=>{
    let { page , pageSize , payStatus , orderID , title , userPhone } = req.query,
    selectSql = "select SQL_CALC_FOUND_ROWS * from orders where ";
    if ( Number(payStatus) || orderID || title || userPhone ){
        let arr = [];
        if(Number(payStatus)) arr.push(`payStatus=${Number(payStatus)} `);
        if(orderID) arr.push(`orderID like '%${orderID}%' `);
        if(title) arr.push(`title like '%${title}%' `);
        if(userPhone) arr.push(`userPhone=${userPhone} `);

        if( arr.length === 1 ){
            selectSql = `select SQL_CALC_FOUND_ROWS * from orders where ` + arr[0] + ` limit ?,?;SELECT FOUND_ROWS() as total;`;
        }else{
            arr.forEach((item,index)=>{
                if( index == arr.length - 1 ){
                    selectSql += item 
                }else{
                    selectSql += item + 'and '
                }
            })
            selectSql += `limit ?,?;SELECT FOUND_ROWS() as total;`
        }
    }else{
        selectSql = `select SQL_CALC_FOUND_ROWS * from orders limit ?,?;SELECT FOUND_ROWS() as total;`;
    }

    db( selectSql , res , [ Number(page)-1 , Number(pageSize)]  ).then( sqldata =>{
        res.send({
            ...utilSuccess,
            data:sqldata[0],
            total:sqldata[1][0].total,
            page:Number(page),
            pageSize:Number(pageSize)
        })
    })
})

// 创建订单 此时订单的状态统一为未付款
router.post('/addOrder', (req,res)=>{
    let { title , price , userName , userID , goodsID , userPhone } = req.body;
    let orderID = randomStringOrTime();
    let created_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
    let updateSql = `insert into resource (title , price , userName , userID , goodsID , orderID , userPhone , payStatus , created_time ) values (?,?,?,?,?,?,?,?,?,?,?,?)`;

    db( updateSql , res , [  title , price , userName , userID , goodsID , orderID , userPhone , 2 , created_time ]).then( sqldata =>{
        if(sqldata.affectedRows == 1){
            res.send({
                ...utilSuccess,
                msg: "创建订单成功",
                data:{
                    orderID,
                    price
                }
            })
        }else{
            res.send({
                ...utilErr,
                msg: "创建订单失败",
            })
        }
    })
})

// 删除订单
router.post('/deleteOrder', [ userTypeFn ] ,  (req,res)=>{
    let { id  } = req.body,
    deleteSql =  `delete from orders where id in (?)`;
    db( deleteSql , res , [ id ] ).then( sqldata =>{
        if( sqldata.affectedRows ){
            res.send({
                ...utilSuccess,
                msg: "删除成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "删除失败",
            })
        }
    })
})

module.exports = router;