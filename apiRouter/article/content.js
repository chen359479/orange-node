// 公共参数
const { router , utilSuccess , db , sd , getHeader , utilErr} = require('../../util/util');

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

// 获取文章内容  区分是搜索来的还是分类来的  type?搜索：分类
router.get('/articleInfo', (req,res)=>{
    let { id , lang , type  } = req.query;
    if( type ){
        getHeader( res ).then( header =>{
            let title = header.filter(item=>item.title === lang)[0].name;
            let selectSql = `select * from ${title} where id = ?`;
            db( selectSql , res , [ id ] ).then(sqldata=>{
                res.send({
                    ...utilSuccess,
                    data : sqldata[0]
                })
            })
        })
    }else{
        let selectSql = `select * from ${lang} where id = ?`;
        db( selectSql , res , [ id ] ).then(sqldata=>{
            res.send({
                ...utilSuccess,
                data : sqldata[0]
            })
        })
    }
})

// 修改资源内容
router.post('/updateArticleInfo', [userTypeFn] , (req,res)=>{
    let { id , tableName , title , classify , size , content , download , download_num , gfwz , ys  } = req.body;
    let time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
    let updateSql = `update ${tableName} set title=? , classify=? , time=?, size=? , content=? , download=? , download_num=? , gfwz=? , ys=? where id=?`;

    db( updateSql , res , [  title , classify , time , size , content , download , download_num , gfwz , ys , id ]).then( sqldata =>{
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

// 修改文本内容
router.post('/updateArticleTetxInfo', [userTypeFn] , (req,res)=>{
    let { id , tableName , title , content  } = req.body;
    let time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
    let updateSql = `update ${tableName} set title=? , content=? , time=? where id=?`;

    db( updateSql , res , [  title , content , time , id ]).then( sqldata =>{
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
    let { id , tableName } = req.body,
    deleteSql =  `delete from ${tableName} where id in (?)`;
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