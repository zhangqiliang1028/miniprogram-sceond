var amapFile = require('../../../../libs/amap-wx');
import { createScopedThreejs } from '../../../../threejs-miniprogram/index'
var camera,canvas,scene,THREE,light,raycaster,renderer,ctx,MapContext,amap;//高德地图
var object,object1,object1scale = 0;
Page({
  data: {
    screenHeight: wx.getSystemInfoSync().windowHeight,
    screenWidth: wx.getSystemInfoSync().windowWidth,
    key: '2006539e53e460b0de628886ac9b0b36',
    show: true,
    currentLo : null,
    currentLa : null,
    newCurrentLo : null,
    newCurrentLa : null,
    distance : 0,
    duration : 0,
    markers : [],
    polyline: null,
    statusType: 'walk',
    includePoints:[],
    setting : {
      skew: 30,
      rotate: 0,
      scale: 18,
      showLocation: true,
      showScale: true,
      subKey: '',
      layerStyle: 1,
      enableZoom: true,
      enablepoi:true,
      enableScroll: true,
      enableRotate: true,
      showCompass: true,
      enable3D: true,
      enableOverlooking: true,
      enableSatellite: false,
      enableTraffic: true,
    }
    
  },
  onLoad(){
    var that = this;
    amap = new amapFile.AMapWX({ key: this.data.key });
    MapContext = wx.createMapContext('#map',this )
    wx.getLocation({
      type: 'gcj02',
      success(res){
        that.setData({ 
          currentLo: res.longitude, 
          currentLa: res.latitude,
          //includePoints: [{
          //  longitude: res.longitude,
          //  latitude: res.latitude
          //}],
          setting:{

          },
          /*
          markers: [{
            id: 0,
            longitude: res.longitude,
            latitude: res.latitude,
            title: "当前位置",
            iconPath: './images/location.png',
            width: 32,
            height: 32
          }]
          */
        });
      }
    })
    that.getAround();
  },
  getAround(){
    var that = this;
    amap.getPoiAround({
      success: function(res){
        //成功回调
        var markers = that.data.markers;
        var l = markers.length;
        for(let i=l;i<l+res.markers.length;i++){ 
          markers.push({
            id: i,
            longitude: res.markers[i-l].longitude,
            latitude: res.markers[i-l].latitude,
            title: res.markers[i-l].address,
            iconPath: './images/1.jpg',
            width: 16,
            height: 16,
          });
        }
        that.setData({
          markers: markers,
        });
        //console.log(that.data.markers)
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
          width: 16,
          height: 16
        });
 
        var points = that.data.includePoints;
        points.push({
          longitude: res.longitude,
          latitude: res.latitude
        });
        that.setData({
          newCurrentLo: res.longitude,
          newCurrentLa: res.latitude,
          includePoints: points,
          markers: markers,
          show:true
        });
        that.getPolyline(that.data.statusType);
      }
    });
  },
  drawPolyline(self,color){
    return {
      origin: this.data.currentLo + ',' + this.data.currentLa,
      destination: this.data.newCurrentLo + ',' + this.data.newCurrentLa,
      success(data) {
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        self.setData({
          distance: data.paths[0].distance,
          duration: parseInt(data.paths[0].duration/60),
          polyline: [{
            points: points,
            color: color,
            width: 6,
            arrowLine: true,
            dottedLine:true,
          }]
        });
      }
    }
  },
  getPolyline(_type){
    
    var self = this;
    switch (_type){
      case 'car':
        amap.getDrivingRoute(this.drawPolyline(this,"#0091ff"));
        break;
      case 'walk':
        amap.getWalkingRoute(this.drawPolyline(this, "#1afa29"));
        break;
      case 'ride':
        amap.getRidingRoute(this.drawPolyline(this, "#1296db"));
        break;
      default:
        return false;
    }
  },
  goTo(e){
    var _type = e.currentTarget.dataset.type;
    this.setData({statusType : _type});
    this.getPolyline(_type);
  },
  init:function() {
    camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 1, 10000);
    scene = new THREE.Scene();
    scene.name = "场景";
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(0,0);
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
  shijingResearch(e){
    wx.navigateTo({
      url: '../minMap/minMap',
    })
  },

})