

// 去除空格
function myTrim(x) {
  return x.replace(/^(\s*)|(\s*)$/g, '');
}

// 几个小时前的提示字样
function transformPHPTime(time) {
  var timestamp = Date.parse(new Date()); //当前时间戳
  var timestime = time * 1000
  var disparity = timestamp - timestime
  if (disparity < 3600000) {
    if (parseInt(disparity / 60000) == 0)
      return '刚刚'
    return parseInt(disparity / 60000) + '分钟前'
  }
  if (disparity < 86400000) {
    return parseInt(disparity / 3600000) + '小时前'
  }
  if (disparity < 86400000 * 8 && disparity > 86400000 * 1) {
    if (parseInt(disparity / 86400000) == 1)
      return '昨天'
    if (parseInt(disparity / 86400000) == 2)
      return '前天'
    return parseInt(disparity / 86400000) + '天前'
  }
  var date = new Date(timestime)
  let Y = date.getFullYear() + '-';
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  let D = date.getDate() + ' ';
  return Y + M + D
}


module.exports = {
  myTrim,
  transformPHPTime
}