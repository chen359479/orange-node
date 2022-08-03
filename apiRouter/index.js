module.exports = {
    activate : (app)=>{
        // pc端
        app.use('/unapi', require('./pcApi/login'));
        app.use('/api',   require('./pcApi/user'));
        app.use('/api',   require('./pcApi/broadcast'));
        app.use('/api',   require('./pcApi/menus'));
        app.use('/api',   require('./pcApi/system'));
        app.use('/api',   require('./pcApi/wxuser'));

        // 功能性接口
        app.use('/api',   require('./functionApi/functionApi'));

        // 小程序端
        app.use('/unwx',   require('./wxApi/wxlogin'));
        app.use('/wxapi',   require('./wxApi/wxuser'));


        // 文章-通用
        app.use('/unapi',   require('./article/list'));
        app.use('/unapi',   require('./article/class'));
        app.use('/api',   require('./article/content'));
    }
}