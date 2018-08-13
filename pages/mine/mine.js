const app = getApp();

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    
  },
  getUserInfo: function(e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (app.globalData.userInfo) {
      wx.hideLoading()
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      console.log('1');
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          wx.hideLoading()
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
      console.log('3');
    }
  },
  removeUserInfo: function (e) {
    app.globalData.userInfo = null;
    this.setData({
      userInfo: {},
      hasUserInfo: false
    })
    console.log('removeUserInfo' + this.userInfo)
  }
})