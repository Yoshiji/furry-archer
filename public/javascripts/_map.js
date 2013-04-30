Map = (function(){

	function Map() {
		var canvasElement = document.getElementById('game_board');

    // Scene
		sheetengine.scene.init(canvasElement, {w: 2000, h: 2000});
    sheetengine.scene.tilewidth = 50; // Usefull ? Does not seem to affect anything
    sheetengine.scene.setCenter({x: 0, y: 0, z: 0});

    // Canvas
    sheetengine.canvas.width = sheetengine.canvas.clientWidth;
    sheetengine.canvas.height = sheetengine.canvas.clientHeight;

    // Context
		var zoom = 1;
		sheetengine.context.scale(zoom,zoom);
		sheetengine.context.translate(-sheetengine.canvas.clientWidth/(2*zoom)*(zoom-1),-sheetengine.canvas.clientHeight/(2*zoom)*(zoom-1));

    // Tiles
		this.tiles = [];
    for (var x=-10; x<=10; x++) {
      for (var y=-10; y<=10; y++) {
      	var tile = new Tile(x, y);
      	this.tiles.push(tile);
      }
    }

    // Calculate & Render
    sheetengine.calc.calculateAllSheets();
    sheetengine.drawing.drawScene(true);
	}

	Map.prototype.init = function() {

	}

	return Map;
})();