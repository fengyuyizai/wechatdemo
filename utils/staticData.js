
let article_Data = articleData();
const searchCode = code => {
  // console.log(article_Data)
  // result = article_Data.list.filter((item, index) => {
  //   return item.code === code;
  // })
  for (let i = 0; i < article_Data.list.length; i++) {
    let item = article_Data.list[i];
    if(item.code === code) {
      // console.log("item:" + item);
      return item;
    }
  }
  return {}
}

function articleData()  {
  var arr = {
    list: [
      {
        title: '党的进程',
        imgUrl: '../image/img1.jpg',
        message: '学习党的政策，体察民生福祉学习党的政策，体察民生福祉学习党的政策，体察民生福祉学习党的政策，体察民生福祉XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXawfawegfawegawegwaEGARGEWGAWEGXXXXXXXXXXXXXXXXXX',
        code: '0001'
      },
      {
        title: '标题2',
        imgUrl: '../image/img2.png',
        message: '学习党的政策，体察民生福祉',
        code: '0002'
      },
      {
        title: '标题3',
        imgUrl: '../image/img3.png',
        message: '学习党的政策，体察民生福祉',
        code: '0003'
      },
      {
        title: '标题4',
        imgUrl: '../image/img4.jpg',
        message: '学习党的政策，体察民生福祉',
        code: '0004'
      }
    ]
  }

  return arr;
}


module.exports = {
  articleData: articleData,
  searchCode: searchCode
}