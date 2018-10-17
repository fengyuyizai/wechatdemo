const app = getApp();
const stateData = require('../../utils/buildInfo.js');
const stateRoadList = require('../../utils/roadList.js');
const stateQuickPositionList = require('../../utils/quickPosition.js');

const ctx = wx.createCanvasContext('mapCanvas');


const modalAnimation = wx.createAnimation({
  transformOrigin: "50% 50%",
  duration: 400,
  timingFunction: "linear",
  delay: 0
});

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
    buildInfo: stateData.buildInfo(), // 地图数据
    roadList: stateRoadList.roadList(), // 路网数据
    quickPositionList: stateQuickPositionList.quickPositionList(), // 快速选择模态框数据
    touchStart: null,
    centerPoint: { // 地图放大缩小旋转中心点
      x: 0,
      y: 0
    },
    touchLock: 1, // 双指单指切换时间间隔锁
    translateX: 0, // 横向移动地图偏移量
    translateY: 0, // 纵向移动地图偏移量
    scale: 1, // 放大倍数
    singleScale: 0,
    maxScale: 2, // 放大最大倍数
    minScale: 0.5, // 缩小最小倍数
    singleMaxScale: 0.1, // 单次放大最大倍数
    singleMinScale: -0.05, // 单次缩小最小倍数
    rotate: 0, // 旋转值
    singleMaxRoate: 0.03,
    floorAnimationData: {},
    floorTouchStart: null,
    floorMove: 0,
    stepPoint: 0, // 记录导航进行的步骤
    startPointPosition: null, // 导航起始点坐标
    endPointPosition: null, // 导航终点坐标集合
    showComeHereModel: false,
    comeHereModelAnimation: {},
    showPlanWayModel: false,
    planWayModelAnimation: {},
    showQuickPositionModel: false,
    showQuickPositionAnimation: {},
    quickPositionTextbgm: ['#11daa4', '#4bd5ec'],
    quickContentMoveY: 0, // 记录快速选择模态框内部滚动值
    beforeQuickContentMoveY: 0, // 记录上一次快速选择模态框内部滚动值
    quickTouchStartData: null,
    quickTouchMoveData: null,
    quickModelHeight: 0 // 当前快速选择模态框内部内容高度
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

    this.initMapCenterPoint(0, this.data.scale);
    this.initMap();
    // this.changeMap(this.data.scale, this.data.rotate, { x: 0, y: 0 })
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

    compass.rotate(0).step();
    this.setData({
      compassData: compass.export()
    });

    this.floorAnimation = compass;
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
    offestX = this.data.centerPoint.x;
    offestY = this.data.centerPoint.y;
    // console.log('offest:' + offestX + "," + offestY);
    const self = this;
    this.data.buildInfo.areas.forEach((item, index) => {
      
      ctx.setFillStyle(item.areaColor);
      ctx.fillRect(item.areaX - offestX, item.areaY - offestY, item.areaWidth, item.areaHeight);
      ctx.setFillStyle("#fff");

      const fontX = item.areaWidth / 2 + item.areaX - offestX;
      const fontY = item.areaHeight / 2 + item.areaY - offestY;
      const fontMaxX = item.areaWidth / 1.5;
      const fontBackgroundW = item.areaName.length * 20;
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
      ctx.fillText(item.areaName, fontX, fontY, fontMaxX);

    }); 
  },
  // 数据统计完毕之后调用改函数，对地图进行重新绘制
  changeMap: function(scale, rotate, translate) {
    // translate.x *= scale; // 对横轴偏移量进行计算
    // translate.y *= scale; // 对纵轴偏移量进行计算
    this.setData({
      translateX: this.data.translateX + translate.x,
      translateY: this.data.translateY + translate.y
    })
    // console.log(translate)
    // console.log(this.data.centerPoint.x  + "," + this.data.centerPoint.y)
    // 移动&&放大
    
    console.log('改动地图：' + scale)
    ctx.setTransform(scale, 0, 0, scale, this.data.centerPoint.x  + this.data.translateX, this.data.centerPoint.y + this.data.translateY);
    // console.log( this.data.mapCavasW * (scale - 1) + ',' + -this.data.mapCavasH * (scale - 1))
    // 旋转
    ctx.rotate(rotate)
    // ctx.translate(this.data.centerPoint.x, this.data.centerPoint.y)
    // ctx.translate(this.data.mapCavasW / 2, this.data.mapCavasH / 2)
    this.initMapFont();

    // 标记终点
      this.data.endPointPosition ? this.setEndPoint() : '';
    // 标记起点
      this.data.startPointPosition ? this.setStartPoint() : '';
    
    // console.log(this.data.endPointPosition);

    ctx.draw();
  },
  // 初始化中心点
  initMapCenterPoint: function (offestMap, scaleMap) {
    let offest = offestMap && offestMap.x ? offestMap :  {x: 0, y: 0}; // 偏移量初始化
    let scale = scaleMap ? scaleMap : 1; // 放大倍数初始化
    let centerPoint = { x: 0, y: 0 }; // 中心点声明
    centerPoint.x = this.data.mapCavasW / 2;
    centerPoint.y = this.data.mapCavasH / 2;
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
    console.log(e);
    this.setData({
      touchStart: e.touches
    })
  },
  touchmove: function(e) {
    
    if(e.touches.length === 1 && this.data.touchLock == 1) {
      this.mapMove(e.touches);
      
    } else if(e.touches.length === 2) {
      this.getScale(e.touches)
      this.setData({
        touchLock: 2
      })
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

    // 更新地图
    this.initMapCenterPoint({x: moveX, y: moveY}, this.data.scale)
    this.changeMap(this.data.scale, this.data.rotate, { x: moveX, y: moveY })
  },
  touchend: function(e) {
    if (this.data.singleScale) {
      this.setData({
        scale: this.data.singleScale + this.data.scale,
        singleScale: 0
      })
    }
    let TouchMistake = setTimeout(()=> {
      this.setData({
        touchLock: 1
      })
      clearTimeout(TouchMistake);
    }, 400)
  },
  touchtap: function(e) {
    console.log('touchTap');
    const coordinates = {
      x: this.data.touchStart[0].x - this.data.translateX,
      y: this.data.touchStart[0].y - this.data.translateY,
      img: '',
      title: '未知地点'
    }
    const point = this.findNearRoadPoint(coordinates);
    this.markPosition(point, this.data.stepPoint);
  },
  // 标记地图起点、终点
  markPosition: function(point, step) {
    console.log('进行步骤' + step)
    switch (step) {
      case 0: // 标记终点
        console.log('标记终点')
        const firstLock = this.data.showComeHereModel;
        this.setData({
          endPointPosition: point,
        })
        this.changeMap(this.data.scale, this.data.rotate, { x: 0, y: 0 }); // 绘制背景
        if (!firstLock) { // 首次点击终点加载动画
          const moveY = this.rpxToPx(370); // rpx => px
          console.log(moveY);
          this.showModal('comeHereModelAnimation', 'showComeHereModel', moveY);
        }
        break;
      case 1: // 标记起点
        console.log('标记起始点')
        this.setData({
          startPointPosition: point
        })
        this.changeMap(this.data.scale, this.data.rotate, { x: 0, y: 0 })
        break;
    }
  },

  showModal: function (modalAnimationName, showModelName,  moveY) {
    // console.log('')
    this.setData({
      [showModelName]: true
    })

    modalAnimation.translateY(-moveY).step()
    this.setData({
      [modalAnimationName]: modalAnimation.export()
    })
  },

  hideModal: function (modalAnimationName, showModelName , moveY) {
    modalAnimation.translateY(-moveY).step()
    this.setData({
      [modalAnimationName]: modalAnimation.export()
    })
    setTimeout(()=> {
      this.setData({
        [showModelName]: false
      })
    }, 500)
  },

  backStep: function(e) {
    this.setData({
      stepPoint: this.data.stepPoint -1
    })
    let point;
    switch(this.data.stepPoint) {
      case 0: 
        point = Object.assign({}, this.data.endPointPosition);
        this.hideModal('planWayModelAnimation', 'showPlanWayModel', 0);
        const moveY = this.rpxToPx(370); // rpx => px
        this.showModal('comeHereModelAnimation', 'showComeHereModel', moveY)
        break;
      case 1: point = Object.assign({}, this.data.startPointPosition); break;
    }
    this.markPosition(point, this.data.stepPoint);
  },

  toPlanWay: function(e) {
    this.setData({
      stepPoint: 1
    })
    this.hideModal('comeHereModelAnimation', 'showComeHereModel', 0);
    const moveY = this.rpxToPx(423);
    this.showModal('planWayModelAnimation', 'showPlanWayModel', moveY)
  },

  setEndPoint: function () {
    const endPointIcon = '../../state/images/endPoint.png';
    const imagePosition = {
      x: (this.data.endPointPosition.x - 13 - this.data.centerPoint.x) / this.data.scale,
      y: (this.data.endPointPosition.y - 43 - this.data.centerPoint.y) / this.data.scale
    }
    ctx.drawImage(endPointIcon, imagePosition.x, imagePosition.y);
  },

  setStartPoint: function() {
    const startPointIcon = '../../state/images/startPoint.png';
    ctx.drawImage(startPointIcon, this.data.startPointPosition.x - 13 - this.data.centerPoint.x, this.data.startPointPosition.y - 43 - this.data.centerPoint.y);
  },

  selectStartPoint() {
    this.showQuickPosition();
  },

  findNearRoadPoint(point) {
    let minDistance = 999999999;
    let minPoint = JSON.parse(JSON.stringify(point));
    let seachBuildResult = false
    let seachBuildRoadID = 0;
    // console.log('起始点：' + JSON.stringify(minPoint))
    this.data.buildInfo.areas.forEach((buildItem, buildIndex) => {
      if (buildItem.areaX < point.x && buildItem.areaY < point.y  && buildItem.areaWidth > point.x - buildItem.areaX && buildItem.areaHeight > point.y - buildItem.areaY) {
        minPoint.x = buildItem.areaX + buildItem.areaWidth / 2;
        minPoint.y = buildItem.areaY + buildItem.areaHeight / 2;
        minPoint = Object.assign(minPoint, buildItem);
        seachBuildResult = true;
        seachBuildRoadID = buildItem.aboutRoadId;
        console.log('findRoadPoint' + JSON.stringify(minPoint));
      }
    })
    this.data.roadList.roadPoint.forEach((roaditem, colCount) => {
      roaditem.forEach((item, rowCount) => {
        // console.log(item)
        if (seachBuildResult) {
          if (item.roadId == seachBuildRoadID){
            minPoint.colCount = colCount;
            minPoint.rowCount = rowCount;
          }
        } else {
          const distance = Math.abs(Math.sqrt(Math.pow(item.roadX * this.data.scale - point.x, 2) + Math.pow(item.roadY * this.data.scale - point.y, 2)));
          // console.log(distance)
          if (distance < minDistance) {
            minDistance = distance;
            minPoint.x = item.roadX;
            minPoint.y = item.roadY;
            minPoint.colCount = colCount;
            minPoint.rowCount = rowCount;
            minPoint = Object.assign(minPoint, item);
            // console.log('minPoint:' + JSON.stringify(minPoint));
            console.log('distance' + distance)
          }
        }
      })
    })
    seachBuildResult = false
    // console.log('minPoint:' + JSON.stringify(minPoint.x + canvasDom.width / 2) + ',' + JSON.stringify(minPoint.y + canvasDom.height / 2));
    console.log(minPoint);
    return minPoint;
  },
  // 控制快速选择地址模态框弹出弹回
  showQuickPosition: function (event) {
    console.log(event);
    if (this.data.showQuickPositionModel || (event && event.target.dataset.hide)) {
      this.hideModal('showQuickPositionAnimation', 'showQuickPositionModel', 0)
    } else {
      const moveY = this.rpxToPx(740);
      this.showModal('showQuickPositionAnimation', 'showQuickPositionModel', moveY)
    }

    if (this.data.showQuickPositionModel) {
      //创建节点选择器
      var query = wx.createSelectorQuery();
      //选择id
      query.select('#quickContent').boundingClientRect()
      query.exec( (res) => {
        //res就是 所有标签为mjltest的元素的信息 的数组
        console.log(res);
        //取高度
        console.log(res[0].height);
        this.setData({
          quickModelHeight: res[0].height
        })
      });
    }
  },
  // 快速选择模态框中某一个地址被选中
  selectPosition: function(event) {
    if (event && !event.target.dataset.position) {
      console.error("改选项框内容未获取到或值为空");
      return
    }
    console.log(event.target.dataset.position);
    let point = Object.assign({}, event.target.dataset.position);
    point.x = point.areaX + point.areaWidth / 2;
    point.y = point.areaY + point.areaHeight / 2;
    this.hideModal('showQuickPositionAnimation', 'showQuickPositionModel', 0)
    this.markPosition(point, 1)
  },
  // 快速选择模态框滚动---记录手指起始
  quickTouchStart: function(event) {
    this.setData({
      quickTouchStartData: event.touches[0]
    })
    // console.log(event.touches[0])
  },
  // 快速选择模态框滚动---记录手指移动
  quickTouchMove: function(event) {
    const touchMove = event.touches[0];
    // console.log(touchMove)
    const moveY = touchMove.clientY - this.data.quickTouchStartData.clientY;
    console.log(this.data.beforeQuickContentMoveY + moveY);
    // 如果滚动距离大于隐藏距离，则不允许滚动
    if (Math.abs(this.data.beforeQuickContentMoveY + moveY) > this.data.quickModelHeight - this.rpxToPx(740) || this.data.beforeQuickContentMoveY + moveY >= 0) {
      // console.log('限制移动')
      return
    }
    this.setData({
      quickContentMoveY: moveY + this.data.beforeQuickContentMoveY
    })
  },
  // 快速选择模态框滚动---记录手指离开
  quickTouchEnd: function(event) {
    this.setData({
      beforeQuickContentMoveY: this.data.quickContentMoveY
    })
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
      console.log('放大手势:' + singleScale);
    } else {
      singleScale = ((moveScale - startScale) / this.data.mapCavasW) * 1.7;
      console.log('缩小手势:' + singleScale);
    }
    // this.setData({
    //   scale: singleScale + this.data.scale
    // })
    // 地图单次倍数限制
    // if (singleScale >= this.data.singleMaxScale) {
    //   singleScale = this.data.singleMaxRoate;
    // } else if (singleScale <= this.data.singleMinScale) {
    //   singleScale = this.data.singleMinScale;
    // }
    // 地图放大倍数
    this.setData({
      singleScale : singleScale
    })
    // ----------------end放大地图------------------

    let singRoate;  // 单次旋转值
    // ----------------start旋转地图------------------
    /* 
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
    */
    // 放大地图
    this.controlScaleMap(singleScale);
    // 旋转地图
    // this.controlRotateMap();
  },
  controlScaleMap: function (singleScale) {
    
    let buildInfo = this.data.buildInfo;
    // 地图总倍数限制
    // if (this.data.scale >= this.data.maxScale) {
    //   this.setData({
    //     scale: this.data.maxScale
    //   })
    // } else if (this.data.scale <= this.data.minScale) {
    //   this.setData({
    //     scale: this.data.minScale
    //   })
    // }
    let scale = this.data.scale;
    console.log('scale:' + scale);

    let newPostionX, newPostionY;
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
        item.areaWidth *= scale;
        item.areaHeight *= scale;
        // 建筑物位置放大缩小
        let a = Math.abs(centerPoint.x - item.areaX); // a为距离中心点横向距离
        let b = Math.abs(centerPoint.y - item.areaY); // b为距离中心点纵向距离
        if (item.areaX <= centerPoint.x && item.areaY < centerPoint.y) { // 第二象限
          newPostionX = centerPoint.x - a * scale;
          newPostionY = centerPoint.y - b * scale;
        } else if (item.areaX > centerPoint.x && item.areaY <= centerPoint.y) { // 第一象限
          newPostionX = centerPoint.x + a * scale;
          newPostionY = centerPoint.y - b * scale;
        } else if (item.areaX >= centerPoint.x && item.areaY > centerPoint.y) { // 第四象限
          newPostionX = centerPoint.x + a * scale;
          newPostionY = centerPoint.y + b * scale;
        } else if (item.areaX < centerPoint.x && item.areaY >= centerPoint.y) { // 第三象限
          newPostionY = centerPoint.y + b * scale;
          newPostionX = centerPoint.x - a * scale;
        } else if (item.areaX == centerPoint.x && item.areaY == centerPoint.y) { // 坐标原点
          newPostionX = centerPoint.x;
          newPostionY = centerPoint.y
        }
        item.areaX = newPostionX;
        item.areaY = newPostionY;
      })
       */
    // 更新地图
    // this.initMap();
    this.initMapCenterPoint({}, scale);
    this.changeMap(this.data.scale + singleScale, this.data.rotate, {x:0,y:0});
    
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
    this.controlScaleMap(0.5)
    // this.controlRotateMap(0.1);
  },
  minuScale: function() {
    this.controlScaleMap(-0.5)
    // this.controlRotateMap(-0.1);
  },
  rpxToPx: function(rpxCount) { // rpx转化为px,用于动画移动单位计算
    return rpxCount * this.data.mapCavasW / 750;
  }
})