Tile = (function() {

	EXISTING_TILES = {}

	function Tile(x,y) {
		var basesheet = new sheetengine.BaseSheet({x:x*50,y:y*50,z:0}, {alphaD:90,betaD:0,gammaD:0}, {w:50,h:50});
    	basesheet.color = '#5D7E36';
    	if(x == 0 && y == 0) {
    		basesheet.color = '#DFFEFE';
    	}
    	this.basesheet = basesheet;

    	return this;
	};

	Tile.listTiles = function() {

	};

	Tile.prototype.init = function() {

	};

	return Tile;
})();