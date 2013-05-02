Map = (function(){

	function Map() {
    Crafty.init();
    Crafty.canvas.init();
    var iso = Crafty.diamondIso.init(64,128,40,20);
    for(var i = 0; i < 10; i++) {
      for(var j = 0; j < 10; j++) {
        var myEnt = Crafty.e("2D, Canvas, Tile, Color").color("green").attr({w: 64, h: 64});
        iso.place(myEnt, i, j);
      }
    }
	}



  Map.prototype.only_for_sheetengine = function() {
    var canvasElement = document.getElementById('game_board');
    // Constants for the game_view
    BACKGROUND_BUFFER_SIZE = { w: 2000, h: 2000 };
    TILE_WIDTH = 100;
    this.tiles = [];

    // Scene
    sheetengine.scene.init(canvasElement, BACKGROUND_BUFFER_SIZE);
    sheetengine.scene.tilewidth = TILE_WIDTH; // Usefull ? Does not seem to affect anything
    sheetengine.scene.setCenter({x: 0, y: 0, z: 0});

    // Canvas
    sheetengine.canvas.width = sheetengine.canvas.clientWidth;
    sheetengine.canvas.height = sheetengine.canvas.clientHeight;

    // Context
    var zoom = 1;
    sheetengine.context.scale(zoom,zoom);
    sheetengine.context.translate(-sheetengine.canvas.clientWidth/(2*zoom)*(zoom-1),-sheetengine.canvas.clientHeight/(2*zoom)*(zoom-1));

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