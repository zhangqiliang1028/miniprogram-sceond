
//import { createScopedThreejs } from '../../../../threejs-miniprogram/index'
function responseClickObj(obj,THREE,scene) {
  var object,geometry,textureLoader;
  if(obj.name == "长方体"){
    rectangle();
    console.log("物体：",obj.children.length);
    obj.traverse(function(res) {
        console.log(res.name);
      })
  }else if(obj.name == "箭头"){
    
  }else if(obj.name == "subrectangle"){
    wx.navigateTo({
      url: '../rectangle/rectangle',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage: function(data) {
          console.log(data)
        },
        someEvent: function(data) {
          console.log(data)
        }
      },
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
      }
    })
  }
  
  function rectangle(){
    console.log("调用外部函数responseClickObj");
    var tapWidth = obj.scale.x*5,
    tapHeight = obj.scale.y*3;
      
    geometry = new THREE.PlaneBufferGeometry(tapWidth, tapHeight);
    textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('../util/1.jpg');
    var material = new THREE.MeshPhongMaterial({
      //color:0xff9900, //颜色
      opacity:0.8,  //透明度
      transparent:false,  //是否开启透明度
      wireframe:false, //将几何图形渲染为线框。 默认值为false
      shininess:12, //高光
      side:THREE.DoubleSide, //双面显示材质
      map: texture,//设置颜色贴图属性值
    }); //材质对象Material
    texture.minFilter = THREE.LinearFilter;
    object = new THREE.Mesh(geometry, material); // 创建网格模型对象
    object.normal = new THREE.Vector3(0, 1, 0); //方向
    //object.position.set(0,0,0); //位置旋转
    object.translateY(4); //平移
    //object.translateX(object.scale.x*10); //平移
    object.translateZ(7); //平移
    //object.scale.set(1, 1, 1 ) //放缩
    object.rotateX(-obj.rotation.x);//绕x轴旋转π/4
    object.rotateY(-obj.rotation.y);//绕x轴旋转π/4
    object.rotateZ(-obj.rotation.z);//绕x轴旋转π/4
    object.name = "subrectangle";
    obj.add(object);
    
  }
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
  responseClickObj: responseClickObj,
  changePage:changePage,
}