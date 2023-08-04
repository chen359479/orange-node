// 公共参数
const { router , utilSuccess , db , sd , utilErr} = require('../../util/util');

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

// 获取资源内容
router.get('/articleInfo', (req,res)=>{
    let { id } = req.query; 
    let selectSql = `select * from resource where id = ?`;

    db( selectSql , res , [ id ] ).then(sqldata=>{
        if(!sqldata.length){
            res.send({
                ...utilErr,
                msg: "查询失败",
            })
        }else{
            let obj = sqldata[0];
            obj.status = obj.status?true:false;
            obj.videoType = obj.videoType?true:false;

            res.send({
                ...utilSuccess,
                data : obj
            })
        }
    })
})

// 新增资源
router.post('/addArticleInfo', [ userTypeFn ] , (req,res)=>{
    let { classID , title , price , discount , status , imageUrl , videoType , url  } = req.body,
    { id } = req.user,
    created_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    addSql = `insert into resource (classID , title , price , discount , status , imageUrl , videoType , url , created_time , hits , userid ) values (?,?,?,?,?,?,?,?,?,?,?)`;

    db( addSql , res , [  classID , title , price , discount , status?1:0 , imageUrl , videoType?1:0 , url , created_time , 0 , id]).then( sqldata =>{
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


// 修改资源内容
router.post('/updateArticleInfo', [ userTypeFn ] , (req,res)=>{
    let { id , title , price , discount , status , imageUrl , videoType , url , classID } = req.body;

    let updateSql = `update resource set title=? , price=? , discount=?, status=? , imageUrl=? , videoType=? , url=? , classID=? where id=?`;

    db( updateSql , res , [ title , price , discount , status?1:0 , imageUrl , videoType?1:0 , url, classID , id ]).then( sqldata =>{
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

// 获取文本内容
router.get('/articleTextInfo', (req,res)=>{
    let { id } = req.query; 
    let selectSql = `select * from articletext where id = ?`;

    db( selectSql , res , [ id ] ).then(sqldata=>{
        if(!sqldata.length){
            res.send({
                ...utilErr,
                msg: "查询失败",
            })
        }else{
            let obj = sqldata[0];
            obj.status = obj.status?true:false;

            res.send({
                ...utilSuccess,
                data : obj
            })
        }
    })
})

// 新增文本内容
router.post('/addArticleTextInfo', userTypeFn , (req,res)=>{
    let { title, content, price , discount , status , imageUrl , classID} = req.body,
    { id } = req.user,
    created_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
    addSql = 'insert into articletext (userid ,title, content, price , discount , status , imageUrl , classID , created_time , hits  ) values (?,?,?,?,?,?,?,?,?,?)';
    
    db( addSql , res , [id, title, content, price , discount , status?1:0 , imageUrl , classID , created_time , 0]).then(sqldata=>{
        if (sqldata.affectedRows === 1){
            res.send({
                ...utilSuccess,
                msg: "成功写入文本！"
            })
        }
    })
})

// 修改文本内容
router.post('/updateArticleTextInfo', [userTypeFn] , (req,res)=>{
    let { id , title, content, price , discount , status , imageUrl , classID } = req.body;
    let updateSql = `update articletext set title=? , content=? , price=? , discount=? , status=? , imageUrl=? ,classID=? where id=?`;

    db( updateSql , res , [  title, content, price , discount , status , imageUrl , classID , id ]).then( sqldata =>{
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
router.post('/deleteArticle', [ userTypeFn ] ,  (req,res)=>{
    let { id  } = req.body,
    deleteSql =  `delete from resource where id in (?)`;
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

// 删除内容
router.post('/deleteArticleText', [ userTypeFn ] ,  (req,res)=>{
    let { id  } = req.body,
    deleteSql =  `delete from articletext where id in (?)`;
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