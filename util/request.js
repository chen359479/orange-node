const axios = require('axios');

// 处理axios
axios.defaults.timeout = 2000000;      //响应时间
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";  //配置请求头

//POST传参序列化(添加请求拦截器)
axios.interceptors.request.use((config) => {
    //在发送请求之前做某件事
    // config.headers.Accept="appliaction/json,text/plan";
    if (config.method === "post") {
        config.data = qs.stringify(config.data);
    }
    return config;
}, (error) => {
    console.log("错误的传参")
    return Promise.reject(error);
});
axios.interceptors.response.use((res) => {
    //对响应数据做些事
    if (!res.data) {
        return Promise.resolve(res);
    }
    return res;
}, (error) => {
    return Promise.reject(error);
});

//返回状态判断(添加响应拦截器)
axios.interceptors.response.use((res) => {
    //对响应数据做些事
    if (!res.status == 200) {
        return Promise.resolve(res);
    }
    return res.data;
}, (error) => {
    console.log("网络异常")
    return Promise.reject(error);
});

module.exports = { axios }