// 第三方中间件
const os = require('os');
const osUtils = require('os-utils');
const d = require('diskinfo'); 

// 公共参数
const { router , utilSuccess } = require('../../util/util');

router.get('/systemInfo',(req,res)=>{
    // 操作系统名称
    let type = os.type();
    // 处理器架构
    let arch = os.arch();
    // 主机名称
    let hostname = os.hostname();
    //cup总数
    let cpuCount = osUtils.cpuCount();
    // 当前空闲内存
    let freemem = osUtils.freemem();
    // 总内存
    let totalmem = osUtils.totalmem();
    // 当前可用内存百分比
    let freememPercentage = osUtils.freememPercentage();
    // 系统运行的秒数
    let sysUptime = osUtils.sysUptime();

    // 获取进程已运行的秒数
    let processUptime = osUtils.processUptime();
    // 获取每5分钟的平均负载
    let loadavg = osUtils.loadavg(5);

    // 磁盘信息
    d.getDrives(function (err, aDrives) {
        let arr = [];
        res.send({
            ...utilSuccess,
            data:{
                arch,
                hostname,
                cpuCount,
                freemem,
                totalmem,
                freememPercentage,
                sysUptime,
                processUptime,
                loadavg,
                type,
                aDrives:aDrives.filter(item=>{
                    if( item && !arr.includes(item.mounted) ){
                        arr.push(item.mounted);
                        return item
                    }
                })
            }
        })
    })
})


module.exports = router;