// 公共参数
const { router , utilSuccess , utilErr , db , sd } = require('../../util/util');

// 查询广播列表
router.get('/broadcastList' ,(req, res) =>{
    let { page , pageSize , grade , title , username } = req.query;
    let selectSql = `select SQL_CALC_FOUND_ROWS * from broadcast where ${Number(grade)? 'grade =' + Number(grade) + ' and':""} title like "%${title}%" and username like "%${username}%" and state=1 limit ?,?;SELECT FOUND_ROWS() as total;`;
    db( selectSql , res ,[ Number(page)-1 , Number(pageSize) ]).then(sqldata=>{
        res.send({
            ...utilSuccess,
            msg: "获取广播成功",
            data:sqldata[0].map(item=>{
                let expiration_time = new Date(item.expiration_time),
                at_time = new Date();
                // 判断过期时间是否大于当前时间
                item.pastDue = expiration_time >  at_time? false : true;
                return item;
            }),
            total:sqldata[1][0].total,
            page:Number(page),
            pageSize:Number(pageSize)
        })
    })
})


// 写入广播
router.post('/writeBroadcast',  (req, res) =>{
    let { title, content, grade, expiration_time } = req.body,
    { username } = req.user,
    created_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
    sql = 'insert into broadcast (username,title, content, grade, created_time , expiration_time , state ) values (?,?,?,?,?,?,?)';
    
    db( sql , res , [username, title, content, grade, created_time , sd.format(new Date(expiration_time), 'YYYY/MM/DD HH:mm:ss') , 1 ]).then(sqldata=>{
        if (sqldata.affectedRows === 1){
            res.send({
                ...utilSuccess,
                msg: "发送广播成功"
            })
        }
    })
})

// 删除广播  删除广播只会把广播消息的状态改成2,并不会真正在数据库删除此条广播
router.post('/deleteBroadcast',(req, res) =>{
    let { id } = req.body,
    updateSql = 'update broadcast set state=2 where id=?';
    
    db( updateSql , res ,[ id ]).then(sqldata=>{
        if (sqldata.changedRows >= 1){
            res.send({
                ...utilSuccess,
                msg: "删除广播成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "删除广播失败"
            })
        }
    })
})

// 获取广播内容
router.get('/getBroadcastInfo' ,(req, res) =>{
    let { id } = req.query,
    updateSql = 'select content from broadcast where id=? and state=1';
    db( updateSql , res ,[ id ]).then(sqldata=>{
        if(sqldata.length){
            res.send({
                ...utilSuccess,
                msg: "获取广播成功",
                data:sqldata[0].content
            })
        }
       
    })
})



module.exports = router;