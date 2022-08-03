// 公共参数
const { router , utilSuccess , db , getHeader } = require('../../util/util');

// 获取最新的数据
router.get('/articleNews', (req,res)=>{
    // 所有分类的表名
    let selectSql = "";

    // 查询顶级分类
    getHeader( res ).then( header =>{
        header.forEach(item=>{
            selectSql += `select id,title,breviary_img,time,size,lang from ${item.name} ORDER BY time DESC limit 0,10;`
        });
        // 查询最新的10条数据
        db( selectSql , res).then(sqldata=>{
            res.send({
                ...utilSuccess,
                data:sqldata.map( (item,index) =>{
                    return {
                        name : header[index].title,
                        data:item,
                        tableName : header[index].name
                    }
                })
            })
        })
    })
})

// 获取数据列表
router.get('/articleList', (req,res)=>{
    let { tableName , page , pageSize , title = '' } = req.query,
    selectSql = `select SQL_CALC_FOUND_ROWS title , id , time , breviary_img , lang , size from ${tableName} where classify like '%${title}%' limit ?,?;SELECT FOUND_ROWS() as total;`

    db( selectSql , res , [ Number(page)-1 , Number(pageSize)  ]  ).then( sqldata =>{
        res.send({
            ...utilSuccess,
            data:sqldata[0],
            total:sqldata[1][0].total,
            page,
            pageSize
        })
    })
})

// 获取文本数据列表
router.get('/articleTextList', (req,res)=>{
    let { tableName , page , pageSize} = req.query,
    selectSql = `select SQL_CALC_FOUND_ROWS title , id , time from ${tableName} limit ?,?;SELECT FOUND_ROWS() as total;`

    db( selectSql , res , [ Number(page)-1 , Number(pageSize)  ]  ).then( sqldata =>{
        res.send({
            ...utilSuccess,
            data:sqldata[0],
            total:sqldata[1][0].total,
            page,
            pageSize
        })
    })
})

// 获取文本数据列表
router.get('/articleSearch', (req,res)=>{
    let { title , page , pageSize } = req.query,
    selectSql1 = `select SQL_CALC_FOUND_ROWS * from (`,
    selectSql2 = `) as fnd where title like '%${title}%' or lang like "%${title}%" limit ?,?;SELECT FOUND_ROWS() as total;`
    selectSql = ""
    
    // 所有顶级分类
    getHeader( res ).then( header =>{
        header.forEach((item,index)=>{
            if( index == header.length-1 ){
                selectSql += ` (select title,id,time,breviary_img,lang from ${item.name})`
            }else{
                selectSql += ` (select title,id,time,breviary_img,lang from ${item.name}) UNION ALL `
            }
        });

        // 查询所有
        db( selectSql1 + selectSql + selectSql2 , res , [ Number(page)-1 , Number(pageSize)  ] ).then(sqldata=>{
            res.send({
                ...utilSuccess,
                data:sqldata[0],
                total:sqldata[1][0].total,
                page,
                pageSize
            })
        })
    })
})

module.exports = router;