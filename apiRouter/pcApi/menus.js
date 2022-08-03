// 公共参数
const { router , utilSuccess , utilErr , db  } = require('../../util/util');

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

// 判断添加或者修改时是否存在重复
let regViewPath = (req,res,next)=>{
    let { viewPath , title , name , id } = req.body;
    let selectSql = 'select * from menus where viewPath=? or title=? or name=?';
    db( selectSql , res , [ viewPath , title , name ] ).then(sqldata=>{
        if((sqldata.length && !id) || (sqldata.length>1 && id)){
            res.send({
                ...utilErr,
                msg:"请检查path路径、菜单名称、组件名称是否与现有页面存在重复！"
            })
        }else{
            next()
        }
    })
}

// 判断待删除的菜单是否被包含在其上级菜单的子集中
let regMenuBeEnclosed = (req,res,next)=>{
    let { id } = req.body;
    let selectSql = 'select children from menus';
    db( selectSql , res ).then(sqldata=>{
        let beEnclosed = sqldata.some(item=>JSON.parse(item.children).includes(id));
        if(beEnclosed){
            res.send({
                ...utilErr,
                msg:"该菜单已被纳入其上级菜单的子集中，请先从其上级菜单的子集中删除"
            })
        }else{
            next()
        }
    })
}

// 写入菜单
router.post('/writeMenus', userTypeFn , regViewPath , (req,res)=>{
    // 页面路径 ，icon , 菜单显示的名称 ， 排序 ，router组件的名称 ，子集 , 所处的层级， 限制那些角色能看
    let { viewPath ,  icon , title , sequence , name , children , hierarchy , astrict , type } = req.body;

    let sql = 'insert into menus (viewPath,icon,title,sequence,name, children , hierarchy , astrict , type ) values (?,?,?,?,?,?,?,?,?)';
    db( sql , res ,[viewPath ,  icon , title , sequence , name ,children? JSON.stringify(children) : "[]", hierarchy , JSON.stringify(astrict) , type?1:0  ] ).then(sqldata=>{
        if (sqldata.affectedRows === 1) {
            res.send({
                ...utilSuccess,
                msg:"添加菜单成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "添加菜单失败",
            })
        }
    })
})

// 获取未分类的菜单
router.get('/getMenuList', userTypeFn ,(req,res)=>{
    let sql = 'select * from menus',
    { type } = req.user,
    one , two , three ;

    db( sql, res ).then(sqldata=>{
        one = sqldata.filter(item=>item.hierarchy == 1).sort((a,b)=>a.sequence - b.sequence);
        two = sqldata.filter(item=>item.hierarchy == 2).sort((a,b)=>a.sequence - b.sequence);
        three = sqldata.filter(item=>item.hierarchy == 3).sort((a,b)=>a.sequence - b.sequence);

        one.forEach(item=>{
            item.conclude = true;
            item.type = item.type? true : false;
        })
        
        two.forEach(item=>{
            item.conclude = one.some(i=>JSON.parse(i.children).includes(item.id) && JSON.parse( i.astrict ).includes(type) );
            item.type = item.type? true : false;
        })

        three.forEach(item=>{
            item.conclude = two.some(i=>JSON.parse(i.children).includes(item.id) && JSON.parse( i.astrict ).includes(type));
            item.type = item.type? true : false;
        })
        
        res.send({
            ...utilSuccess,
            data:[ one, two, three]
        })
    })

})

// 获取层级菜单
router.get('/getMenus', (req,res)=>{
    let sql = 'select * from menus',
    { type } = req.user,
    one , two , three ;

    db( sql , res ).then(sqldata=>{
        one = sqldata.filter(item=>item.hierarchy == 1).sort((a,b)=>a.sequence - b.sequence);
        two = sqldata.filter(item=>item.hierarchy == 2).sort((a,b)=>a.sequence - b.sequence);
        three = sqldata.filter(item=>{
            item.type = item.type? true : false;
            return item.hierarchy == 3
        }).sort((a,b)=>a.sequence - b.sequence);

        two.forEach(item=>{
            let childrens = JSON.parse(item.children);
            item.children = childrens.length?three.filter(k =>childrens.includes(k.id) && JSON.parse( item.astrict ).includes(type) ):[];
            item.type = item.type? true : false;
        })
        one.forEach(item=>{
            let childrens = JSON.parse(item.children);
            item.children = childrens.length?two.filter(k =>childrens.includes(k.id) && JSON.parse( item.astrict ).includes(type) ):[];
            item.type = item.type? true : false;
        })
        
        res.send({
            ...utilSuccess,
            data:one
        })
    })
})

// 修改菜单
router.post('/updateMenus', userTypeFn ,  (req,res)=>{
    let { viewPath ,  icon , title , sequence , name , children , hierarchy , astrict, id , type } = req.body;
    let sql = 'update menus set viewPath=?,icon=?,title=?,sequence=?,name=?,children=?,hierarchy=?,astrict=?,type=? where id=?';

    db( sql , res ,[viewPath ,  icon , title , sequence , name , JSON.stringify(children) , hierarchy , JSON.stringify(astrict), type?1:0 , id ] ).then(sqldata=>{
        if (sqldata.affectedRows === 1) {
            res.send({
                ...utilSuccess,
                msg:"修改菜单成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg: "修改菜单失败",
            })
        }
    })
})

// 获取某个菜单下能添加的子集
router.get('/getCanAddSubset',(req,res)=>{
    let { hierarchy , children } = req.query,
    sql = 'select id,title from menus where hierarchy=?;select children from menus where hierarchy=?',
    u = [];
    db(sql , res ,[ Number(hierarchy) + 1, hierarchy ]).then(sqldata=>{
        
        sqldata[1].forEach(item=>{
            // 因为 children字符串经过JSON.stringify后和原来的字符串不相等，所以需要对item.children也进行转换。
            let ch = JSON.stringify(item.children);
            let chj = JSON.parse(item.children);
            // 用来存放所有所有同级的子集，并不包含自己的子集。
            ch != children? u = u.concat(chj):"";
        })
        res.send({
            code:200,
            data:sqldata[0].filter( item => !u.includes(item.id) )
        })
    })
})

// 删除菜单
router.post('/deleteMenu', userTypeFn, regMenuBeEnclosed , (req,res)=>{
    let { id } = req.body,
    sql = 'delete from menus where id=?';
    db( sql , res , [ id ]).then(sqldata=>{
        if(sqldata.affectedRows){
            res.send({
                ...utilSuccess,
                msg:"删除成功"
            })
        }else{
            res.send({
                ...utilErr,
                msg:"删除失败"
            })
        }
    })
})



module.exports = router;