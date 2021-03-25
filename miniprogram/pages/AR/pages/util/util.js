
//import { createScopedThreejs } from '../../../../threejs-miniprogram/index'
function responseClickObj(obj,pos,THREE,ctx) {
  var tapWidth,tapHeight;
  var object,geometry,textureLoader;

  if(obj.name == "长方体"){
    //rectangle();
    //showToast();
    //showModal();
    //showActionSheet();
    ctxDraw();
    console.log("物体：",obj.children.length);
    obj.traverse(function(res) {  //查找所有子物体
        console.log(res.name);
      })
  }else if(obj.name == "箭头"){
    
  }else if(obj.name == "subrectangle"){  //界面跳转
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
  
  function ctxDraw(){ //在canvas2d上绘制内容,位置是pos
    var x = pos[0],y = pos[1];
    ctx.setFillStyle('lightgreen') //颜色
    ctx.moveTo(x,y); //无痕迹线
    ctx.lineTo(x +30,y+20)  //有痕迹线
    ctx.lineTo(x+100,y+20)
    ctx.lineTo(x+100,y+60)
    ctx.lineTo(x +30,y+60)
    ctx.lineTo(x,y)
    const grd = ctx.createLinearGradient(x +30,y+20,x+100,y+20) //线性渐变
    grd.addColorStop(0, 'red')
    //grd.addColorStop(0.5, 'green')
    grd.addColorStop(1, 'lightblue')
    // Fill with gradient
    ctx.setFillStyle(grd)
    ctx.fillRect(x +30,y+20,70,40)
    ctx.setFontSize(10)  //字体大小
    ctx.setFillStyle('blue') //填充模式
    ctx.fillText("Hello,World!",x+35,y+40) //文本
    ctx.setStrokeStyle('#ffffff')
    ctx.stroke() //显示痕迹
    ctx.draw()  //绘制内容，添加参数true则保留之前绘制的内容
    function tt(){
      ctx.draw()
    }
    setTimeout(tt,5000)
  }

  function rectangle(){  //点击长方体后显示图片提示
    console.log("调用外部函数responseClickObj");
    tapWidth = obj.scale.x*5;
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
      //map:new THREE.CanvasTexture(getTextCanvas('Leo Test Label'))
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
  
  function showToast(){  //一个对号提示
    wx.showToast({
      title: '成功',
      icon: 'success',
      duration: 2000,
      mask:true,
      
    })
  }
  
  function showModal(){  //显示模态对话框
    wx.showModal({
      title: '提示',
      content: '是否查看场馆详情？',
      //editable:true,
      placeholderText:"请输入场馆名称",
      cancelText:"否",
      confirmText:"是",
      //confirmColor:0x00ff00,
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
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
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })    
  }
  
  function showActionSheet(){
    wx.showActionSheet({
      itemList: ['A', 'B', 'C'],
      success (res) {
        console.log(res.tapIndex)
        if(res.tapIndex == 0){
          console.log("跳转到详情页面");
        }
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })    
  }
  function getTextTexture(text){   //渲染文字

    var width=tapWidth, height=tapHeight; 
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#C3C3C3';
    ctx.fillRect(0, 0, width, height);
    ctx.font = 50+'px " bold';
    ctx.fillStyle = '#2891FF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width/2,height/2); 
    return canvas;
    }
  
  function drawPerson(){    //画人
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
  
  function sphereMesh(R, x, y, z) {    // 圆柱体网格模型创建函数
    var geometry = new THREE.SphereGeometry(R, 25, 25); //球体几何体
    var material = new THREE.MeshPhongMaterial({
      color: 0x0000ff
    }); //材质对象Material
    var mesh = new THREE.Mesh(geometry, material); // 创建网格模型对象
    mesh.position.set(x, y, z);
    return mesh;
  }
  
  function cylinderMesh(R, h, x, y, z) {    // 球体网格模型创建函数
    var geometry = new THREE.CylinderGeometry(R, R, h, 25, 25); //球体几何体
    var material = new THREE.MeshPhongMaterial({
      color: 0x0000ff
    }); //材质对象Material
    var mesh = new THREE.Mesh(geometry, material); // 创建网格模型对象
    mesh.position.set(x, y, z);
    return mesh;
  }
}
function toDetailPage(obj){
  wx.navigateTo({
    url: '../rectangle/rectangle?name='+obj.name+'&id='+obj.id+'&address='+obj.address+'&distance='+obj.distance+'&direction='+obj.direction,
  })
}

module.exports = {
  responseClickObj: responseClickObj,
  toDetailPage:toDetailPage,
}