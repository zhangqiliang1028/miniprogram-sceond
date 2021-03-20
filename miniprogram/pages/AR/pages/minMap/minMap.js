// pages/AR/pages/minMap/minMap.js
var amapFile = require('../../../../libs/amap-wx');
var util = require('../util/util')
import { createScopedThreejs } from '../../../../threejs-miniprogram/index'
var camera,canvas,scene,THREE,light,raycaster,renderer,ctx,gl,MapContext,amap;//高德地图
var object,buildGroup,tapedObjs=[];
var mouse;
Page({
  data: {
    screenHeight: wx.getSystemInfoSync().windowHeight,
    screenWidth: wx.getSystemInfoSync().windowWidth,
    currentLocScreen:[0,0],
    tip:[],
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
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(0,0);
    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    let geometry = new THREE.DodecahedronGeometry(3);
    object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    object.position.z =  -100;
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
    /*
    object.material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })
    if(Math.abs(object1scale)>0.0001){
      if(object.scale.x>1.5||object.scale.x<0.7){
        object1scale = -1*object1scale;
      }
      object.scale.x+=object1scale;
      object.scale.y+=object1scale;
      object.scale.z+=object1scale;
    }
    */
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
    this.setData({
      mytouch:[e.touches[0].pageX,e.touches[0].pageY]
    })
    this.raycaster(this.data.mytouch);
    if(tapedObjs.length>0){
      this.setData({
        objname:tapedObjs[0].object.name,
      })
      
      if(tapedObjs[0].object.name == ' '){
        //转到点击目标的详情页面
      }
    }else{
      this.setData({
        objname:tapedObjs[0].object.name,
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
      buildGroup = new THREE.Group();
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
          var alpha = parseFloat(res.alpha);
          var beta = parseFloat(res.beta);
          var gamma = parseFloat(res.gamma);
          that.setData({
            alpha: alpha,
            beta: beta,
            gamma: gamma,
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
      //clearInterval(timer1)
      scene.remove(buildGroup)
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
        MapContext.toScreenLocation({
          latitude:mm[key].latitude,
          longitude:mm[key].longitude,
          success:function(res){
            //console.log(mm[key].title,':',res.x,res.y);
            that.setData({
              
            })
            if(that.isSameOriention(res)){
              that.drawBuildings(mm[key],res)
            }
          }
        })
      }
    }
    //var timer1 = setInterval(that.showBuild,1000);
  },
  removeBuild:function(obj){
    buildGroup.remove(obj);
  },
  drawBuildings:function(name,pos){
    let co = object.clone();
    co.position.x = Math.random()*50 - 25;
    co.position.y = Math.random()*50 - 25;
    let pp = this.getPlane(10,6,name.title)
    pp.position.set(6,4,4)
    co.add(pp)
    buildGroup.add(co)
  },
  isSameOriention:function(res){
    let _X = res.x- this.data.currentLocScreen[0];
    let _Y = res.y- this.data.currentLocScreen[1];
    let angle = this.data.alpha;
    let _angle = Math.abs(Math.atan(_Y/_X));//范围是-PI/2~PI/2
    if(Math.abs(_X)<5&&_Y>0){_angle = 90}
    else if(Math.abs(_X)<5&&_Y<0){_angle = 270}
    else if(_X>0&&_Y>=0){_angle = Math.atan(_Y/_X)}
    else if(_X>0&&_Y<0){_angle= 360 - _angle}
    else if(_X<0&&_Y>=0){_angle= 180 - _angle}
    else if(_X<0&&_Y<0){_angle= 180 + _angle}
    if(Math.abs(angle-_angle)<10){
      return true;
    }
    return false;
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
          //color:0xff9900, //颜色
          opacity:0.8,  //透明度
          transparent:false,  //是否开启透明度
          wireframe:false, //将几何图形渲染为线框。 默认值为false
          shininess:12, //高光
          side:THREE.DoubleSide, //双面显示材质
          map: texture,//设置颜色贴图属性值
        }); //材质对象Material
        texture.minFilter = THREE.LinearFilter;
        var plane = new THREE.Mesh(geometry, material); // 创建网格模型对象
        return plane;
  }
})