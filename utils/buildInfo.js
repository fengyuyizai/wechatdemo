function buildInfo() {
  const data = [
    {
      id: '1',
      name: 'A',
      position: [100, 100, 0, 0],
      color: 'red',
      info: '',
      road:[
        {
          point: [0,0]
        }
      ]
    }, {
      id: '2',
      name: 'B建筑物',
      position: [100, 200, 0, 150],
      color: 'yellow',
      info: '',
      road: [
        {
          point: [0, 0]
        }
      ]
    }, {
      id: '3',
      name: 'C建筑物',
      position: [100, 200, 0, 400],
      color: '#9cffb8',
      info: '',
      road: [
        {
          point: [0, 0]
        }
      ]
    }, {
      id: '4',
      name: 'D建筑物',
      position: [100, 180, 120, 30],
      color: '#84b8ff',
      info: '',
      road: [
        {
          point: [0, 0]
        }
      ]
    }, {
      id: '5',
      name: 'E建筑物',
      position: [100, 180, 120, 260],
      color: '#ffa484',
      info: '',
      road: [
        {
          point: [0, 0]
        }
      ]
    }, {
      id: '6',
      name: 'F建筑物',
      position: [100, 100, 120, 480],
      color: '#84fff8',
      info: '',
      road: [
        {
          point: [0, 0]
        }
      ]
    }, {
      id: '7',
      name: 'G建筑物',
      position: [100, 140, 260, 0],
      color: '#a1a1ff',
      info: '',
      road: [
        {
          point: [0, 0]
        }
      ]
    }, {
      id: '8',
      name: 'H建筑物',
      position: [100, 200, 260, 180],
      color: '#f5a1ff',
      info: '',
      road: [
        {
          point: [0, 0]
        }
      ]
    }, {
      id: '9',
      name: 'I建筑物',
      position: [100, 160, 260, 420],
      color: '#a1cfff',
      info: '',
      road: [
        {
          point: [0, 0]
        }
      ]
    }
    
    
  ]
  return data;
}

module.exports= {
  buildInfo
}