// 公共参数
const { router , utilSuccess , db , getHeader } = require('../../util/util');


// 获取分类 顶级分类
router.get('/articleTopClass', (req,res)=>{
    getHeader( res ).then( sqldata =>{
        res.send({
            ...utilSuccess,
            data:sqldata
        })
    })
})

// 获取顶级分类的次级分类
router.get('/articleSecondaryClass', (req,res)=>{
    let { id } = req.query;
    let selectSql = "select title, id from h_two where second_level = ?";
    db( selectSql , res , [ id ]).then(sqldata=>{
        res.send({
            ...utilSuccess,
            data:sqldata
        })
    })
})

// 获取类别分类
router.get('/articleSubclass', (req,res)=>{
    let selectSql = "select title, id from class_list";
    db( selectSql , res).then(sqldata=>{
       
        res.send({
            ...utilSuccess,
            data:sqldata
        })
    })
})

// 获取分类 顶级分类
router.get('/articleTextClass', (req,res)=>{
    let selectHeader = " select name , title , id from header where type = 0";

    db(selectHeader, res).then(header => {
        res.send({
            ...utilSuccess,
            data:header
        })
    })
})

module.exports = router;