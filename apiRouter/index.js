module.exports = {
    activate : (app)=>{
        // pc端
        app.use('/unApi', require('./pcApi/login'));
        app.use('/api',   require('./pcApi/user'));
        app.use('/api',   require('./pcApi/broadcast'));
        app.use('/api',   require('./pcApi/menus'));
        app.use('/api',   require('./pcApi/system'));
        app.use('/api',   require('./pcApi/wxuser'));
        app.use('/api',   require('./document'));
        app.use('/api',   require('./car'));
        app.use('/api',   require('./car/info'));

        // 功能性接口
        app.use('/unApi',   require('./functionApi/functionApi'));

        // 小程序端
        app.use('/unwx',   require('./wxApi/wxlogin'));
        app.use('/wxApi',   require('./wxApi/wxuser'));


        // 文章-通用
        app.use('/unApi',   require('./article/list'));
        app.use('/unApi',   require('./article/class'));
        app.use('/api',   require('./article/content'));

        // 订单
        app.use('/api',   require('./order/order'));
    }
}