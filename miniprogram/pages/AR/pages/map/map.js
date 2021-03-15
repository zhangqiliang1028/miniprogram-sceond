//const { init } = require("wx-server-sdk")

// pages/AR/pages/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenHeight: wx.getSystemInfoSync().windowHeight,
    screenWidth: wx.getSystemInfoSync().windowWidth,
    longitude:0,
    latitude:0,
    speed:0,
    scale:20,
    accuracy:0,

    markers:[
      {iconPath:"./images/1.jpg",id:0,latitude:30.5491861989,longitude:104.0680165911,width:30,height:30,alpha:0.3,title:'wo'},
      {iconPath:"./images/2.jpg",id:1,latitude:30.5468832218,longitude:104.0568588833,width:30,height:30,alpha:0.3,title:'wo'},
    ],
    polyline:[{
      points:[
        {longitude:104.0680165911,latitude:30.5491861989},
        {longitude:104.0687752749,latitude:30.5493465980},
        {longitude:104.0688698344,latitude:30.5470634483},
        {longitude:104.0568588833,latitude:30.5468832218},
      ],
      color:"#0000ffDD",
      width:2,
      dottedLine:true
    }],
    circles :[],
    setting :{
      skew: 30,
      rotate: 360,
      showLocation: true,
      showScale: true,
      subKey: '',
      layerStyle: 1,
      enableZoom: true,
      enableScroll: true,
      enableRotate: true,
      showCompass: true,
      enable3D: true,
      enableOverlooking: true,
      enableSatellite: false,
      enableTraffic: true,
    },
  },
  regionchange(e){
    console.log(e);
  },
  markertap(e){
    console.log(e.type);
  },
  controltap(e){
    console.log(e.type);
  },
  anchorpointtap(e){
    console.longitude(e.detail)

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init()

  },
  init:function(){
    var that = this //函数内部的this不是整体this
    wx.getLocation({
      type: 'wgs84',
      isHighAccuracy:true,
      success (res) {
        that.setData({
          latitude:res.latitude,
          longitude:res.longitude,
          speed:res.speed,
          accuracy:res.accuracy,
          markers:[         //标记点
            {iconPath:"./images/1.jpg",id:0,latitude:res.latitude,longitude:res.longitude,width:30,height:30,alpha:0.3,title:'wo'},
            {iconPath:"./images/2.jpg",id:1,latitude:30.5468832218,longitude:104.0568588833,width:30,height:30,alpha:0.3,title:'wo'},
          ],
          polyline:[{        //路线
            points:[
              {longitude:res.longitude,latitude:res.latitude},
              {longitude:104.0680165911,latitude:30.5491861989},
            ],
            color:"#0000ffDD",
            width:2,
            dottedLine:true
          }],
        })
      }
     })
     
     
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