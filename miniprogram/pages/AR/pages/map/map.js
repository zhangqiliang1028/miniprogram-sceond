//const { init } = require("wx-server-sdk")

// pages/AR/pages/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    screenHeight: wx.getSystemInfoSync().windowHeight,
    screenWidth: wx.getSystemInfoSync().windowWidth,
    longitude:104.0680165911,
    latitude:30.5491861989,
    speed:0,
    scale:5,
    accuracy:0,
    controls:[{
      id:1,iconPath:'./images/1.jpg',
      position:{left:0,top:250,width:30,height:30},
      clickable:true
    }],
    markers:[
      {iconPath:"./images/1.jpg",id:0,latitude:30.5491861989,longitude:104.0680165911,width:30,height:30,alpha:0.3,title:'wowo'},
      {iconPath:"./images/1.jpg",id:1,latitude:30.5468832218,longitude:104.0568588833,width:30,height:30,alpha:0.3,title:'wowo'},
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
  },
  regionchange(e){
    console.log(e.type);
  },
  markertap(e){
    console.log(e.type);
  },
  controltap(e){
    console.log(e.type);
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
      success (res) {
        that.setData({
          latitude:res.latitude,
          longitude:res.longitude,
          speed:res.speed,
          accuracy:res.accuracy,
          markers:[
            {iconPath:"./images/1.jpg",id:0,latitude:res.latitude,longitude:res.longitude,width:30,height:30,alpha:0.3,title:'wowo'},
            {iconPath:"./images/1.jpg",id:1,latitude:30.5468832218,longitude:104.0568588833,width:30,height:30,alpha:0.3,title:'wowo'},
          ],
          polyline:[{
            points:[
              {longitude:104.0680165911,latitude:30.5491861989},
              {longitude:res.longitude,latitude:res.latitude},
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