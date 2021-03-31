// pages/AR/pages/minMap/minMap.js
var amapFile = require('../../../../libs/amap-wx');
var QQMapWX = require('../../../../libs/qqmap-wx-jssdk');
var util = require('../util/util')
import { registerGLTFLoader } from '../../../../loaders/gltf-loader'
import { createScopedThreejs } from '../../../../threejs-miniprogram/index'
var camera,canvas,clock,mixer,scene,THREE,light,raycaster,renderer,ctx,gl,MapContext,amap;//高德地图
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
    compassDirection:0,
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
    markers : [],
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
  onLoad(options){

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
      if(options.name){
        this.setData({
          tip:options.name
        })
        this.get3DModel();
      }
    //ctx = wx.createCanvasContext('mycanvas')
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
            address: res.markers[i-l].address,
            iconPath: '../map/images/1.jpg',
            width: 16,
            height: 16,
            name:res.markers[i-l].name,
          });
        }
        that.setData({
          markers: markers,
        });
        console.log("markers中的内容:",that.data.markers)
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
    var that = this
    registerGLTFLoader(THREE)
    camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 1, 10000);
    scene = new THREE.Scene();
    scene.name = "场景";
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(0,0);
    light = new THREE.PointLight();
    clock = new THREE.Clock();
    light.position.set(0, 10, 0).normalize();
    scene.add(light);
    //this.get3DText('naem')
    //this.getManyShape();//场景中添加各种形状的物体
    let geometry = new THREE.DodecahedronGeometry(5);
    object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ 
      color: Math.random()*0xffffff, //颜色
      //map:new THREE.CanvasTexture(that.getTextCanvas('Leo Test Label')),
    }));
    object.name = "preObject"
    renderer = new THREE.WebGLRenderer({
      canvas:canvas,
      antialias:true,
      alpha:true
    });
    renderer.setPixelRatio(wx.getSystemInfoSync().pixelRatio);
    renderer.setSize(canvas.width, canvas.height);
  },
  render:function() {
    this.upDateCamera() //设备手动寻找目标
    //camera.rotateY(0.01) //自动旋转场景中的相机
    var dt = clock.getDelta();
    if (mixer) mixer.update(dt);
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
        //转到点击目标的详情页面
        console.log(tapedObjs[0].object)
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
    if(this.data.isResearch){
      //this.closeResearch()
    }
  },
  return(){
    if(this.data.isResearch){
      this.closeResearch()
    }
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
        if(intersects[i].object.name){
          tapedObjs.push(intersects[i]);
        }
        
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
      wx.startCompass() //罗盘     
      wx.onCompassChange(function (res){
        that.setData({
          compassDirection:res.direction
        })
      })
      wx.startDeviceMotionListening({
        interval:'normal',
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
          let beta = res.beta.toFixed(2);
          let gamma = res.gamma.toFixed(2);
            that.setData({
              alpha: alpha,
              beta: -beta,
              gamma: gamma,
            })
      })
    
      wx.onLocationChange((result) => {
        that.setData({
          currentLo:result.longitude,
          currentLa:result.latitude
        })
        
      })
      that.showBuild()
    }
    else{
      this.closeResearch();
    }
  },
  showBuild:function(){
    var that = this;
    var mm = this.data.markers
    //console.log(that.data.markers)
    for(let key in mm){
      if(mm[key].title!="当前位置"){
        that.drawBuildings(mm[key])
      }
    }
  },
  drawBuildings:function(obj){
    var that = this;
    let x1 = obj.latitude
    let y1 = obj.longitude
    let x2 = that.data.currentLa
    let y2 = that.data.currentLo
    let distance = this.cal_distance({latitude:x2,longitude:y2},{latitude:x1,longitude:y1})
    let angle = this.cal_angle({latitude:x2,longitude:y2},{latitude:x1,longitude:y1}).angle
    let direction = this.cal_angle({latitude:x2,longitude:y2},{latitude:x1,longitude:y1}).direction
    let _Y = Math.cos(angle/180*Math.PI)*distance
    let _X = Math.sin(angle/180*Math.PI)*distance
    let co = object.clone();
    co.name = obj.name; //名称
    co.address = obj.address; //地址
    co.distance = distance; //距离
    co.angle = angle;//角度
    co.direction = direction;//方向
    co.latitude = obj.latitude
    co.longitude = obj.longitude
    co.position.set(_X,Math.random()*20-10,_Y);
    co.lookAt(camera.position)
    this.getImageTexture(co);
    buildGroup.add(co);
  },

  get3DText:function(name){
    var that = this
    var font;
    var loader = new THREE.FontLoader();
    loader.load("https://7465-test-5gbxczf0565156d5-1304816106.tcb.qcloud.la/examples/fonts/helvetiker_regular.typeface.json?sign=20b71699be4013f79d95ca0e243595a5&t=1616403998", function (res) {
        font = new THREE.TextBufferGeometry(name, {
            font: res,
            size: 5,
            height: 2
        });
        font.computeBoundingBox(); // 运行以后设置font的boundingBox属性对象，如果不运行无法获得。
        //font.computeVertexNormals();
        var map = new THREE.TextureLoader().load("https://7465-test-5gbxczf0565156d5-1304816106.tcb.qcloud.la/3Dmodels/uv_grid_directx.jpg?sign=6e5d909b415f9a33549deed0fac729fc&t=1616403091");
        var material = new THREE.MeshLambertMaterial({map:map,side:THREE.DoubleSide});
        var fontModel = new THREE.Mesh(font,material);
        //设置位置
        for(let i= 0;i<50;i++){
          let t = fontModel.clone();
          t.position.set(Math.random()*300-150,Math.random()*60-30,Math.random()*200-100);
          t.lookAt(camera.position)
          console.log(t)
          //buildGroup.add(fontModel)
          scene.add(t)
        }
        
    });
  },
  getManyShape:function(){
    var that = this;
    let arr = [];
    let name = [];
    //长方体 参数：长，宽，高
    var box = new THREE.BoxGeometry(100, 100, 100);
    arr.push(box)
    name.push('box')
    // 球体 参数：半径60  经纬度细分数40,40
    var sphere = new THREE.SphereGeometry(60, 40, 40);
    arr.push(sphere)
    name.push('sphere')
    // 圆柱  参数：圆柱面顶部、底部直径50,50   高度100  圆周分段数
    var cylinder = new THREE.CylinderGeometry( 50, 50, 100, 25 );
    arr.push(cylinder)
    name.push('cylinder')
    // 正八面体
    var octahedron = new THREE.OctahedronGeometry(50);
    arr.push(octahedron)
    name.push('octahedron')
    // 正十二面体
    var dodecahed = new THREE.DodecahedronGeometry(50);
    arr.push(dodecahed)
    name.push('dodecahed')
    // 正二十面体
    var icosahedron = new THREE.IcosahedronGeometry(50);
    arr.push(icosahedron)
    name.push('icosahedron')

    for(let j =0 ;j<50; j++){
      for(let i=0;i<arr.length;i++){
        let material = new THREE.MeshPhongMaterial({
          color:Math.random()*0xffffff, //颜色
          //map:new THREE.CanvasTexture(that.getTextCanvas('Leo Test Label')),
        }); //材质对象Material
        var mesh = new THREE.Mesh(arr[i], material); // 创建网格模型对象
        mesh.name = name[i]
        let x = (Math.random()*800-400)
        let z = (Math.random()*800-400)
        mesh.position.set(x,Math.random()*800-400,z);
        mesh.scale.set(0.3,0.3,0.3)
        scene.add(mesh)
      }
    }
  },
  closeResearch:function(){
    scene.remove(buildGroup);
    var that = this;
    wx.offCompassChange();
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
    that.setData({
      researchInfo:'搜索',
      isResearch:false,
    })
  },
  getTextCanvas:function(text){
    var canvasScreen;
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        canvasScreen = res[0].node
        ctx = canvasScreen.getContext('2d')
        canvasScreen.width = 100;
        canvasScreen.height = 50;
        ctx = canvasScreen.getContext('2d');
        ctx.fillStyle = '#C3C3C3';
        ctx.fillRect(0, 0, canvasScreen.width, canvasScreen.height);
        ctx.font = 50+'px " bold';
        ctx.fillStyle = '#2891FF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvasScreen.width/2,canvasScreen.height/2); 
      })
    return canvasScreen;
  },
  getImageTexture:function(obj){
    var width = 20,height = 10
    var plane = new THREE.PlaneGeometry(width, height); //矩形平面
    // TextureLoader创建一个纹理加载器对象，可以加载图片作为几何体纹理
    var textureLoader = new THREE.TextureLoader();
    // 执行load方法，加载纹理贴图成功后，返回一个纹理对象Texture
    textureLoader.load('../util/1.jpg', function(texture) {
      var material = new THREE.MeshLambertMaterial({
        // color: 0x0000ff,
        // 设置颜色纹理贴图：Texture对象作为材质map属性的属性值
        transparent:true,
        opacity:0.6,
        map: texture,//设置颜色贴图属性值
      }); //材质对象Material
      texture.minFilter = THREE.LinearFilter
      var mesh = new THREE.Mesh(plane, material); //网格模型对象Mesh
      mesh.position.set(width/2,height/2,0)
      obj.add(mesh); //网格模型添加到场景中
  })
 },
  upDateCamera:function(){
    if(this.data.alpha<=180){
      camera.rotation.y = -this.data.alpha/360*Math.PI*2;
    }else{
      camera.rotation.y = -(this.data.alpha-360)/360*Math.PI*2;
    }
    if(this.data.beta>=-90&&this.data.beta<=90){
      //camera.rotation.x = (90 + this.data.beta)/360*Math.PI*2;
    }else{
      //camera.rotation.x = 0
    }
    //camera.rotation.x = -(this.data.beta-90)/360*Math.PI*2;
    //camera.rotation.z = (this.data.gamma)/360*Math.PI*2;
  },
  //根据两个经纬度坐标计算角度
  cal_angle:function(p1,p2){ //正北顺时针 //返回度
    var _this = this;
    var lat_a=p1.latitude
    var lat_b=p2.latitude
    var lng_a=p1.longitude
    var lng_b=p2.longitude
    lat_a=lat_a*Math.PI/180;
    lng_a=lng_a*Math.PI/180;
    lat_b=lat_b*Math.PI/180;
    lng_b=lng_b*Math.PI/180;
    var dlon=lng_b-lng_a
    var y=Math.sin(dlon)*Math.cos(lat_b)
    var x=(Math.cos(lat_a)*Math.sin(lat_b)-Math.sin(lat_a)*Math.cos(lat_b)*Math.cos(dlon))
    var brng=Math.atan2(y,x)*180/Math.PI
    brng=(brng+360)%360
    brng = brng.toFixed(1)
    let s = null;
    if(brng<1||brng>359){
      s = '正北'
    }
    else if(brng<89){
      s = '北偏东'
    }
    else if(brng<91){
      s = '正东'
    }
    else if(brng<179){
      s = '东偏南'
    }
    else if(brng<181){
      s = '正南'
    }
    else if(brng<269){
      s = '南偏西'
    }
    else if(brng<271){
      s = '正西'
    }
    else if(brng<=359){
      s = '西偏北'
    }
    return  {angle:brng,direction:s}
  },

  //根据两个经纬度坐标计算距离 单位米
  cal_distance:function(p1,p2){
    var _this=this
    var lat1=p1.latitude
    var lat2=p2.latitude
    var lng1=p1.longitude
    var lng2=p2.longitude
    var radLat1 = lat1*Math.PI / 180.0;
    var radLat2 = lat2*Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var  b = lng1*Math.PI / 180.0 - lng2*Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
    Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s *6378.137 ;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10;
    //将距离写入data里，用于展示，保留5个小数
    return s.toFixed(1)
  },

  get3DModel:function(){
        // model
        var loader = new THREE.GLTFLoader();
        loader.load('https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb', function (gltf) {
          var model = gltf.scene;
          model.position.set(0,0,-20);
          model.lookAt(camera.position)
          scene.add(model);
          //createGUI(model, gltf.animations)
        }, undefined, function (e) {
          console.error(e);
        });
  },
  createGUI:function(model, animations) {
    var states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
    var emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];
    mixer = new THREE.AnimationMixer(model);
    actions = {};
    for (var i = 0; i < animations.length; i++) {
      var clip = animations[i];
      var action = mixer.clipAction(clip);
      actions[clip.name] = action;
      if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
      }
    }

    // expressions
    face = model.getObjectByName('Head_2');
    activeAction = actions['Walking'];
    activeAction.play();
  },
})