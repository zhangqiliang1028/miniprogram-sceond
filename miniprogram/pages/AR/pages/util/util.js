
function responseClichObj(name,position) {
  console.log("调用外部函数点击了",name,",位置是",position);
  
}
module.exports = {
  responseClichObj: responseClichObj,
}