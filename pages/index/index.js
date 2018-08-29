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
    touchStart: null,
    centerPoint: {
      x: 0,
      y: 0
    },
    scale: 1,
    maxScale: 3,
    minScale: 0.5,
    ruleWidth: 100,
    rule: 100,
    floorAnimationData: {},
    floorTouchStart: null,
    floorMove: 0
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
          mapCavasH: app.globalData.windowHeight - 41
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
      timingFunction: "linear",
      delay: 0
    });
    this.compass = compass
    this.compass.rotate(0).step();
    this.setData({
      compassData: compass.export()
    });

    var floorAnimation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    });
    this.floorAnimation = floorAnimation;
    // 初始化地图中心点
    this.initMapCenterPoint()
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
  flootTouchStart: function(e){
    // console.log(e.touches[0].clientY)
    this.setData({
      floorTouchStart: e.touches[0]
    })
  },
  flootTouchMove: function(e) {
    // const flootTouchStartX = this.data.floorTouchStart.clinetX;
    const flootTouchStartY = this.data.floorTouchStart.clientY;
    // console.log(flootTouchStartY);

    // const flootMoveX = e.touches[0].clinetX;
    const floorMoveY = e.touches[0].clientY;

    let curMove = floorMoveY - flootTouchStartY;
    this.setData({
      floorTouchStart: e.touches[0]
    })
    
    if (this.data.floorList.length > 5 ) {
      
      if (this.data.floorMove > -(this.data.floorList.length - 5) * 32 && curMove < 0 ) { // 向下滚
        
        // console.log(curMove);
        this.setData({
          floorMove: curMove + this.data.floorMove
        })
      } else if (this.data.floorMove < 0 && curMove > 0) { // 向上滚
        this.setData({
          floorMove: curMove + this.data.floorMove
        })
      }
    }
    console.log('xx' + curMove)
    this.floorAnimation.translateY(this.data.floorMove).step()
    this.setData({
      floorAnimationData: this.floorAnimation.export()
    })
    
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
  initMapCenterPoint: function (offestMap, scaleMap) {
    let offest = offestMap && offestMap.x ? offestMap :  {x: 0, y: 0}; // 偏移量初始化
    let scale = scaleMap ? scaleMap : 1; // 放大倍数初始化
    let centerPoint = { x: 0, y: 0 }; // 中心点声明
    centerPoint.x = (app.globalData.windowWidth / 2 + offest.x) * scale;
    centerPoint.y = ((app.globalData.windowHeight - 41) / 2 + offest.y) * scale;
    this.setData({
      centerPoint
    })
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
    this.initMapCenterPoint({x: moveX, y: moveY})
  },
  // 控制地图缩放
  mapScale: function(touches) {
    let buildInfo = this.data.buildInfo;
    const toucheOne = touches[0]; // 指头1
    const toucheTwo = touches[1]; // 指头2
    
    let scaleX = toucheOne.x - toucheTwo.x;
    let scaleY = toucheOne.y - toucheTwo.y;
    let moveScale = Math.sqrt(Math.pow(scaleX, 2) + Math.pow(scaleY, 2));

    const startToucheOne = this.data.touchStart[0];
    const startToucheTwo = this.data.touchStart[1];

    let startScaleX = startToucheOne.x - startToucheTwo.x;
    let startScaleY = startToucheOne.y - startToucheTwo.y;
    let startScale = Math.sqrt(Math.pow(startScaleX, 2) + Math.pow(startScaleY, 2));

    // console.log('touchOne:' + toucheOne.x + ',' + toucheOne.y + '\ntouchTwo:' + toucheTwo.x + ',' + toucheTwo.y + "\nscale:" + moveScale)
    // console.log('startToucheOne:' + startToucheOne.x + ',' + startToucheOne.y + '\nstartToucheTwo:' + startToucheTwo.x + ',' + startToucheTwo.y + "\nscale:" + startScale)

    let singleScale;
    // 判定手势是放大还是缩小
    // console.log(moveScale + ',' + startScale);
    if (moveScale > startScale) { // 放大手势
      singleScale = (moveScale / this.data.mapCavasW) * 2;
      // console.log('放大手势:' + scale);
    } else {
      singleScale = ((moveScale - startScale) / this.data.mapCavasW) * 2 + 1;
      // console.log('缩小手势:' + scale);
    }

    // 地图放大倍数
    this.data.scale = singleScale;

    // 地图倍数限制
    if (this.data.scale >= this.data.maxScale) {
      this.setData({
        scale: this.data.maxScale
      })
    } else if (this.data.scale <= this.data.minScale) {
      this.setData({
        scale: this.data.minScale
      })
    }
    let scale = this.data.scale;
    console.log('scale:' + scale);

    // 地图放大中心点
    let centerPoint = {
      x: this.data.centerPoint.x,
      y: this.data.centerPoint.y
    }

    // // 重置触控初始点，防止倍率累加
    // this.setData({
    //   touchStart: touches
    // });
    let newPostionX, newPostionY;
    if (this.data.ruleWidth * scale > this.data.rule * 3 || this.data.ruleWidth * scale < this.data.rule * 0.5) { // 设置地图缩放界限
      return
    } else {
      this.setData({
        ruleWidth: this.data.ruleWidth * scale
      })
    }
    if(this.data.ruleWidth)
    buildInfo.forEach((item, index) => {

      // 建筑物大小放大缩小
      item.position[0] *= scale;
      item.position[1] *= scale;
      // 建筑物位置放大缩小
      let a = Math.abs(centerPoint.x - item.position[2]); // a为距离中心点横向距离
      let b = Math.abs(centerPoint.y - item.position[3]); // b为距离中心点纵向距离
      if(item.position[2] <= centerPoint.x && item.position[3] < centerPoint.y) { // 第二象限
          newPostionX = centerPoint.x - a * scale;
          newPostionY = centerPoint.y - b * scale;
      } else if (item.position[2] > centerPoint.x && item.position[3] <= centerPoint.y) { // 第一象限
        newPostionX = centerPoint.x + a * scale;
        newPostionY = centerPoint.y - b * scale;
      } else if (item.position[2] >= centerPoint.x && item.position[3] > centerPoint.y) { // 第四象限
        newPostionX = centerPoint.x + a * scale;
        newPostionY = centerPoint.y + b * scale;
      } else if (item.position[2] < centerPoint.x && item.position[3] >= centerPoint.y) { // 第三象限
        newPostionY = centerPoint.y + b * scale;
        newPostionX = centerPoint.x - a * scale;
      } else if (item.position[2] == centerPoint.x && item.position[3] == centerPoint.y) { // 坐标原点
        newPostionX = centerPoint.x;
        newPostionY = centerPoint.y
      } 
      item.position[2] = newPostionX;
      item.position[3] = newPostionY;
    })
    // 更新地图
    this.initMap();
    this.initMapCenterPoint({}, scale)
  }
})