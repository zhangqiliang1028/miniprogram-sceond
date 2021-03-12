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
    accuracy:0,
    controls:{},
    markers:{},
    polyline:{},
    circles :{},
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