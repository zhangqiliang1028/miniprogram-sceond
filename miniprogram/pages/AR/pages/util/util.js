
import { createScopedThreejs } from '../../../../threejs-miniprogram/index'
var THREE;
function responseClichObj(obj,THREE,scene) {
  
  var pos = obj.object.position;
  console.log("调用外部函数responseClichObj",obj);
  var geometry = new THREE.PlaneBufferGeometry(50, 30);
  var material = new THREE.MeshPhongMaterial({
    color:0xff9900, //颜色
    opacity:0.4,  //透明度
    transparent:true,  //是否开启透明度
    wireframe:false, //将几何图形渲染为线框。 默认值为false
    shininess:12, //高光
    side:THREE.DoubleSide, //双面显示材质
  }); //材质对象Material
  var object = new THREE.Mesh(geometry, material); // 创建网格模型对象

  object.normal = new THREE.Vector3(0, 1, 0); //方向
  object.position.set(0,0,0); //位置旋转
  object.translateY(object.scale.y/2); //平移
  object.translateX(object.scale.x/2); //平移
  object.translateZ(obj.object.scale.z/2+20); //平移
  //object.scale.set(1, 1, 1 ) //放缩
  object.rotateX(-obj.object.rotation.x);//绕x轴旋转π/4
  object.rotateY(-obj.object.rotation.y);//绕x轴旋转π/4
  object.rotateZ(-obj.object.rotation.z);//绕x轴旋转π/4
  console.log(object.rotation);
  obj.object.add(object);
  console.log("物体：",object);
  
  

  function drawPerson(){
      // 头部网格模型和组
    var headMesh = sphereMesh(10, 0, 0, 0);
    headMesh.name = "脑壳"
    var leftEyeMesh = sphereMesh(1, 8, 5, 4);
    leftEyeMesh.name = "左眼"
    var rightEyeMesh = sphereMesh(1, 8, 5, -4);
    rightEyeMesh.name = "右眼"
    var headGroup = new THREE.Group();
    headGroup.name = "头部"
    headGroup.add(headMesh, leftEyeMesh, rightEyeMesh);
    // 身体网格模型和组
    var neckMesh = cylinderMesh(3, 10, 0, -15, 0);
    neckMesh.name = "脖子"
    var bodyMesh = cylinderMesh(14, 30, 0, -35, 0);
    bodyMesh.name = "腹部"
    var leftLegMesh = cylinderMesh(4, 60, 0, -80, -7);
    leftLegMesh.name = "左腿"
    var rightLegMesh = cylinderMesh(4, 60, 0, -80, 7);
    rightLegMesh.name = "右腿"
    var legGroup = new THREE.Group();
    legGroup.name = "腿"
    legGroup.add(leftLegMesh, rightLegMesh);
    var bodyGroup = new THREE.Group();
    bodyGroup.name = "身体"
    bodyGroup.add(neckMesh, bodyMesh, legGroup);
    // 人Group
    var personGroup = new THREE.Group();
    personGroup.name = "人"
    personGroup.add(headGroup, bodyGroup)
    personGroup.position.set(0,0,0);
    personGroup.translateY(50)
    obj.object.add(personGroup);
  }
  // 圆柱体网格模型创建函数
  function sphereMesh(R, x, y, z) {
    var geometry = new THREE.SphereGeometry(R, 25, 25); //球体几何体
    var material = new THREE.MeshPhongMaterial({
      color: 0x0000ff
    }); //材质对象Material
    var mesh = new THREE.Mesh(geometry, material); // 创建网格模型对象
    mesh.position.set(x, y, z);
    return mesh;
  }
  
function cylinderMesh(R, h, x, y, z) {
  var geometry = new THREE.CylinderGeometry(R, R, h, 25, 25); //球体几何体
  var material = new THREE.MeshPhongMaterial({
    color: 0x0000ff
  }); //材质对象Material
  var mesh = new THREE.Mesh(geometry, material); // 创建网格模型对象
  mesh.position.set(x, y, z);
  return mesh;
}
}
// 球体网格模型创建函数


function changePage(url,res){
    console.log("调用外部函数实现页面跳转")
    
}
module.exports = {
  responseClichObj: responseClichObj,
  changePage:changePage,
}