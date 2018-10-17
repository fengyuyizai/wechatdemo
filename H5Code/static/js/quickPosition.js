/* 
	动态生成quickPostion
*/

function QuickPosition(HTMLElement) {
	this.quickPositionElement = HTMLElement.children[0];
	this.quickPositionScall = null;
}

QuickPosition.prototype = {
	initQuickPostion:function () {
		if (typeof this.quickPositionElement !== 'object') {
			console.error('HTMLElement有问题');
			return;
		}
		// console.log(HTMLElement);
		// 生成dom
		
		appendChildNode(this.quickPositionElement, 'ul', '', 'class', 'content')
		quickPositionData.data.forEach((item, index) => {
			appendChildNode(this.quickPositionElement.children[0], 'li', '', 'class', 'quickPosition_item')
			const quickPosition_item = document.getElementsByClassName('quickPosition_item')[index];
			quickPosition_item.innerHTML = '<p>' +
	        	`<span class="title">${item.title}</span>`+
	        	`<span class="describe">${item.describe}</span>`+
	        	`<img class="down" src="static/images/down.png" onclick="quickPosition.showPostion(${index})">`+
	      	`</p>` +
	      	`<ul class="body"></ul>` ;

		  	const body = quickPosition_item.children[1];
		    item.list.forEach((t, i) => {
		      appendChildNode(body, 'li', t.name, 'onclick', `quickPosition.goJumpPosition(${t.position})`)
		    })
		})

		this.initQuickPostionScroll();
		
	},


	// 动态添加节点 参数: 父节点, 添加节点标签, 新节点内容， 事件类型（选），事件对应监听（选）
	appendChildNode:function (node, label, content, event, eventListener) {
	  const targetlabel=document.createElement(label);
	  const textnode=document.createTextNode(content);
	  if (event) {
	    targetlabel.setAttribute(event, eventListener);
	  }
	  targetlabel.appendChild(textnode);
	  node.appendChild(targetlabel);
	},

	goJumpPosition:function (positionX, positionY) {
		console.log(positionX + ',' + positionY)
	},

	initQuickPostionScroll:function () {
		// console.log(HTMLElement)
		this.quickPositionScall = new BScroll(this.quickPositionElement, {
		    scrollY: true,
		    click: true,
		    bounceTime: 400
		})
	},

	showPostion:function (index) {
		// console.log(index)
		const curPositioin = this.quickPositionElement.children[0].children[index];
		// console.log(curPositioin);
		if (curPositioin.children[1].style.display === 'none') {
			curPositioin.children[1].style.display = 'block';
		} else {
			curPositioin.children[1].style.display = 'none';

		}
		this.quickPositionScall.refresh();
		// this.initQuickPostionScroll();
		// showPostionSession = !showPostionSession;
	},
	quickPositionDomShow:function () {
	    keshiShow = true;
	    this.quickPositionElement.parentNode.style.display = 'block';
	    this.quickPositionScall.refresh();
	    setTimeout(() => {
	    	this.quickPositionElement.style.bottom = '3rem';

	    }, 150)
	   	
	},
   	quickPositionDomHide:function() {
	    keshiShow = false;
	    this.quickPositionElement.style.bottom = '-30rem';
	    setTimeout(() => {
	    	this.quickPositionElement.parentNode.style.display = 'none';
	    }, 500)
	}
}
