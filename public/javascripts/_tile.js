Tile = (function() {

	EXISTING_TILES = {}

	function Tile(x,y,w) {
		var basesheet = new sheetengine.BaseSheet({x:x,y:y,z:0}, {alphaD:90,betaD:0,gammaD:0}, {w:w,h:w});
  	basesheet.color = '#5D7E36';
  	if(x == 0 && y == 0) {
  		basesheet.color = '#DFFEFE';
  	}
  	this.basesheet = basesheet;
  	return this;
	};
	

	Tile.prototype.init = function() {

	};

	return Tile;
})();