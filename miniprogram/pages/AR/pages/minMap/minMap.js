// pages/AR/pages/minMap/minMap.js
var amapFile = require('../../../../libs/amap-wx');
import { createScopedThreejs } from '../../../../threejs-miniprogram/index'
var camera,canvas,scene,THREE,light,raycaster,renderer,ctx,MapContext,amap;//高德地图
var object,object1,object1scale = 0;
Page({
  data: {
    screenHeight: wx.getSystemInfoSync().windowHeight,
    screenWidth: wx.getSystemInfoSync().windowWidth,
    alpha:0, //东西南北，范围值为 [0, 2*PI)。逆时针转动为正。
    beta:0,  //上下前后，范围值为 [-1*PI, PI)。顶部朝着地球表面转动为正。也有可能朝着用户为正。
    gamma:0,  //左右，范围值为 [-1*PI, PI)。右边朝着地球表面转动为正
    key: '2006539e53e460b0de628886ac9b0b36',
    show: true,
    isResearch:false,
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
    
    wx.createSelectorQuery()
      .select('#webgl')
      .node()
      .exec((res) => {
        canvas = res[0].node;
        that.canvas = canvas;
        THREE = createScopedThreejs(that.canvas);
        //console.log(THREE);
        that.init();
        that.render();
        console.log("屏幕宽高：["+that.data.screenWidth+","+that.data.screenHeight+"]");
      })
      
      MapContext = wx.createMapContext('map' )
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
    //scene.background = new THREE.Color(0x0ffff0);
    var light = new THREE.DirectionalLight(0xffffff, 1);
    //var gl = canvas.getContext('webgl', { alpha: true }); 
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    let geometry = new THREE.BoxBufferGeometry(5, 10, 5);
    let geometry1 = new THREE.DodecahedronGeometry(5);
    object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    object.position.z =  -100;
    object.scale.y = 1;
    object.name = "长方体"
    object.scale.set(2,2,2);
    //scene.add(object);
    object1 = new THREE.Mesh(geometry1, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    object1.position.z =  -100;
    object1.name = "正十二面体"
    //scene.add(mesh);
    scene.add(object1);
    renderer = new THREE.WebGLRenderer({
      canvas:canvas,
      antialias:true,
      alpha:true
    });
    renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
    renderer.setSize(canvas.width, canvas.height);
  },
  render:function() {

    object.rotation.y = 1;
    object.material =  new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
    object1.rotation.x += 0.01;
    object1.rotation.y += 0.02;
    object1.rotation.z += 0.03;
    if(Math.abs(object1scale)>0.0001){
      if(object1.scale.x>1.5||object1.scale.x<0.7){
        object1scale = -1*object1scale;
      }
      object1.scale.x+=object1scale;
      object1.scale.y+=object1scale;
      object1.scale.z+=object1scale;
    }
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
  tap(e){
    //console.log(e)
  },
  longpress(e){
    //console.log(e)
  },
  //--------------------------------------------------------------------
  onHide: function (){
    wx.stopDeviceMotionListening({})
    wx.stopLocationUpdate({})
  },
  return(){
    wx.stopDeviceMotionListening({})
    wx.stopLocationUpdate({})
    wx.navigateBack({
    delta: 1
  })
  },
  research(){
    var that = this;
    if(!this.data.isResearch){
      that.setData({
        researchInfo:'搜索中...',
        isResearch:true,
      })
      wx.startDeviceMotionListening({
        
      })
      wx.startLocationUpdate({
        success: (res) => {
          console.log("开始位置监听")
        },
      })
      var flag =1;
      wx.onDeviceMotionChange(function (res) {
        wx.removeStorage({
          key: 'key',
          success (res) {
            console.log(res)
          }
        })
        flag++;
        if(flag%100 == 0){
          console.log(res)
          var alpha = parseFloat(res.alpha);
          var beta = parseFloat(res.beta);
          var gamma = parseFloat(res.gamma);
          that.setData({
            alpha: alpha,
            beta: beta,
            gamma: gamma,
          })
          flag = 1;
        }
      })
      wx.onLocationChange((result) => {
        that.setData({
          currentLo:result.longitude,
          currentLa:result.latitude
        })
      })
      this.showBuild();
    }
    else{
      wx.stopDeviceMotionListening({
        success: (res) => {
          console.log('设备监听结束')
        },
      })
      wx.stopLocationUpdate({
        success: (res) => {
          console.log('位置监听结束')
        },
      })
      that.setData({
        researchInfo:'搜索',
        isResearch:false,
      })
    }
    
  },
  showBuild:function(){
    var screenX,screenY;
    MapContext.toScreenLocation({
      latitude:this.data.currentLa,
      longitude:this.data.currentLo,
      success:function(res){
        screenX = res.x;
        screenY = res.y;
        console.log("当前位置:",screenX,screenY);
      }
    })
    var mm = this.data.markers
    for(let key in mm){
      if(mm[key].title!="当前位置"){
        MapContext.toScreenLocation({
          latitude:mm[key].latitude,
          longitude:mm[key].longitude,
          success:function(res){
            console.log(mm[key].title,':',res.x,res.y);
          }
        })
      }
    }
  }
})