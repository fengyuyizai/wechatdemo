function buildInfo() {
  const data = {
    roadtree: {
      treeID: 1,
      row: 10,
      col: 10,
      floorID: 1
    },
    areas: [
      {
        areaID: '1',
        areaName: 'A建筑物',
        areaX: 0,
        areaY: 0,
        areaWidth: 500,
        areaHeight: 284.4,
        aboutRoadId: 35,
        areaColor: 'red',
        floorID: 12,
        canFind: true,
        categoryId: 1,
        categoryName: "办公区"
      }, {
        areaID: '2',
        areaName: 'B建筑物',
        areaX: 0,
        areaY: 521.4,
        areaWidth: 500,
        areaHeight: 284.4,
        aboutRoadId: 35,
        areaColor: 'yellow',
        floorID: 12,
        canFind: true,
        categoryId: 1,
        categoryName: "办公区"
      }, {
        areaID: '3',
        areaName: 'C建筑物',
        areaX: 0,
        areaY: 1137.6,
        areaWidth: 500,
        areaHeight: 284.4,
        aboutRoadId: 35,
        areaColor: '#9cffb8',
        floorID: 12,
        canFind: true,
        categoryId: 1,
        categoryName: "办公区"
      }, {
        areaID: '4',
        areaName: 'D建筑物',
        areaX: 0,
        areaY: 1635.3,
        areaWidth: 806,
        areaHeight: 284.4,
        aboutRoadId: 35,
        areaColor: '#84b8ff',
        floorID: 12,
        canFind: true,
        categoryId: 1,
        categoryName: "办公区"
      }
    ]
  }
  
  
  return data;
}

module.exports= {
  buildInfo
}