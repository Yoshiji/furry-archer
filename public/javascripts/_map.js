Map = (function(){

	function Map() {
    var canvasElement = document.getElementById('game_board');
    // Constants for the game_view
    BACKGROUND_BUFFER_SIZE = { w: 2000, h: 2000 };
    TILE_WIDTH = 80;
    this.tiles = [];

    // Scene
    sheetengine.scene.init(canvasElement, BACKGROUND_BUFFER_SIZE);
    sheetengine.scene.tilewidth = TILE_WIDTH; // Usefull ? Does not seem to affect anything
    sheetengine.scene.setCenter({x: 0, y: 0, z: 0});

    // Canvas
    sheetengine.canvas.width = sheetengine.canvas.clientWidth;
    sheetengine.canvas.height = sheetengine.canvas.clientHeight;

    // Tiles generation
    var a = BACKGROUND_BUFFER_SIZE.w / TILE_WIDTH;
    a = Math.round( a / 2 );
    for (var x=-a; x<=a; x++) {
      for (var y=-a; y<=a; y++) {
        var tile = new Tile(x*TILE_WIDTH, y*TILE_WIDTH, TILE_WIDTH);
        this.tiles[x] = this.tiles[x] || [];
        this.tiles[x][y] = tile;
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