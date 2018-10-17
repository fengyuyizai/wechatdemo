/* 
	到这里去 模态框
	第一次点击出终点，生成模态框
	关闭后再次点击调用已生成模态框
	htmlElement为生成父元素节点
*/



function ComeHereModal(HTMLElement) {
	this.ComeHereModalElement = HTMLElement;
	this.comeHereShow = false
}

ComeHereModal.prototype = {
	initComeHereModal:function () {
		if (typeof this.ComeHereModalElement !== 'object') {
			console.error('格式不正确')
			return
		}
		this.ComeHereModalElement.innerHTML = `    <div class="comeHereModal_contain">
	    <section class="body">
	      <div class="position"></div>
	      <div class="floor"></div>
	      <img class="comeHere-icon" src="static/images/comeHere.png" id="comeHere-icon">
	      <div class="shareFriend">
	        <p>发送位置给好友</p>
	      </div>
	    </section>
	  </div>`;

	},

	setComeHereModal:function (message) {
	const comeHereModal_containDom = document.getElementsByClassName('comeHereModal_contain')
		if (comeHereModal_containDom.length === 0) {
			return;
		}
		comeHereModal_containDom[0].children[0].children[0].innerText = message.title;
		comeHereModal_containDom[0].children[0].children[1].innerText = message.floor;

		this.comeHereModalDomShow();
	},

	getPointTitle:function (position) {
	  const selectBuild = buildData.data.filter((item, index) => {
	    return item.position[2] < position.x && item.position[3] < position.y && item.position[0] + item.position[2] > position.x && item.position[1] + item.position[3] > position.y
	  })[0];
	  console.log(selectBuild);
	  return selectBuild ? selectBuild.name : '未知区域';
	},

	comeHereModalDomShow:function () {
		this.comeHereShow = true;
		this.ComeHereModalElement.style.bottom = '0rem';
		moveContainToTop(15, this.comeHereShow);
	},

	comeHereModalDomHide:function () {
		console.log('收起模态框')
		this.comeHereShow = false;
		this.ComeHereModalElement.style.bottom = '-16rem';
		moveContainToTop(0, this.comeHereShow);
	}

}




