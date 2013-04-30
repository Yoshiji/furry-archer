Tile = (function() {

	EXISTING_TILES = {}

	function Tile(x,y) {
		var basesheet = new sheetengine.BaseSheet({x:x*200,y:y*200,z:0}, {alphaD:90,betaD:0,gammaD:0}, {w:200,h:200});
    	basesheet.color = '#5D7E36';
    	this.basesheet = basesheet;
    	this.coords = {x:x*200,y:y*200,z:0};

    	return this;
	};

	Tile.listTiles = function() {

	};

	Tile.prototype.init = function() {

	};

	return Tile;
})();


function init() {
   

   
 };

 init();