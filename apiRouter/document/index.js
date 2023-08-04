// 第三方中间件
const fs = require('fs');
const path = require('path');

// 公共参数
const { router , utilSuccess , db , utilErr , sd , uploadFile } = require('../../util/util');

// 文件列表
router.get('/documentList', (req, res) => {
    let { page , pageSize ,  name = '' , type = '' } = req.query,
    selectSql = `select SQL_CALC_FOUND_ROWS * from document where name like "%${ name }%" and type like "%${ type }%" limit ?,?;SELECT FOUND_ROWS() as total;`
    db( selectSql , res , [ Number(page)-1 , Number(pageSize)  ] ).then( sqldata =>{
        res.send({
            ...utilSuccess,
            data:sqldata[0].map(item=>{
                item.name = item.name.split('(')[0]
                return item
            }),
            total:sqldata[1][0].total,
            page:Number(page),
            pageSize:Number(pageSize)
        })
    })
})


// 新增文档
router.post('/addDocument', (req,res)=>{
    let { id } = req.user,
    created_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
    addSql = `insert into document ( name , url , type , userid , created_time ) values (?,?,?,?,?)`
    uploadFile(req).then( result =>{
        db( addSql , res , [  result.newFileName, result.src , result.suffix , id , created_time]).then( sqldata =>{
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
    }).catch(err=>{
        res.send({
            ...utilErr,
            msg: "文件上传失败！" + err.message
        })
    })
})

// 文件列表
router.post('/deleteDocument', (req, res) => {
    let { id } = req.body,
    selectSql = `select * from document where id in (?)`,
    deleteSql =  `delete from document where id in (?)`,
    fileSrc = path.join(__dirname, '../../files/');


    db( selectSql , res , [ id ] ).then( sqldata =>{
        let fileNameList =  sqldata.map(item=>{ 
            return { name : item.name , id : item.id }
        });
        fileNameList.forEach( item=>{
            try {
                access(fileSrc + item.name, constants.R_OK | constants.W_OK);
                fs.unlinkSync( fileSrc + item.name)
            } catch (err){
                
            }
        })
        db( deleteSql , res , [ fileNameList.map(item=>{ return item.id }) ]).then( deleteData=>{
            if( deleteData.affectedRows ){
                res.send({
                    ...utilSuccess,
                    msg: "文件删除成功"
                })
            }else{
                res.send({
                    ...utilErr,
                    msg: "删除失败",
                })
            }
        })
    })
})






module.exports = router;