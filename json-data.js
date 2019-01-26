/**
 * 生成对应的key
 * @param {number} count 数量
 */
function getKeyList(count) {
  count = count || 1;
  var res = [];
  for (var i = 0; i < count; i++) {
    res.push({
      key: i,
      title: "四方馆" + i,
      text: "四方馆是个牛逼的公司" + i,
      "bgSrc": "./images/bg01.png",
      "iconSrc": "./images/icon01.png"
    });
  }
  return res;
}
 function getKeyPositionList(count) {
   var res = [];
   for (var i = 0; i < count; i++) {
    res.push({
      from: i,
      to: i+1
    });
   }
   return res;
 }
var DEMO_JSON_DATA = [
  getKeyList(10),getKeyPositionList(10)
];
