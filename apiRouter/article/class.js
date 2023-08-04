// 公共参数
const { router , utilSuccess , db , getHeader , utilErr } = require('../../util/util');

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

// 过滤重名情况
let classFilter = (req, res, next)=>{
    let { title , type , id } = req.body;
    let sql = 'select * from header where title=? and type=?';
    db(sql, res , [ title , type?1:0]).then(sqldata=>{
        if (sqldata.length) {
            if( id ) next();
            else{
                res.send({
                    ...utilErr,
                    msg: "该类别已被注册，请更换账号名称！",
                })
            }
        } else {
            next();
        }
    })
}

// 获取分类 顶级分类
router.get('/getTopClass', (req,res)=>{
    let { type } = req.query,
    data;
    getHeader( res ).then( sqldata =>{
        if( type == undefined || type == null){
            data = sqldata
        }else if( type == "1" ){
            data = sqldata.filter(item => item.type == 1)
        }else{
            data = sqldata.filter(item => item.type == 0)
        }
        res.send({
            ...utilSuccess,
            data
        })
    })
})

// 新增类别
router.post('/addClass', userTypeFn ,  classFilter , (req, res) =>{
    let { title , type } = req.body;
    let addClass = 'insert into header ( title , type) values (?,?) ';
    db( addClass , res , [ title , type?1:0 ] ).then(sqldata=>{
        if(sqldata.affectedRows === 1){
            res.send({
                ...utilSuccess,
                msg: "新增成功！"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "新增失败!",
            })
        }
    })
})

// 删除类别
router.post('/deleteClass', userTypeFn , (req, res) =>{
    let { id } = req.body;
    let deleteClass = 'delete from header where id in (?)'
    db( deleteClass , res , [id] ).then(sqldata=>{
        if(sqldata.affectedRows >= 1){
            res.send({
                ...utilSuccess,
                msg: "操作成功！"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "删除失败!",
            })
        }
    })
})

// 修改类别
router.post('/updateClass', userTypeFn ,  classFilter, (req, res) =>{
    let { id , title , type  } = req.body;
    let updateSql = 'update header set title=?,type=? where id=?';
    db( updateSql , res , [  title , type?1:0 , id ]).then(sqldata=>{
        if(sqldata.changedRows == 1){
            res.send({
                ...utilSuccess,
                msg: "修改类别成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "修改类别失败",
            })
        }
    })
})



module.exports = router;