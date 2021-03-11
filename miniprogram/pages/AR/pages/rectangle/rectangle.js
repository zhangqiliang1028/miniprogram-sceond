// pages/AR/pages/rectangle/rectangle.js
//云数据库初始化
const db = wx.cloud.database({});
const cont = db.collection('test');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ne:[],  //这是一个空的数组，等下获取到云数据库的数据将存放在其中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //1、引用数据库   
    const db = wx.cloud.database({
      //这个是环境ID不是环境名称     
      env: 'test-5gbxczf0565156d5'
    })
    const _ = db.command     //引用指令
    //2、开始查询数据了  news对应的是集合的名称   
    db.collection('test')
    .where({
      age:_.gt(10)
    })
    .skip(0)
    .limit(10)
    .field({
      name: true,
      number:true,
      age:true
    }
      )
    .orderBy('age', 'desc')
    .get({
      //如果查询成功的话    
      success: res => {
        console.log(res.data)
        //这一步很重要，给ne赋值，没有这一步的话，前台就不会显示值      
        this.setData({
          ne: res.data
        })
      }

    })

  },
  returnClick:function(){
    wx.navigateBack({
      delta: 1
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