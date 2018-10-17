/* 
	路线信息规划
*/

function PlanWayModal(HTMLElement) {
	this.planWayModalElement = HTMLElement;
	this.planWayShow = false;
}

PlanWayModal.prototype = {
	setPlanWayModal: function(startPoint, endPoint) {
		const curDom = this.planWayModalElement.children[0];
		let startPointTitle = startPoint.title ? startPoint.title : '起点搜索';
		let endPointTitle = endPoint.title ? endPoint.title : '终点搜索';
		curDom.children[1].innerHTML = `<div>${startPoint.floor}  ${startPointTitle}</div>`;
		curDom.children[2].innerHTML = `<div>${endPoint.floor}  ${endPointTitle}</div>`;
		this.planWayModalShow();
	},

	planWayModalShow: function() {
		this.planWayShow = true;
		this.planWayModalElement.style.bottom = '0rem';
	},

	planWayModalHide: function() {
		this.planWayShow = false;
		this.planWayModalElement.style.bottom = '-16.91rem';
	}
}