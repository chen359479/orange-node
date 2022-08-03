// 公共参数
const { router , utilSuccess , utilErr , db , sd } = require('../../util/util');

// 验证用户名是否被占用
let nameFc = (req, res, next) => {
    let { username , id } = req.body;
    let nameSql = 'select * from user where username=?';
    // 查询账号是否被注册
    db(nameSql , res , username ).then(sqldata=>{
        if (sqldata.length) {
            // 判断走的是添加还是修改
            if( !id ){
                res.send({
                    ...utilErr,
                    msg: "该账号已被注册，请更换账号名称！",
                })
            } else {
                if( sqldata.every(item=> id === item.id)){
                    next();
                }else{
                    res.send({
                        ...utilErr,
                        msg: "该账号已被注册，请更换账号名称！",
                    })
                }
            }
        } else {
            next();
        }
    })
}

// 判断手机号是否被占用的中间件
let phoneFc = (req, res, next) => {
    let { phone , id } = req.body;
    let phoneSql = 'select * from user where phone=?';
    db(phoneSql , res , phone ).then(sqldata=>{
        if (sqldata.length  ) {
            if( !id ){
                res.send({
                    ...utilErr,
                    msg: "该手机号已被注册，请更换手机号！",
                })
            }else{
                if( sqldata.every(item=> id === item.id)){
                    next();
                }else{
                    res.send({
                        ...utilErr,
                        msg: "该手机号已被注册，请更换手机号！",
                    })
                }
            }
        } else {
            next();
        }
    })
}

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

// 验证token中用户的角色
let regAdmin = (req,res,next)=>{
    let { username } = req.user,
    { adminPassword } = req.body;
    let selectSql = 'select * from user where username=? and password=?';
    db( selectSql , res , [ username , adminPassword ]).then(sqldata=>{
        if (sqldata.length) {
            next();
        } else {
            res.send({
                ...utilErr,
                msg: "管理员密码不正确！"
            })
        }
    })
}


// 注册用户
router.post('/register', [phoneFc, nameFc], (req, res) => {
    let { username, password, phone, state , type ,sex , broadcast } = req.body;
    let created_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss') ;
    // 写入用户
    let userSql = 'insert into user (username,password,phone,created_time,type,sex,state,update_time,broadcast) values (?,?,?,?,?,?,?,?)';
    db( userSql , res , [username, password, phone, created_time , type , sex , state , created_time , broadcast ]).then(sqldata=>{
        if (sqldata.affectedRows === 1) {
            res.send({
                ...utilSuccess,
                msg: "用户注册成功！"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "注册用户失败",
            })
        }
    })
})

// 删除用户
router.post('/deleteUser',(req, res) =>{
    let { id } = req.body;
    let deleteUser = 'delete from user where id in (?)'
    let update_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss') ;
    db( deleteUser , res , [ update_time, id ]).then(sqldata=>{
        if(sqldata.changedRows >= 1){
            res.send({
                ...utilSuccess,
                msg: "操作成功！"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "删除用户失败",
            })
        }
    })
})

// 更新用户
router.post('/updateUser', [phoneFc, nameFc] , (req, res) =>{
    let { id , username , sex , phone , state ,  type , broadcast } = req.body;
    let update_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss') ;
    let updateSql = 'update user set username=?,phone=?,update_time=?,sex=?,state=?,type=?,broadcast=? where id=?';
    db( updateSql , res , [ username , phone , update_time , sex ,  state ,  type , broadcast , id ]).then(sqldata=>{
        if(sqldata.changedRows == 1){
            res.send({
                ...utilSuccess,
                msg: "更新用户信息成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "更新用户信息失败",
            })
        }
    })
})

// 更新用户密码
router.post('/updateUserPassword', [userTypeFn , regAdmin] ,(req, res) =>{
    let { id , newPassword } = req.body;
    let update_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss') ;
    let updateSql = 'update user set update_time=?,password=? where id=?';
    db( updateSql , res , [  update_time , newPassword , id ]).then(sqldata=>{
        if(sqldata.changedRows == 1){
            res.send({
                ...utilSuccess,
                msg: "修改密码成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "修改密码失败",
            })
        }
    })
})

// 更新用户密码
router.post('/updateMePassword', (req, res) =>{
    let { id , newPassword } = req.body;
    let update_time = sd.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
    let updateSql = 'update user set update_time=?,password=? where id=?';
    db( updateSql , res , [  update_time , newPassword , id ]).then(sqldata=>{
        if(sqldata.changedRows == 1){
            res.send({
                ...utilSuccess,
                msg: "修改密码成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "修改密码失败",
            })
        }
    })
})



// 查询用户列表
router.get('/userList', userTypeFn ,(req, res) =>{
    let { page , pageSize , username , phone , state } = req.query,
    { type } = req.user;
    let selectSql = `select SQL_CALC_FOUND_ROWS * from user where type ${type =='admin'?'="user"': '!="superAdmin"'} and username like "%${username}%" and phone like "%${phone}%" ${state==0?'':' and state='+state} limit ?,?;SELECT FOUND_ROWS() as total;`;
    db( selectSql , res ,[ Number(page)-1 , Number(pageSize) ]).then(sqldata=>{
        res.send({
            ...utilSuccess,
            msg: "获取用户成功",
            data:sqldata[0].length?sqldata[0].map(item=>{
                delete item.password ;
                return item
            }):[],
            total:sqldata[1][0].total,
            page,
            pageSize
        })
    })
})





module.exports = router;