// 公共参数
const { router , utilSuccess , utilErr , db , sd } = require('../../util/util');

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

// 获取最新的数据
router.get('/carOrders', (req,res)=>{
    let { page , pageSize , name = '', phone = '' } = req.query,
        selectSql = `select SQL_CALC_FOUND_ROWS * from car where name like "%${name}%" and phone like "%${phone}%" limit ?,?;SELECT FOUND_ROWS() as total;`
    db(selectSql, res , [  Number(page)-1 , Number(pageSize)  ]).then(sqldata=>{
        res.send({
            ...utilSuccess,
            data:sqldata[0],
            total:sqldata[1][0].total,
            page,
            pageSize
        })
    })
})

// 获取最新的数据
router.get('/getCarOrderInfo', (req,res)=>{
    let { id } = req.query,
        selectSql = `select * from car where id = ?`
    db( selectSql , res , [ id ] ).then(sqldata=>{
        if(!sqldata.length){
            res.send({
                ...utilErr,
                msg: "查询失败",
            })
        }else{
            res.send({
                 ...utilSuccess,
                 data : sqldata[0]
            })
        }
    })
})

// 新增租车订单
router.post('/addCarOrder', [ userTypeFn ] , (req,res)=>{
    let { name , phone , start_time , end_time , money , imgs , other , guarantee_deposit , plate_number , motorcycle , idNumber , mileage } = req.body,
    created_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    start = sd.format(start_time, 'YYYY/MM/DD HH:mm:ss'),
    end = sd.format(end_time, 'YYYY/MM/DD HH:mm:ss'),
    addSql = `insert into car (name , phone , start_time , end_time , money , imgs , other , created_time , guarantee_deposit , plate_number , motorcycle , idNumber , mileage) 
    values (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    db( addSql , res , [ name , phone , start , end , money , imgs , other  , created_time , guarantee_deposit , plate_number , motorcycle , idNumber , mileage ]).then( sqldata =>{
        if(sqldata.affectedRows == 1){
            res.send({
                ...utilSuccess,
                msg: "新增资源成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "新增资源失败",
            })
        }
    })
})

// 更新租车订单
router.post('/updateCarOrder', [ userTypeFn ] , (req,res)=>{
    let { name , phone , start_time , end_time , money , imgs , other , guarantee_deposit , plate_number , motorcycle , id , idNumber , mileage} = req.body,
    start = sd.format(start_time, 'YYYY/MM/DD HH:mm:ss'),
    end = sd.format(end_time, 'YYYY/MM/DD HH:mm:ss')
    let updateSql = `update car set name=? , phone=? , start_time=?, end_time=? , money=? , imgs=? , other=? , 
                            guarantee_deposit=? , plate_number=? , motorcycle=? , idNumber=? , mileage=? where id=?`;

    db( updateSql , res , [ name , phone , start , end , money , imgs , other  , guarantee_deposit , plate_number , motorcycle , idNumber , mileage , id]).then( sqldata =>{
        if(sqldata.changedRows == 1){
            res.send({
                ...utilSuccess,
                msg: "修改成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "修改失败",
            })
        }
    })
})

// 删除内容
router.post('/deleteCarOrder', [ userTypeFn ] ,  (req,res)=>{
    let { id  } = req.body,
    deleteSql =  `delete from car where id in (?)`;
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