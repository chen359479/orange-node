const { app , express , secret } = require('./util/util');
const path = require('path');
const cors = require("cors");
const expressJWT = require("express-jwt");
const multer = require('multer');  // 解析上传的文件
const upload = multer(); // 设定要将文件存储在哪里



// 解决跨域问题
app.use(cors());

// 将vue打包后的静态资源dist文件对外暴露,
// app.use(express.static(path.join(__dirname,'dist')));

// 对外暴露上传的文件的地址
app.use('/files',express.static(path.join(__dirname,'files')));

//挂载上传文件中间件
app.use(upload.single('file'));

// 解析token, 并将其挂载到req的user上       指定不需要解析和验证token的路由，可写多个自定义验证规则（在此仅匹配以unapi开头）
app.use(expressJWT({ secret: secret ,algorithms:['HS256']}).unless({path:[/^\/unApi\//,/^\/unwx\//]}))

// 配置解析前端传来的参数
app.use(express.json());
app.use(express.urlencoded());


// 调用定义的路由
require('./apiRouter/index').activate(app);

// 配置错误中间件，捕捉错误异常！
app.use((err,req,res,next)=>{
    if(err.name === "UnauthorizedError" ){ //这个是捕捉token
        res.send({
            code: 401 ,
            msg: "token验证失败",
            status: false,
        })
    }else if(err){
        res.send({
            code: 500,
            msg: err.message,
            status: false,
        })
    }
})

app.listen(8199)