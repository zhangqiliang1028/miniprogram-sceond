// pages/AR/pages/threeD/three.js
import { createScopedThreejs } from '../../../../threejs-miniprogram/index'
var util = require('../util/util.js')
var camera,canvas,scene,THREE,light,raycaster,renderer;
var mouse,object,object1,object1scale = 0,mesh;
var tapedObjs = [];
var startinfotime,endinfotime,infoshowtime = 2000;
const app = getApp()
Page({
  data: {
    screenHeight: wx.getSystemInfoSync().windowHeight,
    screenWidth: wx.getSystemInfoSync().windowWidth,
    lastX: 0,
    lastY: 0,
    touchS: [-1,-1],
    touchE: [-1,-1],
    info:"",
    countdown:'',
    endDate2: '2021-02-15 18:50:10',
    infoshowtime: 2000,
    objname:"",
    mytouch:[0,0],
  },
  onLoad: function () {
    wx.createSelectorQuery()
      .select('#webgl')
      .node()
      .exec((res) => {
        canvas = res[0].node;
        this.canvas = canvas;
        THREE = createScopedThreejs(this.canvas);
        console.log(THREE);
        this.init();
        this.render();
        console.log("屏幕宽高：["+this.data.screenWidth+","+this.data.screenHeight+"]");
      })
      this.countTime();     
  },
  init:function() {
    
    camera = new THREE.PerspectiveCamera(70, canvas.width / canvas.height, 1, 10000);
    scene = new THREE.Scene();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2(0,0);
    //scene.background = new THREE.Color(0x0ffff0);
    var light = new THREE.DirectionalLight(0xffffff, 1);
    var gl = canvas.getContext('webgl', { alpha: true }); 
    light.position.set(1, 1, 1).normalize();
    scene.add(light);
    let geometry = new THREE.BoxBufferGeometry(10, 20, 10);
    let geometry1 = new THREE.DodecahedronGeometry(5);
    object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    object.position.z =  -200;
    object.scale.y = 1.5;
    object.name = "长方体"
    scene.add(object);
    object1 = new THREE.Mesh(geometry1, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
    object1.position.z =  -100;
    object1.position.y =  20;
    console.log(object1.scale);
    object1.name = "正十二面体"
    this.drawArrows();
    scene.add(mesh);
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
      if(object1.scale.x>3||object1.scale.x<0.5){
        object1scale = -1*object1scale;
      }
      object1.scale.x+=object1scale;
      object1.scale.y+=object1scale;
      object1.scale.z+=object1scale;
    }
    renderer.render(scene, camera);
    canvas.requestAnimationFrame(this.render); //循环执行渲染
  },
  touchStart(e) {
    this.data.touchS[0] = e.touches[0].pageX;
    this.data.touchS[1] = e.touches[0].pageY;
    this.data.touchE[0] = e.touches[0].pageX;
    this.data.touchE[1] = e.touches[0].pageY;
    this.setData({
      mytouch:[e.touches[0].pageX,e.touches[0].pageY]
    })
    this.raycaster(this.data.mytouch);
    if(tapedObjs.length>0){
      tapedObjs[0].object.isChoiced = true;
      this.setData({
        lastX:e.touches[0].pageX,
        lastY:e.touches[0].pageY,
      })
    }
    console.log("触摸开始["+this.data.touchS[0]+","+this.data.touchS[1]+"]");
    this.setData({
      info:"开始触屏"
    })
    startinfotime = Date.parse(new Date());
  },
  touchMove(e) {
    this.setData({
      mytouch:[e.touches[0].pageX,e.touches[0].pageY],
    })
    let currentX = e.touches[0].pageX
    let currentY = e.touches[0].pageY
    let tx = currentX - this.data.lastX
    let ty = currentY - this.data.lastY
    
    //屏幕坐标转canvas坐标
    let x = this.data.mytouch[0]*1.0/this.data.screenWidth * 2 - 1;
    let y = -(this.data.mytouch[1]*1.0/this.data.screenHeight) * 2 + 1;
    //console.log('canvas坐标：',x,y);
    if(tapedObjs.length>0&&tapedObjs[0].object.isChoiced == true){
      //canvas坐标转世界坐标,0.5随便填
      tapedObjs[0].object.position.x +=tx*0.2;
      tapedObjs[0].object.position.y -=ty*0.2;
    }
    this.data.touchE[0] = e.touches[0].pageX;
    this.data.touchE[1] = e.touches[0].pageY;
    this.setData({
      info:"正在移动",
      lastX:e.touches[0].pageX,
      lastY:e.touches[0].pageY,
    })
  },
  touchEnd(e) {
    if(tapedObjs.length>0){
      tapedObjs[0].object.isChoiced = false;
    }
    let disX = this.data.touchE[0] - this.data.touchS[0];
    let disY = this.data.touchE[1] - this.data.touchS[1];
    console.log("触摸结束["+this.data.touchE[0]+","+this.data.touchE[1]+"]");
    if(Math.abs(disX)<3&&Math.abs(disY)<3){
      console.log("静止");
    }else{
      console.log("移动了一下");
      console.log("移动距离为：["+disX+","+disY+"]");
    }
    this.setData({
      info:"触屏结束"
    })
    //startinfotime = Date.parse(new Date());
    setTimeout(this.cleanInfo,infoshowtime);
  },
  cleanInfo:function(){
    this.setData({
      info:""
    })
  },
  touchTap(e){
    this.setData({
      mytouch:[e.touches[0].pageX,e.touches[0].pageY]
    })
    this.raycaster(this.data.mytouch);
    console.log("点击了一下");
    startinfotime = Date.parse(new Date());
    console.log("点击坐标：["+this.data.mytouch[0]+","+this.data.mytouch[1]+"]");
    console.log("箭头坐标：["+mesh.position.x+","+mesh.position.y+"]");
    //drawArrows();
    if(tapedObjs.length>0){
      if(tapedObjs[0].object.name == "正十二面体"){
        //console.log(tapedObjs[0].object.scale);
        if(object1scale<0.0001){
          object1scale = 0.03;
        }else{
          object1scale = 0;
        }
        //console.log(object1scale);
      }
      this.setData({
        objname:tapedObjs[0].object.name,
      })
      util.responseClichObj(tapedObjs[0],THREE,scene);
    }else{
      this.setData({
        objname:"",
      })
    }
    this.setData({
      info:"点击了一下"+this.data.objname
    })
  },
  touchCancel(e) {
    console.log("触摸取消");
  },
  raycaster:function(e){
    mouse.x = (e[0] / this.data.screenWidth) * 2 - 1;
    mouse.y = -(e[1] / this.data.screenHeight) * 2 + 1;
    console.log(mouse.x+" "+mouse.y);
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);
    tapedObjs.splice(0);
    if(intersects.length>0){
      let obj = intersects[0].object;
      tapedObjs.push(intersects[0]);
      //obj.position.y+=20;
    }
    console.log("点击到的物体数量："+tapedObjs.length);
  },
  drawArrows:function(){
    let gemo=new THREE.Geometry()
    //定义几何体的顶点
    gemo.vertices.push( new THREE.Vector3( 0, 0, 0 ) );
    gemo.vertices.push( new THREE.Vector3( 8, 0, 0 ) );
    gemo.vertices.push( new THREE.Vector3( 4, 0, 1 ) );
    gemo.vertices.push( new THREE.Vector3( 4, 0, 3 ) );
    gemo.vertices.push( new THREE.Vector3( 0, -0.5, 0 ) );
    gemo.vertices.push( new THREE.Vector3( 8, -0.5, 0 ) );
    gemo.vertices.push( new THREE.Vector3( 4, -0.5, 1 ) );
    gemo.vertices.push( new THREE.Vector3( 4, -0.5, 3 ) );
    gemo.vertices.push( new THREE.Vector3( 0, 0, -1 ) );
    gemo.vertices.push( new THREE.Vector3( 8, 0, -1 ) );
    gemo.vertices.push( new THREE.Vector3( 4, 0, 0 ) );
    gemo.vertices.push( new THREE.Vector3( 4, 0, 2 ) );
    gemo.vertices.push( new THREE.Vector3( 0, -0.5, -1 ) );
    gemo.vertices.push( new THREE.Vector3( 8, -0.5, -1 ) );
    gemo.vertices.push( new THREE.Vector3( 4, -0.5, 0 ) );
    gemo.vertices.push( new THREE.Vector3( 4, -0.5, 2 ) );
    //定义顶点的连接顺序，顺时针为向光，逆时针为背光
    gemo.faces.push(new THREE.Face3(0,3,2));
    gemo.faces.push(new THREE.Face3(1,2,3));
    gemo.faces.push(new THREE.Face3(4,6,7));
    gemo.faces.push(new THREE.Face3(6,5,7));
    gemo.faces.push(new THREE.Face3(4,0,2));
    gemo.faces.push(new THREE.Face3(4,2,6));
    gemo.faces.push(new THREE.Face3(5,6,2));
    gemo.faces.push(new THREE.Face3(5,2,1));
    gemo.faces.push(new THREE.Face3(5,1,3));
    gemo.faces.push(new THREE.Face3(5,7,3));
    gemo.faces.push(new THREE.Face3(4,3,0));
    gemo.faces.push(new THREE.Face3(4,7,3));
    gemo.faces.push(new THREE.Face3(5,3,7));
    //---------
    gemo.faces.push(new THREE.Face3(8,11,10));
    gemo.faces.push(new THREE.Face3(9,10,11));
    gemo.faces.push(new THREE.Face3(12,14,15));
    gemo.faces.push(new THREE.Face3(14,13,15));
    gemo.faces.push(new THREE.Face3(12,8,10));
    gemo.faces.push(new THREE.Face3(12,10,14));
    gemo.faces.push(new THREE.Face3(13,14,10));
    gemo.faces.push(new THREE.Face3(13,10,9));
    gemo.faces.push(new THREE.Face3(13,9,11));
    gemo.faces.push(new THREE.Face3(13,15,11));
    gemo.faces.push(new THREE.Face3(12,11,8));
    gemo.faces.push(new THREE.Face3(12,15,11));
    gemo.faces.push(new THREE.Face3(13,11,15));
    //如果没有特别指明，面和顶点的法向量可以通过如下代码自动计算
    gemo.computeFaceNormals()
    gemo.computeVertexNormals();
    //定义材质
    mesh=new THREE.Mesh(gemo,new THREE.MeshLambertMaterial({color: 0xffffff}))
    mesh.scale.x*=3;
    mesh.scale.y*=3;
    mesh.scale.z*=3;
    mesh.position.z = -100;
    mesh.position.y = 20;
    mesh.rotation.x = 200;
    mesh.name = "箭头"
    mesh.isChoiced = false;
  },
  countTime() {
    var that = this;
    var date = new Date();
    var now = date.getTime();
    var endDate = new Date(that.data.endDate2);//设置截止时间
    var end = endDate.getTime();
    var leftTime = end - now; //时间差                              
    var d, h, m, s, ms;
    if (leftTime >= 0) {
      d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      m = Math.floor(leftTime / 1000 / 60 % 60);
      s = Math.floor(leftTime / 1000 % 60);
      ms = Math.floor(leftTime % 1000);
      ms = ms < 100 ? "0" + ms : ms
      s = s < 10 ? "0" + s : s
      m = m < 10 ? "0" + m : m
      h = h < 10 ? "0" + h : h
      that.setData({
        countdown:d + "：" + h + "：" + m + "：" + s + ":" + ms,
      })
      endinfotime = Date.parse(new Date());
      if(endinfotime - startinfotime >= infoshowtime){
        this.setData({
          info:''
        })
      }
     //递归每秒调用countTime方法，显示动态时间效果
    setTimeout(that.countTime, 100);
    } else {
      console.log('已截止')
      that.setData({
        countdown:'00:00:00'
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})