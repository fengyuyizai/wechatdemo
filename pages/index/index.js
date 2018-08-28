const app = getApp();
const stateData = require('../../utils/buildInfo.js')
const ctx = wx.createCanvasContext('mapCanvas');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapCavasW: 0,
    mapCavasH: 0,
    compassData: {},
    floorList: ['1F', '2F', '3F', '4F', '5F', '6F', '7F'],
    chooseFloorShow: false,
    curFloor: '1F',
    buildInfo: stateData.buildInfo(),
    touchStart: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    wx.getSystemInfo({
      success: function(res) {
        app.globalData = res;
        self.setData({
          mapCavasW : app.globalData.windowWidth,
          mapCavasH: app.globalData.windowHeight
        });
        console.log(self.data.mapCavasW + ',' + self.data.mapCavasH)
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
    this.setData({
      ctx: ctx
    })
    this.initMap()
    console.log(stateData.buildInfo())
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const compass = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 1000,
      timingFunction: "ease",
      delay: 0
    });
    this.compass = compass
    this.compass.rotate(0).step();
    this.setData({
      compassData: compass.export()
    })
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
    
  },
  resetDirection: function() {
    this.compass.rotate(0).step();
    this.setData({
      compassData: this.compass.export()
    })
  },
  confirmFloor: function(e) {
    const curFloor1 = this.data.floorList[e.currentTarget.dataset.num];
    this.setData({
      curFloor: curFloor1,
      chooseFloorShow: false
    });
    console.log(this.data.curFloor);
  },
  chooseFloor: function() {
    const chooseFloorShow = !this.data.chooseFloorShow;
    this.setData({
      chooseFloorShow
    })
  },
  initMap: function() {
    const self = this;
    this.data.buildInfo.forEach((item, index) => {
      
      ctx.setFillStyle(item.color);
      ctx.fillRect(item.position[2], item.position[3], item.position[0], item.position[1]);
      ctx.setFillStyle("#fff");

      const fontX = item.position[0] / 2 + item.position[2];
      const fontY = item.position[1] / 2 + item.position[3];
      const fontMaxX = item.position[0] / 1.5;
      const fontBackgroundW = item.name.length * 20;
      const fontBackgroundH = 20;
      const roundedRect = {
        x: fontX - fontBackgroundW / 2,
        y: fontY - fontBackgroundH / 2,
        height: fontBackgroundH,
        width: fontBackgroundW
      };
      self.drawRoundedRect(roundedRect, 4, ctx)
      ctx.setFillStyle("#5d5d5d");
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle')
      ctx.setFontSize(15)
      ctx.fillText(item.name, fontX, fontY, fontMaxX);

    });
    ctx.draw();
  },
  // 绘制建筑物名称下的圆角矩形
  drawRoundedRect: function(rect, r, ctx) {

    ctx.beginPath()
    
    ctx.arc(rect.x + r, rect.y + r, r, Math.PI, Math.PI * 1.5);

    ctx.arc(rect.x + rect.width -  r, rect.y + r, r, Math.PI * 1.5, Math.PI * 2)
    
    ctx.arc(rect.x + rect.width - r, rect.y + rect.height - r, r, 0, Math.PI * 0.5);
    
    ctx.arc(rect.x +  r, rect.y + rect.height - r, r, Math.PI * 0.5, Math.PI);

    ctx.setFillStyle('#fff')
    ctx.setStrokeStyle('#fff')
    ctx.stroke();
    ctx.fill()
  },
  touchstart: function(e) {
    this.setData({
      touchStart: e.touches
    })
  },
  touchmove: function(e) {
    
    if(e.touches.length === 1) {
      this.mapMove(e.touches);
      
    } else if(e.touches.length === 2) {
      this.mapScale(e.touches)
    }
  },
  // 控制地图整体移动
  mapMove: function(touches){
    const touche = touches[0];
    let buildInfo = this.data.buildInfo;
    let moveX = touche.x - this.data.touchStart[0].x;
    let moveY = touche.y - this.data.touchStart[0].y;
    // console.log(touche)
    // console.log(this.data.touchStart);

    // 重置初始点，防止倍率累加
    this.setData({
      touchStart: touches
    });

    // console.log('运动' + moveX + ',' + moveY)
    buildInfo.forEach((item, index) => {
      item.position[2] += moveX;
      item.position[3] += moveY;
    })
    // 更新地图
    this.initMap();
  },
  // 控制地图缩放
  mapScale: function(touches) {
    let buildInfo = this.data.buildInfo;
    const toucheOne = touches[0];
    const toucheTwo = touches[1];
    
    let scaleX = toucheOne.x - toucheTwo.x;
    let scaleY = toucheOne.y - toucheTwo.y;
    let moveScale = Math.sqrt(Math.pow(scaleX, 2) + Math.pow(scaleY, 2));

    const startToucheOne = this.data.touchStart[0];
    const startToucheTwo = this.data.touchStart[1];

    let startScaleX = startToucheOne.x - startToucheTwo.x;
    let startScaleY = startToucheTwo.y - startToucheTwo.y;
    let startScale = Math.sqrt(Math.pow(startScaleX, 2) + Math.pow(startScaleY, 2));

    // 地图放大倍数
    let scale = startScale / moveScale ;
    // 地图放大中心点
    let centerPoint = {
      x: scaleX / 2,
      y: scaleY / 2
    }
    // 重置初始点，防止倍率累加
    this.setData({
      touchStart: touches
    });

    wx.showModal({
      title: '倍率',
      content: scale,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    });

    buildInfo.forEach((item, index) => {
      item.position[0] *= scale;
      item.position[1] *= scale;
      item.position[2] = (item.position[2] - centerPoint.x) * scale;
      item.position[3] = (item.position[3] - centerPoint.y) * scale;
    })
    // 更新地图
    this.initMap();
  }
})