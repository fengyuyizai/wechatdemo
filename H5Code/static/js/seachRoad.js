/* 
  A*排序算法，
  返回最优路径点
*/


function Point(){
   this.x=0;
   this.y=0;
   this.G=0;//G值 开始点 到当前点的移动量
   this.H=0;//H值　当前点移动目的地的移动量估算值
   this.father=null;
};
Point.prototype={
   Console:function(){
       console.log("x:"+this.x+" and y:"+this.y);
   },
   Init:function(x,y,father){
       this.x=x;
       this.y=y;
       this.father=father;
   }
};
function AStar(){
   //地图存放二维数组
   this.map=[];
   //行数
   this.rowCount=0;
   //列数
   this.colCount=0;
   //出发点
   this.startPoint=new Point();
   //终点
   this.endPoint=new Point();
   //存放Opint类的open数组
   this.openList=[];
   //存在Opint类的close数组
   this.closeList=[];
};
AStar.prototype={
   //是否为障碍物
   IsBar:function(x,y){
       if(this.map[x][y].static == 3){
           console.log("bar...");
           return true;
       }
       else{
           console.log("no bar...")
           return false;
       }
   },
   //当前坐标是否在OpenList
   IsInOpenList:function(x,y){
        for(var i=0;i<this.openList.length;i++){
            if(this.openList[i].x==x&&this.openList[i].y==y){
                return true;
            }
        }
       return false;
   },
   //当前坐标是否在CloseList
   IsInCloseList:function(x,y){
       for(var i=0;i<this.closeList.length;i++){
           if(this.closeList[i].x==x&&this.closeList[i].y==y){
               return true;
           }
       }
       return false;
   },
   //计算G值;(p是Point类)
   GetG:function(p){
       if(p.father==null){
           return 0;
       }
       return p.father.G+1;
   },
   //计算H值
   GetH:function(p,pb){
       return Math.abs(p.x-pb.x)+Math.abs(p.y-pb.y) * 1.01;
   },
   //添加当前点的上下左右相邻的方格到Open列表中
   AddNeiToOpenList:function(curPoint){
       for(var x=curPoint.x-1;x<=curPoint.x+1;x++){
            for(var y=curPoint.y-1;y<=curPoint.y+1;y++){
                //排除自身以及超出下标的点
                if((x>=0&&x<this.colCount&&y>=0&&y<this.rowCount)&&!(curPoint.x==x&&curPoint.y==y)){
                    //排除斜对角
                    if(Math.abs(x-curPoint.x)+Math.abs(y-curPoint.y)==1){
                        //不是障碍物且不在关闭列表中
                        if(this.IsBar(x,y)==false&&this.IsInCloseList(x,y)==false){
                            //不存在Open列表
                            if(this.IsInOpenList(x,y)==false){
                                var point=new Point();
                                point.x=x;
                                point.y=y;
                                point.father=curPoint;
                                point.G=this.GetG(point);
                                point.H=this.GetH(point,this.endPoint);
                                this.openList.push(point);
                            }
                        }
                    }
                }
            }
       }
   },
   //在openlist集合中获取G+H为最小的Point点
   GetMinFFromOpenList:function(){
       var minPoint=null;
       var index=0;
       for(var i=0;i<this.openList.length;i++){
           if(minPoint==null||minPoint.G+minPoint.H>=this.openList[i].G+this.openList[i].H){
               minPoint=this.openList[i];
               index=i;
           }
       }
       return{
           minPoint:minPoint,
           index:index
       }
   },

   GetPointFromOpenList:function(x,y){
       for(var i=0;i<this.openList.length;i++){
           if(this.openList[i].x==x&&this.openList[i].y==y){
               return this.openList[i];
           }
       }
       return null;

   },
   //开始寻找节点
   FindPoint:function(){
       // console.log(this);
       this.openList.push(this.startPoint);
       console.log('findPoint:' + JSON.stringify(this.startPoint));
       while(this.IsInOpenList(this.endPoint.x,this.endPoint.y)==false||this.openList.length==0){
           var curPoint=this.GetMinFFromOpenList().minPoint;
           console.log("curPoint:"+ JSON.stringify(curPoint));
           var index=this.GetMinFFromOpenList().index;
           if(curPoint==null){
               console.log("没有路");
               return;
           }
           this.openList.splice(index,1);
           this.closeList.push(curPoint);
           this.AddNeiToOpenList(curPoint);
       }
       var p=this.GetPointFromOpenList(this.endPoint.x,this.endPoint.y);
       // console.log(p+".....");
       while(p.father!=null){
           p= p.father;
           console.log("father..");
           this.map[p.x][p.y].static=4;
       }
       //把终结点也设置成4
       this.map[this.endPoint.x][this.endPoint.y].static=4;
   },
   PrintMap:function(){

   }


};
//地图类    map数组保存数字标识 :0 默认　1 开始点　2 结束点　3 障碍物
function Map(){
   this.map = [];
   this.colCount = 0;
   this.rowCount = 0;
}
Map.prototype={
   init:function(){
      // console.log('ffff:' + JSON.stringify(buildData.road))
      this.map = roadPointdata.roadPoint.filter((item) => {
        return item;
      })
      // console.log('ffff:' + JSON.stringify(this.map))
   },
   drawMap:function(colCount, rowCount, step){
      // div.onclick=callback;
      
   },
   drawPoints:function(){
    let resultRoad = [];
    console.log('寻路结果：')
      for(let i=0;i<this.map.length;i++){
        for(let j = 0; j < this.map[i].length; j++) {
          if(this.map[i][j].static==4){
            resultRoad.push(this.map[i][j]);
               console.log(this.map[i][j])
           }
        }
      }
      return resultRoad;
   },
   getPoint:function(colIndex,rowIndex){
       return this.map[colIndex][rowIndex];
   },
   setStartPoint:function(colIndex,rowIndex){
       this.map[colIndex][rowIndex].static=1;
   },
   setEndPoint:function(colIndex,rowIndex){
       this.map[colIndex][rowIndex].static=2;
   },
   setBarPoint:function(colIndex,rowIndex){
       this.map[colIndex][rowIndex].static=3;
   },
   clearMap:function(){
       this.map.splice(0,this.map.length);
   }
}

var curMap=new Map();
var aStar=new AStar();//寻路类


function createMap() {
  
   curMap.clearMap();
   curMap.init();
   aStar.map=curMap.map;
   aStar.colCount=curMap.map.length;
   aStar.rowCount=curMap.map[0].length;
}

function setNavigationPoint(step, colIndex, rowIndex) {
  // console.log(typeof curMap.getPoint(colIndex,rowIndex) == 'object');

  if(typeof curMap.getPoint(colIndex,rowIndex) != 'object'){
    console.log('该点非法')
    return;
  }
  switch(step) {
    case 1: 
      curMap.setStartPoint(colIndex,rowIndex);
      aStar.startPoint.x=colIndex;
      aStar.startPoint.y=rowIndex;
      break;
    case 2:
      curMap.setEndPoint(colIndex,rowIndex);
      aStar.endPoint.x=colIndex;
      aStar.endPoint.y=rowIndex;
      break;
  }
}

function startFindPoint(){
   console.log(aStar.map);
   aStar.FindPoint();
   const result = curMap.drawPoints();
   return result;
}