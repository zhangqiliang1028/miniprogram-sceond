// pages/AR/pages/minMap/minMap.js
var amapFile = require('../../../../libs/amap-wx');
var util = require('../util/util')
import { createScopedThreejs } from '../../../../threejs-miniprogram/index'
var camera,canvas,canvas2d,scene,THREE,light,raycaster,renderer,ctx,gl,MapContext,amap;//高德地图
var object,buildGroup,tapedObjs=[];
var mouse;
Page({
  data: {
    screenHeight: wx.getSystemInfoSync().windowHeight,
    screenWidth: wx.getSystemInfoSync().windowWidth,
    currentLocScreen:[0,0],
    tip:null,
    alpha:0, //东西南北，范围值为 [0, 2*PI)。逆时针转动为正。
    beta:0,  //上下前后，范围值为 [-1*PI, PI)。顶部朝着地球表面转动为正。也有可能朝着用户为正。
    gamma:0,  //左右，范围值为 [-1*PI, PI)。右边朝着地球表面转动为正
    key: '2006539e53e460b0de628886ac9b0b36',
    show: true,
    isResearch:false,
    isLocationListen:false,
    isDeviceListen:false,
    researchInfo:'搜索',
    currentLocationInfo:'',
    currentLo : null,
    currentLa : null,
    currentDirection:null,
    distance : 0,
    duration : 0,
    markers : null,
    polyline: null,
    statusType: 'walk',
    includePoints:[],
    setting : {
      skew: 0,
      rotate: 0,
      scale: 18,
      showScale: true,
      enablescroll:false,
    }
  },
  onLoad(){
    var that = this;
    amap = new amapFile.AMapWX({ key: this.data.key });
    const query = wx.createSelectorQuery()
    query.select('#webgl')
      .node()
      .exec((res) => {
        canvas = res[0].node;
        that.canvas = canvas;
        THREE = createScopedThreejs(that.canvas);
        console.log(THREE)
        gl = canvas.getContext('webgl', { alpha: true });
        that.init();
        that.render();
        console.log("屏幕宽高：["+that.data.screenWidth+","+that.data.screenHeight+"]");
      })
    MapContext = wx.createMapContext('map' )
    wx.openSetting({
      success (res) {
        console.log(res.authSetting)
         res.authSetting = {
           "scope.userInfo": true,
           "scope.userLocation": true
         }
      }
    })
    wx.getLocation({
      type: 'gcj02',
      success(res){
        that.setData({ 
          currentLo: res.longitude, 
          currentLa: res.latitude,
          setting:{

          },
          markers: [{
            id: 0,
            longitude: res.longitude,
            latitude: res.latitude,
            title:"当前位置",
            iconPath: '../map/images/location.png',
            width: 32,
            height: 32
          }]
        });
        //console.log(that.data.markers)
      }
    })
    that.getAround();
  },
  getAround(){
    var that = this;
    amap.getPoiAround({
      success: function(res){
        //成功回调
        //console.log(res.markers)
        var markers = that.data.markers;
        var l = markers.length;
        for(let i=l;i<l+res.markers.length;i++){ 
          markers.push({
            id: i,
            longitude: res.markers[i-l].longitude,
            latitude: res.markers[i-l].latitude,
            title: res.markers[i-l].address,
            iconPath: '../map/images/1.jpg',
            width: 16,
            height: 16,
          });
        }
        that.setData({
          markers: markers,
        });
        //console.log("markers中的内容:",that.data.markers)
      },
      fail: function(info){
        //失败回调
        console.log(info)
      }
    })
  },
  getAddress(e){
    var that = this;
    wx.chooseLocation({
      success(res){
        var markers = that.data.markers;
        markers.push({
          id: 0,
          longitude: res.longitude,
          latitude: res.latitude,
          title: res.address,
          iconPath: './images/1.jpg',
          width: 32,
          height: 32
        });
 
        var points = that.data.includePoints;
        points.push({
          longitude: res.longitude,
          latitude: res.latitude
        });
        that.setData({
          includePoints: points,
          markers: markers,
          show:true
        });
        that.getPolyline(_this.data.statusType);
      }
    });
  },
  init:function() {
    camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 1, 10000);
    scene = new THREE.Scene();
    scene.name = "场景";
    var axisHelper = new THREE.AxesHelper(250);
    scene.add(axisHelper);
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(0,0);
    light = new THREE.PointLight();
    light.position.set(0, 10, 0).normalize();
    scene.add(light);
    this.getManyShape();//场景中添加各种形状的物体
    let geometry = new THREE.DodecahedronGeometry(5);
    object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    object.name = "preObject"
    //scene.add(object);
    renderer = new THREE.WebGLRenderer({
      canvas:canvas,
      antialias:true,
      alpha:true
    });
    renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
    renderer.setSize(canvas.width, canvas.height);
  },
  render:function() {
    if(this.data.alpha<=180){
      //camera.rotation.y = -this.data.alpha/360*Math.PI*2;
    }else{
      //camera.rotation.y = -(this.data.alpha-360)/360*Math.PI*2;
    }
    camera.rotateY(0.01)
    renderer.render(scene, camera);
    canvas.requestAnimationFrame(this.render); //循环执行渲染
  },
  touchstart(e){
    //console.log(e)
  },
  touchmove(e){
    //console.log(e)
  },
  touchcancel(e){
    //console.log(e)
  },
  touchend(e){
    //console.log(e)
  },
  touchTap(e){
    var that= this;
    this.setData({
      mytouch:[e.touches[0].pageX,e.touches[0].pageY]
    })
    this.raycaster(this.data.mytouch);
    if(tapedObjs.length>0){
      this.setData({
        objname:tapedObjs[0].object.name,
      })
      that.setData({
        tip:'888'
      })
        //转到点击目标的详情页面
        util.toDetailPage(tapedObjs[0].object);
    }else{
      this.setData({
        objname:null,
      })
    }
    this.setData({
      info:"点击了一下"+this.data.objname
    })
  },
  longpress(e){
    //console.log(e)
  },
  //--------------------------------------------------------------------
  onHide: function (e){
    var that = this;
    if(that.data.isLocationListen){
      wx.stopLocationUpdate({})
      that.setData({
        isLocationListen:false
      })
    }
    if(that.data.isDeviceListen){
      wx.stopDeviceMotionListening({})
      that.setData({
        isDeviceListen:false
      })
    }
  },
  return(){
    wx.navigateBack({
    delta: 1
  })
  },
  raycaster:function(e){
    mouse.x = (e[0] / this.data.screenWidth) * 2 - 1;
    mouse.y = -(e[1] / this.data.screenHeight) * 2 + 1;
    console.log(mouse.x+" "+mouse.y);
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children,true); //object检测与射线相交的物体,recursive为true检查后代对象，默认值为false
    tapedObjs.splice(0);
    if(intersects.length>0){
      for(let i=0;i<intersects.length;i++){
        tapedObjs.push(intersects[i]);
      }
      
    }
    console.log("点击到的物体数量："+tapedObjs.length);
  },
  research(){
    var that = this;
    if(!that.data.isResearch){
      //设置一个组，所有检测到的目标加入到组中
      buildGroup = new THREE.Group()
      scene.add(buildGroup);
      that.setData({
        researchInfo:'搜索中...',
        isResearch:true,
      })
      wx.startDeviceMotionListening({
        success:function(){
          console.log("开始设备监听")
          that.setData({
            isDeviceListen:true,
          })
        }
      })
      wx.startLocationUpdate({
        success: (res) => {
          console.log("开始位置监听")
          that.setData({
            isLocationListen :true,
          })
        },
      })
      wx.onDeviceMotionChange(function (res) {
          console.log(res)
          let alpha = res.alpha.toFixed(2);
          //var beta = parseFloat(res.beta);
          //var gamma = parseFloat(res.gamma);
            that.setData({
              alpha: alpha,
              //beta: parseInt(beta) - parseInt(beta)%0.1,
              //gamma: parseInt(gamma) - parseInt(gamma)%0.1,
            })
      })
    
      wx.onLocationChange((result) => {
        that.setData({
          currentLo:result.longitude,
          currentLa:result.latitude
        })
        MapContext.toScreenLocation({
          latitude:this.data.currentLa,
          longitude:this.data.currentLo,
          success:function(res){
            console.log("当前位置:",res.x,res.y);
            that.setData({
              currentLocScreen:[res.x,res.y],
            })
          }
        })
      })
      that.showBuild()
    }
    else{
      scene.remove(buildGroup);
      wx.stopDeviceMotionListening({
        success: (res) => {
          console.log('设备监听结束')
          that.setData({
            isDeviceListen:false,
          })
        },
      })
      wx.stopLocationUpdate({
        success: (res) => {
          console.log('位置监听结束')
          that.setData({
            isLocationListen:false,
          })
        },
      })
      that.setData({
        researchInfo:'搜索',
        isResearch:false,
      })
    }
    
  },
  showBuild:function(){
    var that = this;
    
    MapContext.toScreenLocation({
      latitude:this.data.currentLa,
      longitude:this.data.currentLo,
      success:function(res){
        console.log("当前位置:",res.x,res.y);
        that.setData({
          currentLocScreen:[res.x,res.y],
        })
      }
    })
    
    var mm = this.data.markers
    for(let key in mm){
      if(mm[key].title!="当前位置"){
        //that.drawBuildings(mm[key],{x:Math.random()*700-350,y:Math.random()*800-400})
        MapContext.toScreenLocation({
          latitude:mm[key].latitude,
          longitude:mm[key].longitude,
          success:function(res){
              that.drawBuildings(mm[key],res)
          }
        })
      }
    }
  },
  drawBuildings:function(obj,pos){
    let _X = (pos.x - this.data.currentLocScreen[0]);
    let _Y = (pos.y - this.data.currentLocScreen[1]);
    
    let co = object.clone();
    //co.position.set(_X*(Math.random()*50+50),Math.random()*60-30,_Y*(Math.random()*50+50));
    co.position.set(_X/2,Math.random()*60-30,_Y/2);
    co.lookAt(camera.position)
    let pp = this.getPlane(10,6,obj.title)
    //let pp = this.getText(10,6,obj.title)
    pp.position.set(4,7.5,0)
    co.add(pp)
    buildGroup.add(co);
  },
  getPlane:function(w,h,name){
        // 创建一个平面对象Plane
        let geometry = new THREE.PlaneBufferGeometry(w,h)
        // 设置平面法线方向
        geometry.normal = new THREE.Vector3(0, 0, 1);
        // 坐标原点到平面的距离，区分正负
        //geometry.constant = 100;
        var textureLoader = new THREE.TextureLoader();
        var texture = textureLoader.load('../util/1.jpg');
        var material = new THREE.MeshPhongMaterial({
          //color:0xffffff, //颜色
          //opacity:1,  //透明度
          transparent:false,  //是否开启透明度
          wireframe:false, //将几何图形渲染为线框。 默认值为false
          //shininess:12, //高光
          //side:THREE.DoubleSide, //双面显示材质
          map: texture,//设置颜色贴图属性值
        }); //材质对象Material
        texture.minFilter = THREE.LinearFilter;
        var plane = new THREE.Mesh(geometry, material); // 创建网格模型对象
        return plane;
  },
  getText:function(w,h,name){
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        canvas2d = res[0].node
        ctx = canvas2d.getContext('2d')
        canvas2d.width = 300
        canvas2d.height = 300
      })
  //制作矩形
  ctx.fillStyle = "rgba(255,165,0,0.8)";
  ctx.fillRect(0, 0, 300, 300)
   //设置文字
   ctx.fillStyle = "#fff";
   ctx.font = 'normal 18pt "楷体"'
   ctx.fillText('模型介绍', 100, 20)
   let textWord = '该模型由小少小同学制作完成'
   //文字换行
   let len = parseInt(textWord.length / 10)
   for (let i = 0; i < (len + 1); i++) {
     let space = 10
     if (i === len) {
       space = textWord.length - len * 10
     }
     console.log('len+' + len, 'space+' + space)
     let word = textWord.substr(i * 10, space)
     ctx.fillText(word, 15, 60*(i+1))
   }
   //生成图片
  let url = canvas2d.toDataURL('image/png');
  let geometry1 = new THREE.PlaneGeometry(30, 30)
  let texture = THREE.ImageUtils.loadTexture(url, null, function (t) {})
  let material1 = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    opacity: 1,
    transparent: true,
  })
  let rect = new THREE.Mesh(geometry1, material1)
  rect.position.set(0, 0, -100)
  scene.add(rect)
  //return rect;

  },
  getManyShape:function(){
    let arr = [];
    //长方体 参数：长，宽，高
    var box = new THREE.BoxGeometry(100, 100, 100);
    arr.push(box)
    // 球体 参数：半径60  经纬度细分数40,40
    var sphere = new THREE.SphereGeometry(60, 40, 40);
    arr.push(sphere)
    // 圆柱  参数：圆柱面顶部、底部直径50,50   高度100  圆周分段数
    var cylinder = new THREE.CylinderGeometry( 50, 50, 100, 25 );
    arr.push(cylinder)
    // 正八面体
    var octahedron = new THREE.OctahedronGeometry(50);
    arr.push(octahedron)
    // 正十二面体
    var dodecahed = new THREE.DodecahedronGeometry(50);
    arr.push(dodecahed)
    // 正二十面体
    var icosahedron = new THREE.IcosahedronGeometry(50);
    arr.push(icosahedron)
    for(let j =0 ;j<100; j++){
      for(let i=0;i<arr.length;i++){
        let material = new THREE.MeshPhongMaterial({
          color:Math.random()*0xffffff, //颜色
        }); //材质对象Material
        var mesh = new THREE.Mesh(arr[i], material); // 创建网格模型对象
        let x = (Math.random()*800-400)
        let z = (Math.random()*800-400)
        mesh.position.set(x,Math.random()*800-400,z);
        mesh.scale.set(0.3,0.3,0.3)
        scene.add(mesh)
      }
    }
  },
})