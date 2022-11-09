
// format time string
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "H+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S+": this.getMilliseconds() //毫秒 
    }
    
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
    };
  
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
    }
    return fmt;
  }
var time2 = new Date().Format("yyyy-MM-ddTHH:mm:ss.SSSZ"); // ISO
var time_customized3 = new Date().Format("yyyyMMddHHmmss")

function customizeformat1(condensedObject){
    const x = condensedObject
    var y = {}
    y.mindSphereAssetId = x.configurationId//like ComboMachineSensor_20200910
    y.dataType = x.queueRedis//this serves as MindPower Redis require...
    y.fields = {}
    for (let index = 0; index < x.timeseries.length; index++) {
        const sample = x.timeseries[index]
        
        y.fields[sample.key] = sample.value
        y.timestep = new Date(sample._time).Format("yyyyMMddHHmmss")//Math.floor( + new Date(sample._time) /* / 1000 */)
    }
    return y
}

module.exports={
  remote: client
}