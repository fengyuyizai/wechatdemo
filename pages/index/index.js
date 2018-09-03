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
    centerPoint: { // 地图放大缩小旋转中心点
      x: 0,
      y: 0
    },
    translateX: 0,
    translateY: 0,
    scale: 1, // 放大倍数
    maxScale: 1.5, // 单次放大最大倍数
    minScale: 0.5, // 单次缩小最小倍数
    ruleWidth: 100, // 放大尺寸--尺寸改变值
    rule: 100,  // 放大尺寸--固定值
    rotate: 0, // 旋转值
    singleMaxRoate: 0.1,
    floorAnimationData: {},
    floorTouchStart: null,
    floorMove: 0,
    firstLoad: true
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

    this.initMapCenterPoint();
    this.initMap();
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
  // 选中楼层
  confirmFloor: function(e) {
    const curFloor1 = this.data.floorList[e.currentTarget.dataset.num];
    this.setData({
      curFloor: curFloor1,
      chooseFloorShow: false
    });
    console.log(this.data.curFloor);
  },
  // 选择楼层窗口滚动，记录手指开始位置
  flootTouchStart: function(e){
    // console.log(e.touches[0].clientY)
    this.setData({
      floorTouchStart: e.touches[0]
    })
  },
  // 选择楼层窗口滚动，记录手指移动
  flootTouchMove: function(e) {
    const flootTouchStartY = this.data.floorTouchStart.clientY;

    const floorMoveY = e.touches[0].clientY;

    let curMove = floorMoveY - flootTouchStartY;
    this.setData({
      floorTouchStart: e.touches[0]
    })
    
    if (this.data.floorList.length > 5 ) {
      if (this.data.floorMove > -(this.data.floorList.length - 5) * 32 && curMove < 0 ) { // 向下滚
        this.setData({
          floorMove: curMove + this.data.floorMove > -(this.data.floorList.length - 5) * 32 ? -(this.data.floorList.length - 5) * 32 : curMove + this.data.floorMove
        })
      } else if (this.data.floorMove < 0 && curMove > 0) { // 向上滚
        this.setData({
          floorMove: curMove + this.data.floorMove < 0 ? curMove + this.data.floorMove : 0
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
  initMap: function () {
    // ctx.transform(0, 0, 0, 0, -375 / 2, -562 / 2);
    ctx.translate(this.data.mapCavasW / 2, this.data.mapCavasH / 2)
    this.initMapFont();
    
    ctx.draw();
  },
  initMapFont: function () {
    
    let offestX = 0,
        offestY = 0;
    if (this.data.firstLoad) { // 第一次加载数据时修改建筑物的坐标参数
      offestX = this.data.centerPoint.x;
      offestY = this.data.centerPoint.y;
      // console.log(offestX + ',' + offestY);
      
      this.setData({
        firstLoad: true
      })
    }
    const self = this;
    this.data.buildInfo.forEach((item, index) => {
      
      ctx.setFillStyle(item.color);
      ctx.fillRect(item.position[2] - offestX, item.position[3] - offestY, item.position[0], item.position[1]);
      ctx.setFillStyle("#fff");

      const fontX = item.position[0] / 2 + item.position[2] - offestX;
      const fontY = item.position[1] / 2 + item.position[3] - offestY;
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
  },
  // 数据统计完毕之后调用改函数，对地图进行重新绘制
  changeMap: function(scale, rotate, translate) {
    translate.x *= scale; // 对横轴偏移量进行计算
    translate.y *= scale; // 对纵轴偏移量进行计算
    this.setData({
      translateX: this.data.translateX + translate.x,
      translateY: this.data.translateY + translate.y
    })
    // console.log(translate)
    ctx.translate(this.data.centerPoint.x, this.data.centerPoint.y)
    ctx.setTransform(scale, 0, 0, scale, this.data.translateX + this.data.centerPoint.x, this.data.translateY + this.data.centerPoint.y);
    ctx.rotate(rotate)
    this.initMapFont();
    // ctx.translate(translate.x, translate.y)
    ctx.draw();
  },
  initMapCenterPoint: function (offestMap, scaleMap) {
    let offest = offestMap && offestMap.x ? offestMap :  {x: 0, y: 0}; // 偏移量初始化
    let scale = scaleMap ? scaleMap : 1; // 放大倍数初始化
    let centerPoint = { x: 0, y: 0 }; // 中心点声明
    // if (this.data.firstLoad) {
    //   centerPoint.x = (this.data.mapCavasW + offest.x) * scale;
    //   centerPoint.y = (this.data.mapCavasH + offest.y - 20) * scale;
    // } else {
    //   centerPoint.x = offest.x * scale;
    //   centerPoint.y = (offest.y - 20) * scale;
    // }
    centerPoint.x = (this.data.mapCavasW / 2 + offest.x) * scale;
    centerPoint.y = (this.data.mapCavasH / 2 + offest.y - 20) * scale;
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
      this.getScale(e.touches)
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
    // buildInfo.forEach((item, index) => {
    //   item.position[2] += moveX;
    //   item.position[3] += moveY;
    // })
    // 更新地图
    // this.initMap();
    this.initMapCenterPoint({x: moveX, y: moveY}, this.data.scale)
    this.changeMap(this.data.scale, this.data.rotate, { x: moveX, y: moveY })
  },
  // 控制地图缩放
  getScale: function(touches) {
    
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

    let singleScale; // 单次放大缩小值
    
    // ----------------start放大地图------------------
    // 判定手势是放大还是缩小
    if (moveScale > startScale) { // 放大手势 单次放大缩小倍数在[1.7, -1.7]
      singleScale = (moveScale / this.data.mapCavasW) * 1.7;
      // console.log('放大手势:' + scale);
    } else {
      singleScale = ((moveScale - startScale) / this.data.mapCavasW) * 1.7 + 1;
      // console.log('缩小手势:' + scale);
    }

    // console.log('singleScale:' + singleScale);
    // 地图放大倍数
    this.data.scale = singleScale;
    // ----------------end放大地图------------------

    let singRoate;  // 单次旋转值
    // ----------------start旋转地图------------------
    let startRadian = 0, moveRadian = 0;
    if (scaleX == 0) { // 排除手指之间线段完全竖直
      moveRadian = Math.PI / 2;
    } else {
      let moveRoate = Math.abs(scaleY / scaleX);
      moveRadian = Math.atan(moveRoate);
    }
    if (startScaleX == 0) { // 排除手指之间线段完全竖直
      startRadian = Math.PI / 2;
    } else {
      let startRoate = Math.abs(startScaleY / startScaleX);
      startRadian = Math.atan(startRoate);
    }

    // singRoate 为单次旋转值单位是弧度， 若值为正，则方向为逆时针， 反之，则为顺时针
    singRoate = moveRadian - startRadian;
    if (singRoate > this.data.singleMaxRoate) {
      singRoate = this.data.singleMaxRoate;
    } else if (singRoate < -this.data.singleMaxRoate) {
      singRoate = -this.data.singleMaxRoate
    }
    // console.log('singRoate' +  singRoate + "this.data.rotate:" +  this.data.rotate);
    this.setData({
      rotate: singRoate + this.data.rotate
    })
    console.log('startRadian:' + startRadian + ', moveRadian:' + moveRadian );
    console.log('目前旋转值:' + this.data.rotate);
    // ----------------end旋转地图------------------

    // 放大地图
    this.controlScaleMap();
    // 旋转地图
    this.controlRotateMap();
  },
  controlScaleMap: function (singleScale) {
    if (singleScale) {
      this.setData({
        scale: singleScale
      })
    }
    let buildInfo = this.data.buildInfo;
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

    let newPostionX, newPostionY;
    if (this.data.ruleWidth * scale > this.data.rule * 3 || this.data.ruleWidth * scale < this.data.rule * 0.5) { // 设置地图缩放界限
      return
    } else {
      this.setData({
        ruleWidth: this.data.ruleWidth * scale
      })
    }
    /*
    // 固定canvas 改变建筑物坐标与大小实现放大缩小
    if (this.data.ruleWidth)
      // 地图放大中心点
      let centerPoint = {
        x: this.data.centerPoint.x,
        y: this.data.centerPoint.y
      }
      buildInfo.forEach((item, index) => {

        // 建筑物大小放大缩小
        item.position[0] *= scale;
        item.position[1] *= scale;
        // 建筑物位置放大缩小
        let a = Math.abs(centerPoint.x - item.position[2]); // a为距离中心点横向距离
        let b = Math.abs(centerPoint.y - item.position[3]); // b为距离中心点纵向距离
        if (item.position[2] <= centerPoint.x && item.position[3] < centerPoint.y) { // 第二象限
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
       */
    // 更新地图
    // this.initMap();
    this.initMapCenterPoint({}, scale);
    this.changeMap(scale, this.data.rotate, {x:0,y:0});
    
  },
  controlRotateMap: function(rotate) {
    let curRotate = rotate? rotate : 0
    this.setData({
      rotate: curRotate + this.data.rotate
    })
    this.initMapCenterPoint({}, this.data.scale);
    this.changeMap(this.data.scale, this.data.rotate, { x: 0, y: 0 });
  },
  addScale: function() {
    this.controlScaleMap(1.1)
    // this.controlRotateMap(0.1);
  },
  minuScale: function() {
    this.controlScaleMap(0.9)
    // this.controlRotateMap(-0.1);
  }
})