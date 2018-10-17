function DrawRoad(ctx, roadList) {
	this.ctx = ctx;
	this.roadList = roadList;
}

DrawRoad.prototype = {
	draw: function() {
		this.ctx.beginPath();
		this.ctx.lineWidth = "10";
		this.ctx.storkeStyle = 'block';
		this.ctx.moveTo(this.roadList[0].roadX, this.roadList[0].roadY);
		let i = 1;
		for(i; i < this.roadList.length; i++) {
			console.log('绘制点:' ,i)
			this.ctx.lineTo(this.roadList[i].roadX, this.roadList[i].roadY);
		}
		if (i === this.roadList.length) {
			this.ctx.stroke();
			
		}
	}
}
