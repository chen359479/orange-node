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


// 获取车辆列表
router.get('/getCarList', (req,res)=>{
    let { page , pageSize , motorcycle = '' , plateNumber = '' } = req.query,
        selectSql = `select SQL_CALC_FOUND_ROWS * from carinfo where motorcycle like "%${motorcycle}%" and plate_number like "%${plateNumber}%" limit ?,?;SELECT FOUND_ROWS() as total;`
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

// 获取车牌号和车辆型号
router.get('/getCarInfoPn', (req,res)=>{
    let selectSql = `select id , motorcycle , plate_number from carinfo`
        db( selectSql , res ).then(sqldata=>{
            res.send({
                ...utilSuccess,
                data : sqldata
            })
        })
})

// 获取车辆信息
router.get('/getCarInfo', (req,res)=>{
    let { id } = req.query,
        selectSql = `select * from carinfo where id = ?`
        db( selectSql , res , [ id ] ).then(sqldata=>{
            res.send({
                 ...utilSuccess,
                data : sqldata[0]
            })
        })
})

// 新增车辆信息
router.post('/addCarInfo', [ userTypeFn ] , (req,res)=>{
    let { motorcycle , plate_number , color , money , engine_number , vin , start_time ,mandatory , mandatory_company ,
         commercial_insurance , c_i_doc , status , car_image , driving_image , other , expenditure , m_c_doc} = req.body,
    created_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    update_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    end_time = sd.format((new Date(start_time).getTime() + 13 * 12 * 30.6 * 24 * 60 * 60 * 1000 ), 'YYYY/MM/DD HH:mm:ss') ,
    addSql = `insert into carinfo ( motorcycle , plate_number , color , money , engine_number , vin , start_time , end_time , mandatory , mandatory_company ,commercial_insurance ,
         c_i_doc , status , car_image , driving_image , other , created_time , expenditure , update_time , m_c_doc ) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    db( addSql , res , [ motorcycle , plate_number , color , money , engine_number , vin , start_time , end_time , mandatory , mandatory_company ,
        commercial_insurance , c_i_doc , status , car_image , driving_image , other , created_time , expenditure , update_time , m_c_doc ]).then( sqldata =>{
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

// 更新车辆信息
router.post('/updateCarInfo', [ userTypeFn ] , (req,res)=>{
    let { motorcycle , plate_number , color , money , engine_number , vin , start_time ,mandatory , mandatory_company ,
        commercial_insurance , c_i_doc , status , car_image , driving_image , other , expenditure , m_c_doc, id } = req.body,
        update_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
        end_time = sd.format((new Date(start_time).getTime() + 13 * 12 * 30.6 * 24 * 60 * 60 * 1000 ), 'YYYY/MM/DD HH:mm:ss'),
        updateSql = `update carinfo set motorcycle=? , plate_number=? , color=?, money=? , engine_number=? , vin=? , start_time=? , end_time=? , mandatory=? , mandatory_company=? , 
    commercial_insurance=? , c_i_doc=? , status=?  , car_image=? , driving_image=? , other=? , expenditure=? , update_time=? , m_c_doc=? where id=?`;

    db( updateSql , res , [motorcycle , plate_number , color , money , engine_number , vin , start_time , end_time , mandatory , mandatory_company ,
        commercial_insurance , c_i_doc , status , car_image , driving_image , other , expenditure , update_time , m_c_doc , id]).then( sqldata =>{
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

// 删除车辆/下架车辆
router.post('/deleteCarInfo',  [ userTypeFn ] , (req,res)=>{
    let { id } = req.body,
    sql = `delete from carinfo where id in (?)`;
    db( sql , res , [ id ] ).then( sqldata =>{
        if( qldata.affectedRows ){
            res.send({
                ...utilSuccess,
                msg: "删除成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "删除失败"
            })
        }
    })
})

// 删除车辆/下架车辆
router.post('/updateCarStatus',  [ userTypeFn ] , (req,res)=>{
    let { id , status } = req.body,
    sql = `update carinfo set status=? where id=?`;
    db( sql , res , [ status , id ] ).then( sqldata =>{
        if( sqldata.changedRows ){
            res.send({
                ...utilSuccess,
                msg: "修改成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "修改失败"
            })
        }
    })
})

module.exports = router;